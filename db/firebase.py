import os
import json
import firebase_admin
from firebase_admin import credentials, db, firestore
from datetime import datetime, date
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# --- SETUP ---
database_url = os.getenv("FIREBASE_RTDB_URL")

if not firebase_admin._apps:
    try:
        firebase_config = os.getenv("FIREBASE_CONFIG")
        if firebase_config:
            # Parse the JSON string from .env
            cred_dict = json.loads(firebase_config)
            cred = credentials.Certificate(cred_dict)
        else:
            # Fallback to file path
            cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
            if not cred_path:
                raise ValueError("Neither FIREBASE_CONFIG nor FIREBASE_CREDENTIALS_PATH provided in .env")
            cred = credentials.Certificate(cred_path)
            
        firebase_admin.initialize_app(cred, {
            'databaseURL': database_url
        })
    except Exception as e:
        logger.error(f"Failed to initialize Firebase: {e}")
        raise e

# rtdb = db.reference('/')
fs = firestore.client()

# Note: RTDB operations are currently disabled as per user request to undo RTDB changes.
# We will use local JSON for live negotiation data.

# --- QUOTE OPERATIONS ---

def push_quote(rfq_id: str, quote_object: Dict[str, Any]) -> str:
    """Push to rtdb quotes/{rfq_id}/rates using push()"""
    ref = rtdb.child('quotes').child(rfq_id).child('rates')
    new_quote_ref = ref.push(quote_object)
    return new_quote_ref.key

def update_counter_price(rfq_id: str, push_id: str, counter_price: float):
    """Use RTDB transaction on quotes/{rfq_id}/rates/{push_id}"""
    ref = rtdb.child('quotes').child(rfq_id).child('rates').child(push_id)
    
    def transaction_handler(current_data):
        if current_data is None:
            return None # Should not happen if push_id exists
        if current_data.get('counter_price') is not None:
            return # Already set, abort
        
        current_data['counter_price'] = counter_price
        current_data['counter_timestamp'] = datetime.now().isoformat()
        return current_data

    try:
        ref.transaction(transaction_handler)
    except db.TransactionAbortedError:
        pass # Silently abort as requested

def get_all_quotes(rfq_id: str) -> List[Dict[str, Any]]:
    """Read rtdb quotes/{rfq_id}/rates"""
    ref = rtdb.child('quotes').child(rfq_id).child('rates')
    data = ref.get()
    if not data:
        return []
    return list(data.values())

def get_lsp_quotes(rfq_id: str, lsp_id: str) -> List[Dict[str, Any]]:
    """Read rtdb quotes/{rfq_id}/rates filtered by lsp_id"""
    quotes = get_all_quotes(rfq_id)
    filtered = [q for q in quotes if q.get('transporter_id') == lsp_id]
    return sorted(filtered, key=lambda x: x.get('round_number', 0))

# --- NEGOTIATION META OPERATIONS ---

def init_negotiation_meta(rfq_id: str, benchmark_price: float, 
                          benchmark_type: str, benchmark_source: str):
    """Write to rtdb negotiations/{rfq_id}/meta"""
    ref = rtdb.child('negotiations').child(rfq_id).child('meta')
    ref.set({
        "current_round": 0,
        "status": "active",
        "benchmark_price": benchmark_price,
        "benchmark_type": benchmark_type,
        "benchmark_source": benchmark_source
    })

def increment_round(rfq_id: str) -> int:
    """Use RTDB transaction on negotiations/{rfq_id}/meta/current_round"""
    ref = rtdb.child('negotiations').child(rfq_id).child('meta').child('current_round')
    
    def transaction_handler(current_value):
        if current_value is None:
            return 1
        return current_value + 1

    return ref.transaction(transaction_handler)

def update_negotiation_status(rfq_id: str, new_status: str):
    """Use RTDB transaction on negotiations/{rfq_id}/meta/status"""
    ref = rtdb.child('negotiations').child(rfq_id).child('meta').child('status')
    
    valid_transitions = {
        "active": ["pending_human", "auto_booked", "cancelled"],
        "pending_human": ["booked", "cancelled", "active"],
        "auto_booked": ["booked"],
        "booked": [],
        "cancelled": []
    }

    def transaction_handler(current_status):
        if current_status is None:
            return new_status # Allow initial set if not exists, though init_meta handles it
        
        allowed = valid_transitions.get(current_status, [])
        if new_status not in allowed:
            logger.warning(f"Invalid transition attempt for RFQ {rfq_id}: {current_status} -> {new_status}")
            return # Abort transaction
        
        return new_status

    try:
        ref.transaction(transaction_handler)
    except db.TransactionAbortedError:
        pass

def get_negotiation_meta(rfq_id: str) -> Dict[str, Any]:
    """Read rtdb negotiations/{rfq_id}/meta"""
    ref = rtdb.child('negotiations').child(rfq_id).child('meta')
    return ref.get() or {}

# --- LSP STATE OPERATIONS ---

def init_lsp_state(rfq_id: str, lsp_id: str, initial_quote: float):
    """Write to rtdb negotiations/{rfq_id}/lsp_states/{lsp_id}"""
    ref = rtdb.child('negotiations').child(rfq_id).child('lsp_states').child(lsp_id)
    ref.set({
        "status": "active",
        "current_quote": initial_quote,
        "concession_rate": 0.0,
        "flexibility": "unknown",
        "rounds_participated": 0,
        "drop_reason": None,
        "last_updated": datetime.now().isoformat()
    })

