from fastapi import APIRouter, BackgroundTasks, HTTPException
from models.schemas import RFQSubmitRequest, HumanDecisionRequest, LSPQuoteRequest, ManualCounterRequest
from agent.runner import initialize_rfq, process_quote, process_human_decision, get_negotiation, process_manual_counters
from typing import Dict, Any, List

router = APIRouter(prefix="/api/rfq", tags=["RFQ"])

@router.post("/submit")
async def submit_rfq(request: RFQSubmitRequest, background_tasks: BackgroundTasks):
    rfq_data = request.dict()
    rfq_id = rfq_data["rfq_id"]
    background_tasks.add_task(initialize_rfq, rfq_id, rfq_data)
    return {"rfq_id": rfq_id, "status": "initializing", "mode": rfq_data.get("negotiation_mode", "ai")}

@router.get("/list")
async def list_rfqs():
    from agent.runner import _load_all
    negotiations = _load_all()
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
    result = await process_quote(rfq_id, request.lsp_id, request.quote_price)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.get("/{rfq_id}/status")
async def get_status(rfq_id: str, for_lsp: bool = False):
    state = get_negotiation(rfq_id)
    if not state:
        raise HTTPException(status_code=404, detail="RFQ not found")
    
    # Hide benchmark/scores from LSPs
    if for_lsp:
        resp = state.copy()
        resp.pop("benchmark_price", None)
        resp.pop("scores", None)
        resp.pop("recommendation", None)
        return resp
    return state

@router.post("/{rfq_id}/manual_counter")
async def manual_counter(rfq_id: str, request: ManualCounterRequest):
    result = await process_manual_counters(rfq_id, request.counters)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/{rfq_id}/decision")
async def human_decision(rfq_id: str, request: HumanDecisionRequest):
    result = await process_human_decision(rfq_id, request.decision)
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
