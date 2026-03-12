"""
Autonomous Negotiation Engine — Event-driven, JSON-backed.
Supports "AI" and "Manual" modes.

Parallel Negotiation Refactor:
1. LSPs are negotiated with as soon as they quote.
2. An 'Accumulator' logic periodically refreshes the overall recommendation.
"""

import json
import os
import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional

from logic.benchmark import predict_freight_rate
from llm.gemini_client import gemini_negotiator
from logic.scoring import compute_scores
from db.database import save_rfq, save_quote, save_outcome
from websocket_manager import manager

from collections import defaultdict

logger = logging.getLogger(__name__)

NEGOTIATIONS_FILE = "data/storage/negotiations.json"
RFQ_LOCKS = defaultdict(asyncio.Lock)

def _load_all() -> Dict[str, Any]:
    if not os.path.exists(NEGOTIATIONS_FILE):
        return {}
    try:
        with open(NEGOTIATIONS_FILE, "r") as f:
            return json.load(f)
    except (json.JSONDecodeError, FileNotFoundError):
        return {}

def _save_all(data: Dict[str, Any]):
    os.makedirs(os.path.dirname(NEGOTIATIONS_FILE), exist_ok=True)
    with open(NEGOTIATIONS_FILE, "w") as f:
        json.dump(data, f, indent=4, default=str)

def get_negotiation(rfq_id: str) -> Optional[Dict[str, Any]]:
    return _load_all().get(rfq_id)

def save_negotiation(rfq_id: str, state: Dict[str, Any]):
    data = _load_all()
    data[rfq_id] = state
    _save_all(data)

async def _safe_run_task(coro):
    """Utility to run a background task and log errors."""
    try:
        await coro
    except Exception as e:
        logger.exception(f"Background Task Failed: {str(e)}")


async def initialize_rfq(rfq_id: str, rfq_data: dict) -> Dict[str, Any]:
    """Called by POST /submit in a background task."""
    logger.info(f"Initializing RFQ: {rfq_id} in {rfq_data.get('negotiation_mode', 'ai')} mode")

    rfq = rfq_data.copy()
    rfq["origin_name_cleaned"] = rfq["origin"].get("location_name", "Unknown")
    rfq["destination_name_cleaned"] = rfq["destination"].get("location_name", "Unknown")

    try:
        with open("data/lsp_profiles.json", "r") as f:
            profiles = json.load(f)
    except Exception:
        profiles = {}

    transporters = rfq.get("transporter_list", [])
    active_lsps = [t["transporter_id"] for t in transporters if t["transporter_id"] in profiles]

    # Establish benchmark
    capacity_val = 10.0
    try:
        capacity_str = rfq.get("capacity", "10")
        import re
        nums = re.findall(r"[-+]?\d*\.\d+|\d+", capacity_str)
        if nums:
            capacity_val = float(nums[0])
    except:
        pass

    result_str = predict_freight_rate.func(
        origin_location=rfq["origin"].get("location", {}),
        destination_location=rfq["destination"].get("location", {}),
        origin_coordinates=rfq["origin"].get("coordinates"),
        destination_coordinates=rfq["destination"].get("coordinates"),
        origin_name=rfq["origin_name_cleaned"],
        destination_name=rfq["destination_name_cleaned"],
        truck_type=rfq.get("truck_type", "10 wheeler open body"),
        no_of_wheels=10, 
        capacity_mt=capacity_val,
    )

    benchmark = 100000.0
    if result_str != "FAILED":
        try:
            benchmark = float(result_str)
        except Exception:
            benchmark = 50000.0

    await save_rfq(rfq)

    async with RFQ_LOCKS[rfq_id]:
        state = {
            "rfq_id": rfq_id,
            "rfq": rfq,
            "negotiation_mode": rfq.get("negotiation_mode", "ai"),
            "max_budget": rfq.get("max_budget", 0),
            "benchmark_price": benchmark,
            "lsp_profiles": {lid: profiles[lid] for lid in active_lsps},
            "active_lsps": active_lsps,
            "dropped_lsps": [],
            "current_round": 0,
            "max_rounds": 5,
            "rates": {lid: 0.0 for lid in active_lsps},
            "history": {lid: [] for lid in active_lsps},
            "decisions": {},
            "scores": {},
            "recommendation": None,
            "status": "waiting_quotes",
            "messages_log": [
                f"🚀 RFQ {rfq_id} initialized. Mode: {rfq.get('negotiation_mode', 'ai').upper()}.",
                f"📍 Lane: {rfq['origin_name_cleaned']} → {rfq['destination_name_cleaned']}",
                f"📈 Market Benchmark: ₹{benchmark:,.0f}",
                f"📅 Placement Date: {rfq.get('date_of_placement')}",
                f"💰 Budget Ceiling: ₹{rfq.get('max_budget', 0):,.0f}" if rfq.get('max_budget') else "💰 Budget: No hard ceiling specified"
            ],
        }
        save_negotiation(rfq_id, state)
    
    await manager.broadcast_to_rfq(rfq_id, {"type": "initialized", "message": "RFQ Initialized."})
    return state