def update_lsp_state(rfq_id: str, lsp_id: str, updates: Dict[str, Any]):
    """Direct update to rtdb negotiations/{rfq_id}/lsp_states/{lsp_id}"""
    ref = rtdb.child('negotiations').child(rfq_id).child('lsp_states').child(lsp_id)
    payload = updates.copy()
    payload["last_updated"] = datetime.now().isoformat()
    ref.update(payload)

def drop_lsp(rfq_id: str, lsp_id: str, reason: str):
    """Update rtdb negotiations/{rfq_id}/lsp_states/{lsp_id}"""
    update_lsp_state(rfq_id, lsp_id, {
        "status": "dropped",
        "drop_reason": reason
    })

def get_all_lsp_states(rfq_id: str) -> Dict[str, Any]:
    """Read rtdb negotiations/{rfq_id}/lsp_states"""
    ref = rtdb.child('negotiations').child(rfq_id).child('lsp_states')
    return ref.get() or {}

def get_lsp_state(rfq_id: str, lsp_id: str) -> Dict[str, Any]:
    """Read rtdb negotiations/{rfq_id}/lsp_states/{lsp_id}"""
    ref = rtdb.child('negotiations').child(rfq_id).child('lsp_states').child(lsp_id)
    return ref.get() or {}

# --- FIRESTORE ---

def get_lsp_profile(lsp_id: str) -> Dict[str, Any]:
    """Read firestore transporters/{lsp_id}"""
    doc = fs.collection('transporters').document(lsp_id).get()
    return doc.to_dict() or {}

def get_all_lsp_profiles(lsp_ids: List[str]) -> Dict[str, Any]:
    """Read firestore transporters batch"""
    results = {}
    if not lsp_ids:
        return results
    
    # Batch reads
    collection_ref = fs.collection('transporters')
    # Firestore has a limit of 10-30 in IN queries, but let's just do individual doc refs for batch get
    doc_refs = [collection_ref.document(lid) for lid in lsp_ids]
    docs = fs.get_all(doc_refs)
    
    for doc in docs:
        if doc.exists:
            results[doc.id] = doc.to_dict()
        else:
            results[doc.id] = {}
    return results

def get_rfq(rfq_id: str) -> Dict[str, Any]:
    """Read firestore rfqs/{rfq_id}"""
    doc = fs.collection('rfqs').document(rfq_id).get()
    return doc.to_dict() or {}

def get_historical_rates(lane_key: str, truck_type: str) -> Optional[Dict[str, Any]]:
    """Read firestore historical_rates/{lane_key}"""
    doc_ref = fs.collection('historical_rates').document(lane_key)
    doc = doc_ref.get()
    if not doc.exists:
        return None
    
    data = doc.to_dict()
    entries = data.get('entries', [])
    for entry in entries:
        if entry.get('truck_type') == truck_type:
            return entry
    return None

def save_historical_rate(lane_key: str, truck_type: str, 
                         rfq_id: str, final_rate: float, winning_lsp: str):
    """Use Firestore transaction on historical_rates/{lane_key}"""
    transaction = fs.transaction()
    doc_ref = fs.collection('historical_rates').document(lane_key)

    @firestore.transactional
    def update_in_transaction(transaction, doc_ref):
        snapshot = doc_ref.get(transaction=transaction)
        
        new_transaction = {
            "rfq_id": rfq_id,
            "final_rate": final_rate,
            "transacted_on": date.today().isoformat(),
            "winning_lsp": winning_lsp
        }

        if snapshot.exists:
            data = snapshot.to_dict()
            entries = data.get('entries', [])
            found = False
            for entry in entries:
                if entry.get('truck_type') == truck_type:
                    found = True
                    entry['transactions'].append(new_transaction)
                    # Recalculate
                    all_rates = [t['final_rate'] for t in entry['transactions']]
                    entry['avg_rate'] = sum(all_rates) / len(all_rates)
                    entry['min_rate'] = min(all_rates)
                    entry['max_rate'] = max(all_rates)
                    break
            
            if not found:
                entries.append({
                    "truck_type": truck_type,
                    "transactions": [new_transaction],
                    "avg_rate": final_rate,
                    "min_rate": final_rate,
                    "max_rate": final_rate
                })
            
            transaction.update(doc_ref, {'entries': entries})
        else:
            transaction.set(doc_ref, {
                "lane_key": lane_key,
                "entries": [
                    {
                        "truck_type": truck_type,
                        "transactions": [new_transaction],
                        "avg_rate": final_rate,
                        "min_rate": final_rate,
                        "max_rate": final_rate
                    }
                ]
            })

    update_in_transaction(transaction, doc_ref)

def save_outcome(rfq_id: str, outcome_data: Dict[str, Any]):
    """Use firestore create() NOT set()"""
    doc_ref = fs.collection('outcomes').document(rfq_id)
    payload = outcome_data.copy()
    payload["closed_at"] = firestore.SERVER_TIMESTAMP
    
    try:
        doc_ref.create(payload)
    except Exception as e:
        if "already exists" in str(e).lower():
            logger.warning(f"Outcome {rfq_id} already saved. Skipping.")
        else:
            raise e

def get_outcome(rfq_id: str) -> Optional[Dict[str, Any]]:
    """Read outcomes/{rfq_id}"""
    doc = fs.collection('outcomes').document(rfq_id).get()
    return doc.to_dict() if doc.exists else None
