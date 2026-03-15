from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any, Literal
from datetime import datetime

class RFQLocation(BaseModel):
    location: Optional[Dict[str, Any]] = None
    location_name: str
    coordinates: List[float] = [0.0, 0.0]

class RateEntry(BaseModel):
    rate: float
    rate_submission_date: str # timestamp
    bid_status: Literal["rejected", "counter offer", "accepted", "pending"] = "pending"
    counter_offer_sent: Optional[float] = None
    submitted_by: Literal["agent", "client"] = "agent" # Tracks who sent the last counter/accepted

class ManualCounterRequest(BaseModel):
    rfq_id: str
    counters: Dict[str, float] # lsp_id -> counter_price

class TransporterEntry(BaseModel):
    transporter_id: str
    transporter_name: str
    percentage_completion: float = 0.0
    current_rate: float = 0.0
    rate_list: List[RateEntry] = []

class RFQSubmitRequest(BaseModel):
    rfq_id: str
    origin: RFQLocation
    destination: RFQLocation
    date_of_placement: str # dd-mm-yyyy
    truck_type: str
    capacity: str # e.g. "21 tons"
    negotiation_mode: Literal["ai", "manual"] = "ai"
    max_budget: Optional[float] = None # Manufacturer's ceiling
    transporter_list: List[TransporterEntry]
    auto_accept: bool = False

class LSPQuoteRequest(BaseModel):
    lsp_id: str
    quote_price: float

class LSPAcceptRequest(BaseModel):
    rfq_id: str
    lsp_id: str
    accepted_price: float

class HumanDecisionRequest(BaseModel):
    rfq_id: str
    decision: Literal["accept", "push", "reject"]

class FinancialRecord(BaseModel):
    financial_year: str
    amount: str
    unit: str
    currency: Optional[str] = "INR"
    uploaded_on: Optional[str] = None

class OperatingLane(BaseModel):
    origin: RFQLocation
    destination: RFQLocation
    travel_date: str

class LSPProfile(BaseModel):
    transporter_id: str
    transporter_name: str
    profile_completion: int # percentage
    owned_fleet: int
    headquarters: List[str] = []
    turnover: List[FinancialRecord]
    net_profit: List[FinancialRecord]
    industry_served: List[str]
    truck_asset_details: List[str]
    overall_rating: float
    last_updated: str
    years_of_experience: int
    operating_lanes: List[OperatingLane]

class NegotiationStatusResponse(BaseModel):
    rfq_id: str
    status: str
    active_lsps: List[str]
    rates: Dict[str, float]
    benchmark_price: float
    recommendation: Optional[Dict[str, Any]] = None
    transporter_details: Optional[List[TransporterEntry]] = None