async def process_quote(rfq_id: str, lsp_id: str, quote_price: float) -> Dict[str, Any]:
    """
    Parallel Quote Processing:
    As soon as a quote comes in, if in AI mode, negotiate immediately with THIS LSP.
    """
    async with RFQ_LOCKS[rfq_id]:
        state = get_negotiation(rfq_id)
        if not state:
            return {"error": f"RFQ {rfq_id} not found."}

        if state["status"] not in ("waiting_quotes", "waiting_counters", "negotiation_in_progress"):
            if state["status"] in ("booked", "cancelled"):
                return {"error": f"Negotiation is already {state['status']}."}

        if lsp_id not in state["active_lsps"] and lsp_id not in state.get("dropped_lsps", []):
            return {"error": f"{lsp_id} is not an invited LSP."}

        # 1. Update State
        state["rates"][lsp_id] = quote_price
        history = state["history"].get(lsp_id, [])
        lsp_round = len(history)

        counter_price = None
        if lsp_id in state.get("decisions", {}):
            counter_price = state["decisions"][lsp_id].get("counter_price")

        new_bid = {
            "round": lsp_round,
            "quote": quote_price,
            "counter": counter_price,
            "timestamp": datetime.now().isoformat(),
        }
        state["history"][lsp_id].append(new_bid)
        state["messages_log"].append(f"📩 Quote Received: {lsp_id} offered ₹{quote_price:,.0f} (Round {lsp_round})")

        # Sync to RFQ list
        transporters = state["rfq"].get("transporter_list", [])
        for t in transporters:
            if t["transporter_id"] == lsp_id:
                t["current_rate"] = quote_price
                t.setdefault("rate_list", []).append({
                    "rate": quote_price,
                    "rate_submission_date": datetime.now().isoformat(),
                    "bid_status": "pending",
                    "counter_offer_sent": counter_price,
                    "submitted_by": "agent" if state["negotiation_mode"] == "ai" else "client"
                })
                break
        
        # Check transition
        responded_count = sum(1 for lid in state["active_lsps"] if len(state["history"].get(lid, [])) > 0)
        if state["status"] == "waiting_quotes" and responded_count == len(state["active_lsps"]):
            if state["negotiation_mode"] == "ai":
                state["status"] = "negotiation_in_progress"
                state["messages_log"].append("📝 All initial quotes received. Transitioning to active negotiation.")
        
        save_negotiation(rfq_id, state)

    # 2. External Actions (Outside main lock or new lock)
    await save_quote(rfq_id, lsp_id, lsp_round, quote_price, counter_price)
    
    # 3. Trigger Background Tasks
    if state["negotiation_mode"] == "ai" and lsp_round < state["max_rounds"]:
        asyncio.create_task(_safe_run_task(negotiate_with_single_lsp(rfq_id, lsp_id)))
    
    if state["negotiation_mode"] == "manual" and responded_count == len(state["active_lsps"]):
         # Trigger manual board update
         asyncio.create_task(_safe_run_task(_run_manual_evaluation(state)))

    # Refresh Accumulator
    asyncio.create_task(_safe_run_task(update_accumulator_logic(rfq_id)))
    
    return {"status": "received", "lsp_id": lsp_id}


