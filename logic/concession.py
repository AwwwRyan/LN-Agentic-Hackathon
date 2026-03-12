from typing import List, Dict

def calculate_concession_rate(history_list: List[Dict]) -> float:
    """Calculates the concession rate based on the first and latest quotes."""
    if len(history_list) < 2:
        return 0.0
    
    first_quote = history_list[0]["quote"]
    latest_quote = history_list[-1]["quote"]
    
    if first_quote == 0:
        return 0.0
        
    return (first_quote - latest_quote) / first_quote

def classify_flexibility(concession_rate: float) -> str:
    """Classifies LSP flexibility based on concession rate."""
    if concession_rate > 0.08:
        return "high"
    elif concession_rate < 0.03:
        return "low"
    else:
        return "medium"
