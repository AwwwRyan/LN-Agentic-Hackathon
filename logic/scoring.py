from typing import List, Dict, Any

def compute_scores(active_lsps: List[str], rates: Dict[str, float], 
                   benchmark: float, lsp_profiles: Dict[str, Dict[str, Any]]) -> Dict[str, float]:
    """
    Computes an integrated score for each LSP balancing cost with service excellence:
    - Price Score (35%): Competitive positioning vs market benchmark
    - Service Reliability (40%): Driven by overall_rating and reliability_bonus
    - Operational Scale (25%): fleet size, years_of_experience, and profile completion
    """
    scores = {}
    for lsp_id in active_lsps:
        profile = lsp_profiles.get(lsp_id, {})
        
        # 1. Price Score (35%) - Decreased from 50% to allow for quality over purely lowest price
        current_rate = rates.get(lsp_id, benchmark * 1.5)
        # We use a non-linear decay so prices far above benchmark drop score sharply
        # benchmark/rate of 1.0 = 100, 0.8 = 80, 0.5 = 50
        price_ratio = (benchmark / current_rate) if current_rate > 0 else 0
        price_score = min(price_ratio * 100, 100)
        
        # 2. Service Reliability (25% Base + 15% Bonus = 40% Total)
        # Professional rating is the strongest signal for 'Why' selection
        rating = profile.get("overall_rating", 3.0)
        rating_score = (rating / 5.0) * 100
        
        # Multiplier effect: high-rated LSPs get an exponential boost
        reliability_bonus = 0
        if rating >= 4.8:
            reliability_bonus = 100
        elif rating >= 4.5:
            reliability_bonus = 85
        elif rating >= 4.0:
            reliability_bonus = 60
        else:
            reliability_bonus = 20 # Low rating is a strong 'Why not'
        
        # 3. Operational Scale (25% Composite)
        fleet_size = profile.get("owned_fleet", 0)
        fleet_score = min((fleet_size / 300) * 100, 100) # Scale of 300+ trucks is elite
        
        experience = profile.get("years_of_experience", 2)
        exp_score = min((experience / 15) * 100, 100) # 15+ years is veteran
        
        profile_comp = profile.get("profile_completion", 50)
        
        scale_composite = (fleet_score * 0.4) + (exp_score * 0.4) + (profile_comp * 0.2)

        # 4. Final Weighted Scoring
        final_score = (
            (price_score * 0.35) + 
            (rating_score * 0.25) + 
            (reliability_bonus * 0.15) + 
            (scale_composite * 0.25)
        )
        
        # Penalty: If rating is below 3.5, cap the score at 65 (prevent cheap/bad LSPs)
        if rating < 3.5:
            final_score = min(final_score, 65.0)
        
        scores[lsp_id] = round(final_score, 2)
        
    return scores
