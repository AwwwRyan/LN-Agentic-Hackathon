from typing import List, Dict, Any

def compute_scores(active_lsps: List[str], rates: Dict[str, float], 
                   benchmark: float, lsp_profiles: Dict[str, Dict[str, Any]]) -> Dict[str, float]:
    scores = {}
    for lsp_id in active_lsps:
        profile = lsp_profiles.get(lsp_id, {})
        
        # --- 1. Quote Score ---
        current_rate = rates.get(lsp_id, 0)
        if current_rate <= 0:
            current_rate = benchmark * 1.5
        
        quote_ratio = benchmark / current_rate
        quote_score = min(quote_ratio * 100, 100)
        
        # --- 2. Profile Score Components ---
        
        # Fleet Score: min(owned_fleet / 150, 1.0) * 100
        fleet_size = float(profile.get("owned_fleet", 0))
        fleet_score = min(fleet_size / 150.0, 1.0) * 100.0

        # Rating Score: (overall_rating / 5.0) * 100
        overall_rating = float(profile.get("overall_rating", 3.0))
        rating_score = (overall_rating / 5.0) * 100.0

        # Turnover Score: min(turnover_cr / 200, 1.0) * 100
        turnover_list = profile.get("turnover", [])
        turnover_cr = 0.0
        if turnover_list:
            try:
                turnover_cr = float(turnover_list[0].get("amount", 0))
            except (ValueError, TypeError):
                pass
        turnover_score = min(turnover_cr / 200.0, 1.0) * 100.0

        # Profit Score: min(profit_cr / 30, 1.0) * 100
        profit_list = profile.get("net_profit", [])
        profit_cr = 0.0
        if profit_list:
            try:
                profit_cr = float(profit_list[0].get("amount", 0))
            except (ValueError, TypeError):
                pass
        profit_score = min(profit_cr / 30.0, 1.0) * 100.0

        # Experience Score: min(years_of_experience / 20, 1.0) * 100
        experience = float(profile.get("years_of_experience", 2))
        experience_score = min(experience / 20.0, 1.0) * 100.0

        # Composite Profile Score
        profile_score = (
            (fleet_score * 0.25) +
            (rating_score * 0.30) +
            (turnover_score * 0.20) +
            (profit_score * 0.15) +
            (experience_score * 0.10)
        )

        # --- 3. Reliability Score ---
        # Deriving Reliability from the overall Rating (could also factor in profile completion, but user mapped Rating to 5.0)
        reliability_score = rating_score

        # --- Final Negotiation Score ---
        final_score = (
            (quote_score * 0.50) +
            (profile_score * 0.30) +
            (reliability_score * 0.20)
        )

        scores[lsp_id] = round(final_score, 2)
        
    return scores
