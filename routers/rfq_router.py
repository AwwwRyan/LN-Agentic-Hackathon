from fastapi import APIRouter, WebSocket, WebSocketDisconnect, BackgroundTasks, HTTPException
from models.schemas import RFQSubmitRequest, HumanDecisionRequest, LSPQuoteRequest, ManualCounterRequest
from agent.runner import initialize_rfq, process_quote, process_human_decision, get_negotiation, process_manual_counters
from websocket_manager import manager
from typing import Dict, Any, List

router = APIRouter(prefix="/api/rfq", tags=["RFQ"])


@router.post("/submit")
async def submit_rfq(request: RFQSubmitRequest, background_tasks: BackgroundTasks):
    """
    1. Shipper submits an RFQ (AI or Manual mode).
    2. System initializes, cleans locations, establishes benchmark.
    3. Status becomes 'waiting_quotes'.
    """
    rfq_data = request.dict()
    rfq_id = rfq_data["rfq_id"]
    background_tasks.add_task(initialize_rfq, rfq_id, rfq_data)
    return {"rfq_id": rfq_id, "status": "initializing", "mode": rfq_data.get("negotiation_mode", "ai")}


@router.get("/list")
async def list_rfqs():
    """List all RFQs for the client."""
    from agent.runner import _load_all
    negotiations = _load_all()
    # Simplify for list view
    return [
        {
            "rfq_id": rfq_id,
            "origin": state["rfq"].get("origin_name_cleaned"),
            "destination": state["rfq"].get("destination_name_cleaned"),
            "status": state["status"],
            "current_round": state["current_round"],
            "mode": state.get("negotiation_mode", "ai")
        }
        for rfq_id, state in negotiations.items()
    ]


@router.post("/{rfq_id}/quote")
async def submit_lsp_quote(rfq_id: str, request: LSPQuoteRequest):
    """
    LSP submits a quote (initial or counter-response).
    In AI mode, evaluation and counter-offers are automatic.
    In Manual mode, evaluation happens but status waits for client counters.
    """
    result = await process_quote(rfq_id, request.lsp_id, request.quote_price)
    if "error" in result:
        status_code = 404 if "not found" in result["error"].lower() else 400
        raise HTTPException(status_code=status_code, detail=result["error"])
    return result


@router.get("/{rfq_id}/status")
async def get_status(rfq_id: str, for_lsp: bool = False):
    """Returns the full current state of a negotiation."""
    state = get_negotiation(rfq_id)
    if not state:
        raise HTTPException(status_code=404, detail=f"RFQ {rfq_id} not found.")
    
    messages = state.get("messages_log", [])
    if for_lsp:
        # Hide benchmark details from logs
        messages = [m for m in messages if "Benchmark" not in m]

    response = {
        "rfq_id": rfq_id,
        "status": state["status"],
        "mode": state.get("negotiation_mode", "ai"),
        "current_round": state["current_round"],
        "benchmark_price": state["benchmark_price"] if not for_lsp else 0.0,
        "active_lsps": state["active_lsps"],
        "rates": state["rates"],
        "decisions": state.get("decisions", {}),
        "scores": state.get("scores", {}),
        "recommendation": state.get("recommendation"),
        "rfq": state.get("rfq", {}),
        "transporter_list": state["rfq"].get("transporter_list", []),
        "messages": messages[-15:],
    }

    # Deep scrub benchmark from recommendation and transporters if for_lsp
    if for_lsp:
        if response.get("recommendation") and isinstance(response["recommendation"], dict):
            rec = response["recommendation"].copy()
            rec["benchmark"] = 0.0
            rec["savings_pct"] = 0.0
            response["recommendation"] = rec
        
    return response


@router.post("/{rfq_id}/manual_counter")
async def manual_counter(rfq_id: str, request: ManualCounterRequest):
    """Client provides manual counter-offer prices in 'manual' mode."""
    if rfq_id != request.rfq_id:
        raise HTTPException(status_code=400, detail="RFQ ID mismatch.")
    
    result = await process_manual_counters(rfq_id, request.counters)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/{rfq_id}/decision")
async def human_decision(rfq_id: str, request: HumanDecisionRequest):
    """Final decision: accept winner, reject all, or push for an extra manual round."""
    result = await process_human_decision(rfq_id, request.decision)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.websocket("/ws/{rfq_id}")
async def rfq_websocket(websocket: WebSocket, rfq_id: str):
    """WebSocket for real-time negotiation updates."""
    await manager.connect(websocket, rfq_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, rfq_id)
