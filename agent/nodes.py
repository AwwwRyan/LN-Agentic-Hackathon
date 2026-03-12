import json
import logging
from datetime import datetime
from typing import Dict, Any, List

from agent.state import NegotiationState
from logic.benchmark import predict_freight_rate
from simulators.lsp_simulator import lsp_simulator
from llm.gemini_client import gemini_negotiator
from db.firebase import (
    push_quote, update_counter_price, get_all_quotes, get_lsp_quotes,
    init_negotiation_meta, increment_round, update_negotiation_status, get_negotiation_meta,
    init_lsp_state, update_lsp_state, drop_lsp, get_all_lsp_states, get_lsp_state,
    get_lsp_profile, get_all_lsp_profiles, get_rfq,
    get_historical_rates, save_historical_rate, save_outcome, get_outcome
)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def initialize_node(state: NegotiationState) -> Dict[str, Any]:
    """
    Initializes the state with RFQ details and loads LSP profiles.
    """
    logger.info(f"Initializing RFQ: {state['rfq_id']}")
    from logic.benchmark import get_location_suggestions
    
    rfq = state['rfq'].copy()
    rfq_id = state['rfq_id']
    
    # 1. Clean Locations immediately during initialization
    origin_name = rfq["origin"].get("name", "Unknown")
    dest_name = rfq["destination"].get("name", "Unknown")
    
    cleaned_origin = get_location_suggestions(origin_name) or {"location_name": origin_name}
    cleaned_dest = get_location_suggestions(dest_name) or {"location_name": dest_name}
    
    # Update the internal state RFQ with cleaned details
    rfq["origin_details"] = cleaned_origin
    rfq["destination_details"] = cleaned_dest
    rfq["origin_name_cleaned"] = cleaned_origin.get("location_name", origin_name)
    rfq["destination_name_cleaned"] = cleaned_dest.get("location_name", dest_name)
    
    # Load profiles from Firestore
    shortlisted = rfq.get("shortlisted_lsps", [])
    profiles = get_all_lsp_profiles(shortlisted)

    # Filter profiles for only shortlisted LSPs
    active_lsps = [lsp_id for lsp_id in shortlisted if lsp_id in profiles]
    
    # Initialize Negotiation in RTDB
    init_negotiation_meta(rfq_id, 0.0, "initial", "pending_benchmark")
    for lsp_id in active_lsps:
        init_lsp_state(rfq_id, lsp_id, 0.0)

    return {
        "rfq_id": rfq_id,
        "rfq": rfq,
        "lsp_profiles": profiles,
        "active_lsps": active_lsps,
        "dropped_lsps": [],
        "current_round": 0,
        "total_rounds": 0,
        "max_rounds": 5,
        "rates": {},
        "pending_quotes": {},
        "history": {lsp_id: [] for lsp_id in active_lsps},
        "scores": {},
        "recommendation": {},
        "status": "active",
        "messages_log": [f"RFQ {rfq_id} initialized. Lanes: {rfq['origin_name_cleaned']} to {rfq['destination_name_cleaned']}"]
    }

async def benchmark_node(state: NegotiationState) -> Dict[str, Any]:
    """
    Calls the rate prediction API to establish a market benchmark.
    """
    rfq = state['rfq']
    rfq_id = state['rfq_id']
    logger.info(f"Establishing benchmark for {rfq_id}")
    
    # Check historical rates in Firestore
    lane_key = f"{rfq['origin_name_cleaned']}-{rfq['destination_name_cleaned']}"
    truck_type = rfq.get('truck', {}).get('truck_type', 'Unknown')
    hist_entry = get_historical_rates(lane_key, truck_type)
    
    benchmark = 100000.0
    benchmark_source = "fallback"
    benchmark_type = "predicted"

    if hist_entry:
        benchmark = hist_entry['avg_rate']
        benchmark_source = "historical"
        benchmark_type = "factual"
    else:
        # Call the tool
        result_str = predict_freight_rate.func(
            origin_location=rfq['origin'],
            destination_location=rfq['destination'],
            origin_name=rfq['origin']['name'],
            destination_name=rfq['destination']['name'],
            truck_type=rfq['truck']['truck_type'],
            no_of_wheels=rfq['truck']['no_of_wheels'],
            capacity_mt=rfq['truck']['capacity_mt']
        )
        if result_str != "FAILED":
            try:
                benchmark = float(result_str)
                benchmark_source = "api"
            except:
                benchmark = 50000.0

    # Update RTDB Meta
    update_negotiation_status(rfq_id, "active") # Ensure active
    init_negotiation_meta(rfq_id, benchmark, benchmark_type, benchmark_source)

    msg = f"Benchmark established: ₹{benchmark} ({benchmark_source})"
    
    return {
        "benchmark_price": benchmark,
        "messages_log": state['messages_log'] + [msg]
    }