async def negotiate_with_single_lsp(rfq_id: str, lsp_id: str):
    """
    AI Negotiator Core.
    Calculates decision then applies it to state using Lock.
    """
    # 1. Read static data for LLM
    async with RFQ_LOCKS[rfq_id]:
        state = get_negotiation(rfq_id)
        if not state or state["negotiation_mode"] != "ai":
            return
        
        profile = state["lsp_profiles"].get(lsp_id, {})
        history = list(state["history"].get(lsp_id, []))
        current_round = len(history) - 1
        rfq_ref = dict(state["rfq"])
        benchmark = state["benchmark_price"]

    # 2. Decision logic (LONG CALL - WITHOUT LOCK)
    decision = await gemini_negotiator.decide_negotiation_action(
        rfq_ref, profile, benchmark, history, current_round
    )

    # 3. Apply decision (RE-ACQUIRE LOCK)
    async with RFQ_LOCKS[rfq_id]:
        state = get_negotiation(rfq_id)
        if not state: return
        
        state["decisions"][lsp_id] = decision
        budget = state.get("max_budget", 0)
        budget_sign = "⚠️" if budget > 0 and decision.get("counter_price", 0) > budget else "💸"
        
        msg = f"🤖 AI Response to {lsp_id}: **{decision['decision']}**"
        if decision['decision'] == 'COUNTER':
            msg += f" at {budget_sign} ₹{decision['counter_price']:,.0f}"
        
        reason = decision.get("reasoning", "")
        if reason:
            snippet = reason.split('.')[0] if '.' in reason else reason
            msg += f" | _{snippet}_"
        state["messages_log"].append(msg)

        # Apply to list
        transporters = state["rfq"].get("transporter_list", [])
        for t in transporters:
            if t["transporter_id"] == lsp_id:
                status_map = {"ACCEPT": "accepted", "COUNTER": "counter offer", "DROP": "rejected"}
                if t.get("rate_list"):
                    # Use index -1 to update the LATEST rate which should be the one being negotiated
                    t["rate_list"][-1]["bid_status"] = status_map.get(decision["decision"], "pending")
                    t["rate_list"][-1]["counter_offer_sent"] = decision.get("counter_price")
                    t["rate_list"][-1]["submitted_by"] = "agent"
                break

        if decision["decision"] == "DROP":
            if lsp_id in state["active_lsps"]:
                state["active_lsps"].remove(lsp_id)
                state.setdefault("dropped_lsps", []).append(lsp_id)

        save_negotiation(rfq_id, state)
        await manager.broadcast_to_rfq(rfq_id, {"type": "ai_response", "lsp_id": lsp_id, "data": decision})
    
    # 4. Successor update
    asyncio.create_task(_safe_run_task(update_accumulator_logic(rfq_id)))


async def update_accumulator_logic(rfq_id: str):
    """
    Watches the Board. Serially updates recommendation.
    """
    # 1. Gather state for recommendation
    async with RFQ_LOCKS[rfq_id]:
        state = get_negotiation(rfq_id)
        if not state: return

        valid_rates = {lid: rate for lid, rate in state["rates"].items() if rate > 0}
        if not valid_rates: return
        
        # Prepare data for LLM
        scores = compute_scores(state["active_lsps"], state["rates"], state["benchmark_price"], state["lsp_profiles"])
        state["scores"] = scores
        state_for_llm = dict(state)

    # 2. Recommendation logic (LONG CALL - WITHOUT LOCK)
    summary = await gemini_negotiator.generate_final_recommendation(state_for_llm)
    
    # 3. Apply update (RE-ACQUIRE LOCK)
    async with RFQ_LOCKS[rfq_id]:
        state = get_negotiation(rfq_id)
        if not state: return
        
        # Re-verify best after possible other bids during LLM call
        scores = compute_scores(state["active_lsps"], state["rates"], state["benchmark_price"], state["lsp_profiles"])
        state["scores"] = scores
        best_id = max(scores, key=scores.get) if scores else None
        
        state["recommendation"] = {
            "best_lsp_id": best_id,
            "best_lsp_name": state["lsp_profiles"].get(best_id, {}).get("transporter_name", best_id) if best_id else "None",
            "final_price": state["rates"].get(best_id, 0.0) if best_id else 0.0,
            "benchmark": state["benchmark_price"],
            "summary": summary,
            "savings_pct": round(((state["benchmark_price"] - state["rates"].get(best_id, 0)) / state["benchmark_price"]) * 100, 1) if best_id and state["benchmark_price"] > 0 else 0
        }

        # Check verdict threshold
        if state["negotiation_mode"] == "ai":
            terminal_statuses = ["ACCEPT", "DROP"]
            all_terminal = all(state["decisions"].get(lid, {}).get("decision") in terminal_statuses for lid in state["active_lsps"])
            max_reached = any(len(h) >= state["max_rounds"] for h in state["history"].values())
            
            if (all_terminal or max_reached) and state["status"] not in ("booked", "cancelled", "pending_human_verdict"):
                state["status"] = "pending_human_verdict"
                state["messages_log"].append("🎯 AI has completed negotiation and generated a recommendation.")
        
        save_negotiation(rfq_id, state)
        await manager.broadcast_to_rfq(rfq_id, {"type": "accumulator_update", "status": state["status"]})


