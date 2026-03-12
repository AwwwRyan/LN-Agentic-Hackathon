from typing import TypedDict, List, Dict, Any, Optional

class NegotiationState(TypedDict):
    """
    Represents the state of the negotiation process.
    """
    rfq_id: str
    rfq: Dict[str, Any]
    benchmark_price: float
    lsp_profiles: Dict[str, Any]
    active_lsps: List[str]
    dropped_lsps: List[str]
    current_round: int
    rates: Dict[str, float]  # Current rate per LSP
    pending_quotes: Dict[str, float] # Quotes received via API this round
    history: Dict[str, List[Dict[str, Any]]]  # List of {round, quote, counter, justification}
    scores: Dict[str, float]
    recommendation: Dict[str, Any]
    status: str
    escalation_reason: str
    messages_log: List[str]
    decisions: Dict[str, Dict[str, Any]] # Decisions per LSP with details