async def send_rfq_node(state: NegotiationState) -> Dict[str, Any]:
    """
    Waits for a single quote and ACTS UPON IT immediately.
    """
    from langgraph.types import interrupt
    
    rfq_id = state['rfq_id']
    active_lsps = state['active_lsps']
    new_rates = state['rates'].copy()
    new_history = state['history'].copy()
    new_decisions = state.get('decisions', {}).copy()
    logs = []
    
    # Who still needs to quote for round 0?
    missing = [lsp for lsp in active_lsps if lsp not in new_rates]
    
    if missing:
        logger.info(f"RFQ {rfq_id}: Waiting for quote. Missing: {missing}")
        
        # INTERRUPT: The graph pauses here. 
        data = interrupt({
            "action": "wait_initial_quotes",
            "missing_lsps": missing
        })
        
        if isinstance(data, dict) and "lsp_id" in data:
             lsp_id = data["lsp_id"]
             quote = data["quote_price"]
             
             # 1. PROCESS THE QUOTE
             new_rates[lsp_id] = quote
             new_history[lsp_id].append({
                 "round": 0,
                 "quote": quote,
                 "counter": None,
                 "justification": "Initial quote received."
             })
             
             # Firebase Updates
             quote_obj = {
                 "uuid": f"{rfq_id}-{lsp_id}-0",
                 "transporter_id": lsp_id,
                 "transporter_name": state['lsp_profiles'].get(lsp_id, {}).get('name', lsp_id),
                 "round_number": 0,
                 "quoted_price": quote,
                 "counter_price": None,
                 "timestamp": datetime.now().isoformat()
             }
             push_id = push_quote(rfq_id, quote_obj)
             update_lsp_state(rfq_id, lsp_id, {"current_quote": quote, "rounds_participated": 1})
             
             # 2. ACT UPON IT IMMEDIATELY (Evaluate)
             logger.info(f"Acting upon quote from {lsp_id}: ₹{quote}")
             profile = state['lsp_profiles'].get(lsp_id)
             h = new_history[lsp_id]
             
             decision = await gemini_negotiator.decide_negotiation_action(
                 state['rfq'], profile, state['benchmark_price'], h, 0
             )
             new_decisions[lsp_id] = decision
             
             msg = f"Processed {lsp_id}: {decision['decision']} | {decision.get('justification', '')}"
             logger.info(msg)
             logs.append(msg)
             
             # Update RTDB with AI Decision (counter_price)
             if decision['decision'] == "COUNTER":
                 update_counter_price(rfq_id, push_id, decision.get("counter_price"))
             elif decision['decision'] == "DROP":
                 drop_lsp(rfq_id, lsp_id, decision.get("justification", "Dropped due to target not met"))

    return {
        "rates": new_rates,
        "history": new_history,
        "decisions": new_decisions,
        "messages_log": state['messages_log'] + logs
    }


