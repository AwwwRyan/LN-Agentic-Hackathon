import json
import os
import asyncio
from datetime import datetime
from typing import Dict, Any, List

# Local JSON storage paths
STORAGE_DIR = "data/storage"
RFQS_FILE = f"{STORAGE_DIR}/rfqs.json"
QUOTES_FILE = f"{STORAGE_DIR}/quotes.json"
OUTCOMES_FILE = f"{STORAGE_DIR}/outcomes.json"

async def init_db():
    os.makedirs(STORAGE_DIR, exist_ok=True)
    for f in [RFQS_FILE, QUOTES_FILE, OUTCOMES_FILE]:
        if not os.path.exists(f):
            with open(f, "w") as file:
                json.dump({}, file)

def _load_json(filename: str) -> Dict[str, Any]:
    if not os.path.exists(filename):
        return {}
    try:
        with open(filename, "r") as f:
            return json.load(f)
    except:
        return {}

def _save_json(filename: str, data: Dict[str, Any]):
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, "w") as f:
        json.dump(data, f, indent=4, default=str)

async def save_rfq(rfq_data: Dict[str, Any]):
    rfqs = _load_json(RFQS_FILE)
    rfqs[rfq_data["rfq_id"]] = rfq_data
    _save_json(RFQS_FILE, rfqs)

async def save_quote(rfq_id: str, lsp_id: str, round_num: int, quote_price: float, counter_price: float = None):
    quotes = _load_json(QUOTES_FILE)
    if rfq_id not in quotes:
        quotes[rfq_id] = []
    
    quotes[rfq_id].append({
        "lsp_id": lsp_id,
        "round": round_num,
        "quote": quote_price,
        "counter": counter_price,
        "timestamp": datetime.now().isoformat()
    })
    _save_json(QUOTES_FILE, quotes)

async def save_outcome(rfq_id: str, outcome_data: Dict[str, Any], benchmark: float = 0.0):
    outcomes = _load_json(OUTCOMES_FILE)
    outcomes[rfq_id] = {
        **outcome_data,
        "benchmark_at_close": benchmark,
        "closed_at": datetime.now().isoformat()
    }
    _save_json(OUTCOMES_FILE, outcomes)
