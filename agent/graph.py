from typing import Literal
from langgraph.graph import StateGraph, START, END

from agent.state import NegotiationState
from agent.nodes import (
    initialize_node, benchmark_node, send_rfq_node, 
    counter_offer_node, scoring_node,
    recommendation_node, human_decision_node
)

def should_continue_initial(state: NegotiationState) -> Literal["wait", "next"]:
    """Decide if we need more initial quotes or move to the next phase."""
    active = state['active_lsps']
    rates = state['rates']
    if any(lsp not in rates for lsp in active):
        return "wait"
    return "next"

def should_continue_negotiation(state: NegotiationState) -> Literal["wait", "evaluate"]:
    """Decide if we wait for more counters or re-evaluate the whole round."""
    # We are waiting for those who weren't dropped/accepted and haven't responded this round
    lsps_to_wait_for = [
        lsp_id for lsp_id, d in state['decisions'].items() 
        if d.get("decision") == "COUNTER"
    ]
    
    target_round = state['current_round'] + 1
    responded_already = []
    for lsp_id in lsps_to_wait_for:
        if any(h['round'] == target_round for h in state['history'].get(lsp_id, [])):
            responded_already.append(lsp_id)
            
    if any(lsp not in responded_already for lsp in lsps_to_wait_for):
        return "wait"
        
    return "evaluate"

def final_routing(state: NegotiationState) -> Literal["continue", "escalate"]:
    """Decides if we start a new round or finish."""
    if state["current_round"] >= state["max_rounds"]:
        return "escalate"
    
    if not state["active_lsps"]:
        return "escalate"

    has_counter = any(
        d.get("decision") == "COUNTER" 
        for d in state.get("decisions", {}).values()
    )
    
    if has_counter:
        return "continue"
    return "escalate"

from langgraph.checkpoint.memory import MemorySaver
memory = MemorySaver()

def create_graph():
    workflow = StateGraph(NegotiationState)

    workflow.add_node("initialize", initialize_node)
    workflow.add_node("benchmark", benchmark_node)
    workflow.add_node("send_rfq", send_rfq_node) 
    workflow.add_node("counter_offer", counter_offer_node)
    workflow.add_node("scoring", scoring_node)
    workflow.add_node("recommendation", recommendation_node)
    workflow.add_node("human_decision", human_decision_node)
    
    def increment_round(state: NegotiationState):
        return {"current_round": state["current_round"] + 1}
    workflow.add_node("increment_round", increment_round)

    workflow.add_edge(START, "initialize")
    workflow.add_edge("initialize", "benchmark")
    workflow.add_edge("benchmark", "send_rfq")
    
    workflow.add_conditional_edges(
        "send_rfq",
        should_continue_initial,
        {
            "wait": "send_rfq",
            "next": "increment_round"
        }
    )
    
    workflow.add_conditional_edges(
        "increment_round",
        final_routing,
        {
            "continue": "counter_offer",
            "escalate": "scoring"
        }
    )
    
    workflow.add_conditional_edges(
        "counter_offer",
        should_continue_negotiation,
        {
            "wait": "counter_offer",
            "evaluate": "increment_round"
        }
    )
    
    workflow.add_edge("scoring", "recommendation")
    workflow.add_edge("recommendation", "human_decision")
    
    workflow.add_conditional_edges(
        "human_decision",
        lambda x: "continue" if x["status"] == "active" else "end",
        {
            "continue": "counter_offer",
            "end": END
        }
    )

    return workflow.compile(checkpointer=memory)

# Compiled application exported for the router and runner
negotiation_app = create_graph()