async def counter_offer_node(state: NegotiationState) -> Dict[str, Any]:
    """
    Waits for a single counter-response and ACTS UPON IT immediately.
    """
    from langgraph.types import interrupt
    
    rfq_id = state['rfq_id']
    current_round = state['current_round']
    
    new_active = state['active_lsps'].copy()
    new_dropped = state['dropped_lsps'].copy()
    new_rates = state['rates'].copy()
    new_history = state['history'].copy()
    new_decisions = state['decisions'].copy()
    logs = []
    
    target_round = current_round + 1
    
    lsps_to_wait_for = [
        lsp_id for lsp_id, d in state['decisions'].items() 
        if d.get("decision") == "COUNTER"
    ]
    
    responded_already = []
    for lsp_id in lsps_to_wait_for:
        if any(h['round'] == target_round for h in new_history.get(lsp_id, [])):
            responded_already.append(lsp_id)
            
    missing = [lsp for lsp in lsps_to_wait_for if lsp not in responded_already]
    
    if missing:
        data = interrupt({
            "action": "wait_counters",
            "round": target_round,
            "missing_lsps": missing
        })
        
        if isinstance(data, dict) and "lsp_id" in data:
             lsp_id = data["lsp_id"]
             new_quote = data["quote_price"]
             
             counter_price = state['decisions'][lsp_id].get("counter_price")
             new_rates[lsp_id] = new_quote
             new_history[lsp_id].append({
                 "round": target_round,
                 "quote": new_quote,
                 "counter": counter_price,
                 "justification": state['decisions'][lsp_id].get("justification")
             })
             
             # Firebase Updates
             quote_obj = {
                 "uuid": f"{rfq_id}-{lsp_id}-{target_round}",
                 "transporter_id": lsp_id,
                 "transporter_name": state['lsp_profiles'].get(lsp_id, {}).get('name', lsp_id),
                 "round_number": target_round,
                 "quoted_price": new_quote,
                 "counter_price": None,
                 "timestamp": datetime.now().isoformat()
             }
             push_id = push_quote(rfq_id, quote_obj)
             
             # Calculate Concession Rate
             prev_quotes = [h['quote'] for h in new_history[lsp_id] if h['round'] == current_round]
             prev_quote = prev_quotes[-1] if prev_quotes else new_quote
             concession = (prev_quote - new_quote) / prev_quote if prev_quote else 0.0
             
             update_lsp_state(rfq_id, lsp_id, {
                 "current_quote": new_quote, 
                 "concession_rate": concession,
                 "rounds_participated": target_round + 1
             })
             
             # Evaluate
             profile = state['lsp_profiles'].get(lsp_id)
             decision = await gemini_negotiator.decide_negotiation_action(
                 state['rfq'], profile, state['benchmark_price'], new_history[lsp_id], target_round
             )
             new_decisions[lsp_id] = decision
             
             msg = f"Processed counter from {lsp_id}: {decision['decision']}"
             logger.info(msg)
             logs.append(msg)
             
             if decision['decision'] == "COUNTER":
                 update_counter_price(rfq_id, push_id, decision.get("counter_price"))
             elif decision['decision'] == "DROP":
                 drop_lsp(rfq_id, lsp_id, decision.get("justification", "Dropped due to target not met"))
                 if lsp_id in new_active: new_active.remove(lsp_id)
                 if lsp_id not in new_dropped: new_dropped.append(lsp_id)

             # If all responded, increment round
             if len(responded_already) + 1 == len(lsps_to_wait_for):
                 increment_round(rfq_id)

    return {
        "active_lsps": new_active,
        "dropped_lsps": new_dropped,
        "rates": new_rates,
        "history": new_history,
        "decisions": new_decisions,
        "messages_log": state['messages_log'] + logs
    }

async def scoring_node(state: NegotiationState) -> Dict[str, Any]:
    """
    Computes final scores based on price, reliability, and speed.
    """
    rfq_id = state['rfq_id']
    logger.info(f"Negotiation rounds complete. Scoring remaining {len(state['active_lsps'])} LSPs.")
    from logic.scoring import compute_scores
    
    # Get live data from Firebase for scoring
    live_lsp_states = get_all_lsp_states(rfq_id)
    # Get profiles from Firestore
    live_profiles = get_all_lsp_profiles(state['active_lsps'])
    
    scores = compute_scores(
        state['active_lsps'], state['rates'], state['benchmark_price'], live_profiles
    )
    
    msg = f"Final scores computed for {len(state['active_lsps'])} LSPs."
    
    return {
        "scores": scores,
        "messages_log": state['messages_log'] + [msg]
    }