async def _run_manual_evaluation(state: Dict[str, Any]) -> Dict[str, Any]:
    """In manual mode, we use AI to SUGGEST counters, but wait for human."""
    rfq_id = state["rfq_id"]
    for lid in state["active_lsps"]:
        profile = state["lsp_profiles"].get(lid, {})
        history = state["history"].get(lid, [])
        decision = await gemini_negotiator.decide_negotiation_action(
            state["rfq"], profile, state["benchmark_price"], history, 0
        )
        state["decisions"][lid] = decision

    state["status"] = "pending_manual_counter"
    state["messages_log"].append("⚖️ Manual Evaluation Complete. Waiting for human counter-offers.")
    save_negotiation(rfq_id, state)
    return state


async def process_manual_counters(rfq_id: str, counters: Dict[str, float]) -> Dict[str, Any]:
    async with RFQ_LOCKS[rfq_id]:
        state = get_negotiation(rfq_id)
        if not state or state["status"] != "pending_manual_counter":
            return {"error": "RFQ not in manual counter state."}

        for lid, price in counters.items():
            # Update or create decision
            if lid not in state["decisions"]:
                state["decisions"][lid] = {"decision": "COUNTER"}
            
            state["decisions"][lid]["counter_price"] = price
            
            # Update RFQ record
            transporters = state["rfq"].get("transporter_list", [])
            for t in transporters:
                if t["transporter_id"] == lid and t.get("rate_list"):
                    t["rate_list"][-1]["bid_status"] = "counter offer"
                    t["rate_list"][-1]["counter_offer_sent"] = price
                    t["rate_list"][-1]["submitted_by"] = "client"

        state["status"] = "waiting_counters"
        state["messages_log"].append(f"👨‍💻 Client submitted manual counters.")
        save_negotiation(rfq_id, state)
        
        await manager.broadcast_to_rfq(rfq_id, {"type": "manual_counters_sent"})
        return {"status": "waiting_counters"}


async def process_human_decision(rfq_id: str, decision: str) -> Dict[str, Any]:
    async with RFQ_LOCKS[rfq_id]:
        state = get_negotiation(rfq_id)
        if not state or state["status"] != "pending_human_verdict":
            return {"error": "No recommendation pending."}

        if decision == "accept":
            state["status"] = "booked"
            winner_id = state["recommendation"]["best_lsp_id"]
            state["messages_log"].append(f"✅ RFQ Booked with {winner_id} at ₹{state['rates'][winner_id]:,.0f}")
            save_negotiation(rfq_id, state)
            await save_outcome(rfq_id, state["recommendation"], state["benchmark_price"])
            return {"status": "booked"}
        
        elif decision == "reject":
            state["status"] = "cancelled"
            state["messages_log"].append("❌ RFQ Cancelled by client.")
            save_negotiation(rfq_id, state)
            return {"status": "cancelled"}
        
        elif decision == "push":
            state["status"] = "pending_manual_counter"
            state["messages_log"].append("🔄 Client requested additional negotiation round.")
            save_negotiation(rfq_id, state)
            return {"status": "pending_manual_counter"}

    return {"error": "Invalid decision."}
