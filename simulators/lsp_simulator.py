import random
from typing import Dict, Any

class LSPSimulator:
    """Simulates LSP behavior based on personality types."""
    
    PERSONALITIES = {
        "LSP-001": { # stubborn
            "initial_mult": 1.03,
            "reduce_rate": 0.015,
            "stop_round": 3,
            "floor_mult": 0.96
        },
        "LSP-002": { # aggressive
            "initial_mult": 0.97,
            "reduce_range": (0.04, 0.06),
            "big_drop_round": 3,
            "floor_mult": 0.88
        },
        "LSP-003": { # strategic
            "initial_mult": 1.05,
            "early_reduce": 0.01,
            "late_reduce_range": (0.07, 0.09),
            "floor_mult": 0.91
        }
    }

    def get_initial_quote(self, lsp_id: str, rfq: Dict[str, Any]) -> float:
        """Generates initial quote based on personality."""
        budget = rfq["budget"]
        config = self.PERSONALITIES.get(lsp_id, self.PERSONALITIES["LSP-001"])
        
        multiplier = config["initial_mult"]
        noise = random.uniform(-0.01, 0.01)
        
        quote = budget * (multiplier + noise)
        return round(quote, -2)

    def get_counter_response(self, lsp_id: str, round_number: int, 
                             counter_price: float, rfq: Dict[str, Any]) -> float:
        """Generates a response to a counter-offer based on personality."""
        budget = rfq["budget"]
        config = self.PERSONALITIES.get(lsp_id, self.PERSONALITIES["LSP-001"])
        floor = budget * config["floor_mult"]
        
        # Determine how much they are willing to reduce this round
        if lsp_id == "LSP-001": # stubborn
            if round_number > config["stop_round"]:
                reduction = 0
            else:
                reduction = budget * config["reduce_rate"]
        elif lsp_id == "LSP-002": # aggressive
            rate = random.uniform(*config["reduce_range"])
            if round_number == config["big_drop_round"]:
                rate += 0.02
            reduction = budget * rate
        elif lsp_id == "LSP-003": # strategic
            if round_number <= 2:
                reduction = budget * config["early_reduce"]
            else:
                rate = random.uniform(*config["late_reduce_range"])
                reduction = budget * rate
        else:
            reduction = budget * 0.02

        # Start from their last quote (not directly from counter_price)
        # In a real scenario, we'd have the history. For simplicity here,
        # let's assume they reduce toward the counter price but don't hit it necessarily.
        # But per requirements, they respond with a new quote.
        
        # Let's say they take the middle ground between their previous logic and the counter
        # To keep it simple and robust:
        new_quote = max(counter_price * 1.02, floor) # Simple mock logic
        
        # Add some randomness
        new_quote *= (1 + random.uniform(-0.005, 0.005))
        
        return round(new_quote, -2)

lsp_simulator = LSPSimulator()