async def recommendation_node(state: NegotiationState) -> Dict[str, Any]:
    """
    Generates a final recommendation summary using the LLM.
    """
    rfq_id = state['rfq_id']
    logger.info("Generating final recommendation summary for human approval.")
    # Use Gemini to summarize the whole thing
    summary = await gemini_negotiator.generate_final_recommendation(state)
    
    # Identify best
    if state['scores']:
        best_lsp_id = max(state['scores'], key=state['scores'].get)
        best_rate = state['rates'][best_lsp_id]
        savings_pct = round(((state['benchmark_price'] - best_rate) / state['benchmark_price']) * 100, 2)
        
        recommendation = {
            "best_lsp_id": best_lsp_id,
            "best_lsp_name": state['lsp_profiles'][best_lsp_id].get('name', best_lsp_id),
            "final_price": best_rate,
            "savings_pct": savings_pct,
            "summary": summary,
            "score": state['scores'][best_lsp_id]
        }
        
        # Update Status
        update_negotiation_status(rfq_id, "pending_human")
    else:
        recommendation = {"summary": "No active LSPs remaining to recommend."}
        update_negotiation_status(rfq_id, "cancelled")

    msg = "Final recommendation generated."
    
    return {
        "recommendation": recommendation,
        "status": "pending_human",
        "messages_log": state['messages_log'] + [msg]
    }

async def human_decision_node(state: NegotiationState) -> Dict[str, Any]:
    """
    Wait for human input via interrupt.
    """
    from langgraph.types import interrupt
    rfq_id = state['rfq_id']
    
    decision = interrupt("Please approve the recommendation: accept, push, or reject")
    
    logs = [f"Human decision received: {decision}"]
    new_status = "active"
    
    if decision == "accept":
        new_status = "booked"
        best_name = state['recommendation'].get('best_lsp_name', 'Unknown')
        best_id = state['recommendation'].get('best_lsp_id')
        final_price = state['recommendation'].get('final_price', 0)
        
        # Firestore Outcomes
        outcome_data = {
            "rfq_id": rfq_id,
            "winning_lsp_id": best_id,
            "winning_lsp_name": best_name,
            "final_price": final_price,
            "benchmark_price": state['benchmark_price'],
            "benchmark_type": "api", # Placeholder, would be meta.benchmark_type
            "savings_pct": state['recommendation'].get('savings_pct', 0),
            "total_rounds": state['current_round'],
            "auto_booked": False
        }
        save_outcome(rfq_id, outcome_data)
        
        # Historical Rate Update
        lane_key = f"{state['rfq']['origin_name_cleaned']}-{state['rfq']['destination_name_cleaned']}"
        truck_type = state['rfq'].get('truck', {}).get('truck_type', 'Unknown')
        save_historical_rate(lane_key, truck_type, rfq_id, final_price, best_id)
        
        update_negotiation_status(rfq_id, "booked")
        logs.append(f"RFQ closed. Winner: {best_name} at ₹{final_price}.")
        
    elif decision == "reject":
        new_status = "cancelled"
        update_negotiation_status(rfq_id, "cancelled")
        # Save dummy outcome for record
        outcome_data = {"rfq_id": rfq_id, "status": "cancelled"}
        save_outcome(rfq_id, outcome_data)
        logs.append("RFQ rejected by human.")
        
    elif decision == "push":
        new_status = "active"
        update_negotiation_status(rfq_id, "active")
        logs.append("Human pushed for more rounds.")

    return {
        "status": new_status,
        "messages_log": state['messages_log'] + logs
    }
