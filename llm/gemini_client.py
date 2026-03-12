import os
import json
import logging
import asyncio
from typing import Dict, Any, List, Optional, Literal
from pydantic import BaseModel, Field
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

logger = logging.getLogger(__name__)

# --- Structured Output Models ---

class NegotiationDecision(BaseModel):
    """The AI decision for a single LSP negotiation round."""
    decision: Literal["ACCEPT", "COUNTER", "DROP"] = Field(description="The action to take.")
    justification: str = Field(description="Message sent to the LSP explaining the decision.")
    counter_price: Optional[float] = Field(description="The numeric counter price (only for COUNTER).")
    reasoning: str = Field(description="Internal logic for the procurement manager to see.")

class FinalRecommendation(BaseModel):
    """The final integrated recommendation for the human procurement manager."""
    best_lsp_name: str = Field(description="Name of the top-ranked LSP based on price and service metrics.")
    analysis_why: str = Field(
        description="Detailed explanation: focus on PRICE vs RELIABILITY trade-off. "
        "Explain WHY this carrier's specific fleet and rating makes them the better choice "
        "even if they aren't the absolute cheapest."
    )
    final_price: float = Field(description="The final negotiated price.")
    savings_pct: float = Field(description="Percentage saved vs benchmark.")
    strategic_fit: str = Field(
        description="How this LSP aligns with long-term strategy (e.g., dedicated fleet access, high reliability for fragile cargo)."
    )
    reliability_and_risks: str = Field(
        description="Detailed breakdown of rating, owned fleet size, and any historical performance flags."
    )
    other_lsp_analysis: str = Field(
        description="Comparison with losing bids. Focus on why their lower price didn't offset their lower reliability."
    )
    confidence_level: Literal["High", "Medium", "Low"] = Field(
        description="Confidence in this recommendation based on the data points available."
    )


# --- System Prompt ---

SYSTEM_PROMPT = """You are an autonomous freight procurement negotiation agent for Lorri.ai.
YOUR ROLE: You balance COST SAVINGS with SERVICE EXCELLENCE.

CORE PHILOSOPHY:
1. Price is crucial, but RELIABILITY is paramount. A cheap truck that doesn't show up costs more in the long run.
2. The "Market Benchmark" is a guide, not a hard ceiling. High-service-quality LSPs (4.5+ rating, 200+ fleet) carry a premium.
3. JUSTIFICATION is your most important output. You must explain the logic of selecting an LSP based on their holistic profile.

STRATEGIC DECISION RULES:
- If LSP A is ₹2,000 cheaper than LSP B, but LSP B has a 4.8 rating vs LSP A's 3.2 → Recommend LSP B and JUSTIFY the premium.
- Favor LSPs with "Elite" status (high rating + large fleet).
- If an LSP is 15%+ above benchmark but has specialized lane experience or a massive fleet, don't drop them immediately; negotiate to find a "Reliability Premium" middle ground.

NEGOTIATION TACTICS (AI MODE):
- If Quote is BELOW benchmark → ACCEPT immediately.
- If Quote is 5-25% ABOVE benchmark → COUNTER. 
- Counter Formula: benchmark + (quote - benchmark) * 0.25. (Offer to meet 25% of the way from benchmark).
- If LSP shows NO movement for 2 rounds → DROP.
- NEVER counter higher than the LSP's latest quote.

JUSTIFICATION STYLE:
- Professional, data-driven, and analytical.
- Use terms like "Service Premium," "Reliability Buffer," "Operational Scale," and "Lane Density."
"""


class GeminiNegotiator:
    def __init__(self):
        self.api_key = os.getenv("GOOGLE_API_KEY")
        if not self.api_key:
            logger.warning("GOOGLE_API_KEY not found in environment.")
        
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash",
            google_api_key=self.api_key,
            temperature=0.1
        )
        
        self.decision_parser = PydanticOutputParser(pydantic_object=NegotiationDecision)
        self.recommendation_parser = PydanticOutputParser(pydantic_object=FinalRecommendation)
        
        self.decision_chain = self.llm.with_structured_output(NegotiationDecision)
        self.recommendation_chain = self.llm.with_structured_output(FinalRecommendation)

    async def decide_negotiation_action(self, rfq: Dict[str, Any], lsp_profile: Dict[str, Any], 
                                        benchmark: float, history: List[Dict[str, Any]], 
                                        round_num: int) -> Dict[str, Any]:
        """Decide: ACCEPT, COUNTER, or DROP for this LSP."""
        last_quote = history[-1]["quote"]
        lane = f"{rfq.get('origin_name_cleaned')} to {rfq.get('destination_name_cleaned')}"
        cargo = f"{rfq.get('truck_type')} ({rfq.get('capacity')})"
        budget = rfq.get("max_budget", 0)
        
        # Check lane experience
        has_lane_exp = any(
            l.get('origin', {}).get('location_name') == rfq.get('origin_name_cleaned') or
            l.get('destination', {}).get('location_name') == rfq.get('destination_name_cleaned')
            for l in lsp_profile.get('operating_lanes', [])
        )

        prompt = f"""
        {SYSTEM_PROMPT}

        === LIVE NEGOTIATION TASK ===
        LSP Profile: {json.dumps({k: v for k, v in lsp_profile.items() if k != 'past_lane_history'}, indent=2)}
        Manufacturer Budget: {f'₹{budget:,.0f}' if budget else 'Not Specified'} (MUST STAY BELOW THIS IF POSSIBLE)
        Lane: {lane}
        Cargo: {cargo}
        Round: {round_num}
        Market Benchmark: ₹{benchmark:,.2f}
        Current Quote: ₹{last_quote:,.2f}
        History: {json.dumps(history, indent=2)}

        Decide: ACCEPT, COUNTER, or DROP for this LSP.
        
        CRITICAL: 
        1. If Quote > Manufacturer Budget, you MUST COUNTER aggressively or DROP if it's late rounds and they aren't moving.
        2. Reference their 'Lane Experience' ({'Verified Experience on Corridor' if has_lane_exp else 'First time on this Corridor'}) in your justification.
        3. If their quote (₹{last_quote:,.2f}) is BELOW both benchmark and budget, ACCEPT it.
        4. If you COUNTER, your counter_price MUST be LOWER than ₹{last_quote:,.2f}.
        """

        try:
            result = await self.decision_chain.ainvoke(prompt)
            decision = result.dict()
            
            # Decisiveness check
            if decision["decision"] == "COUNTER" and budget > 0 and last_quote > budget and round_num >= 2:
                # If late round and still above budget, reconsider DROP if no movement
                if len(history) > 1 and history[-1]["quote"] >= history[-2]["quote"]:
                    decision["decision"] = "DROP"
                    decision["reasoning"] = "LSP is stuck above manufacturer budget constraint after multiple rounds."

            # Safety: ensure counter_price is actually lower than the quote
            if decision["decision"] == "COUNTER" and decision.get("counter_price"):
                if decision["counter_price"] >= last_quote:
                    decision["counter_price"] = round(last_quote * 0.95, -2)

            return decision
        except Exception as e:
            logger.error(f"LLM error for negotiation: {e}")
            return {
                "decision": "COUNTER",
                "justification": f"We appreciate your quote for {lane}. To align with current market conditions, we propose a more competitive rate.",
                "counter_price": round(min(benchmark, last_quote * 0.9), -2),
                "reasoning": f"LLM error fallback: {str(e)}"
            }

    async def generate_final_recommendation(self, state: Dict[str, Any]) -> str:
        """Generates the final recommendation summary."""
        rfq = state['rfq']
        lane = f"{rfq.get('origin_name_cleaned', '?')} → {rfq.get('destination_name_cleaned', '?')}"
        budget = rfq.get("max_budget", 0)

        prompt = f"""
        {SYSTEM_PROMPT}

        === FINAL NEGOTIATION BATTLEBOARD ===
        Lane: {lane}
        Manufacturer Budget: {f'₹{budget:,.0f}' if budget else 'Not Specified'}
        Benchmark: ₹{state['benchmark_price']:,.2f}
        Total Rounds: {state.get('current_round', 0)}
        LSP Profiles: {json.dumps(state['lsp_profiles'], indent=2)}
        Active LSPs & Final Rates: {json.dumps(state['rates'], indent=2)}
        Scores: {json.dumps(state.get('scores', {}))}

        === TASK ===
        Generate a HACKATHON-READY summary that highlights the AGENT'S DECISION MAKING.
        Focus on:
        1. Trade-off: Price vs Reliability vs Lane Experience.
        2. Budget Alignment: Did we beat the budget constraint?
        3. Lane Specificity: Does the winner have proven operating experience on {lane}?
        4. Why not other LSPs? (Specifically: Low Rating, High Price, or lack of scale).

        Keep it sharp, bold, and DECISIVE.
        """

        try:
            res = await self.recommendation_chain.ainvoke(prompt)
            budget_status = ""
            if budget > 0:
                budget_status = "- **Budget Status:** ✅ UNDER BUDGET" if res.final_price <= budget else "- **Budget Status:** ⚠️ OVER BUDGET"

            return f"""
🚀 **NEGOTIATION COMPLETED**

🥇 **RECOMMENDED PARTNER: {res.best_lsp_name}**
{res.analysis_why}

💰 **FINANCIALS**
- **Win Price:** ₹{res.final_price:,.0f}
- **Benchmark:** ₹{state['benchmark_price']:,.0f}
{budget_status}
- **Savings:** {res.savings_pct}% vs Benchmark

🛡️ **STRATEGIC FIT**
{res.strategic_fit}

📋 **COMPETITIVE LANDSCAPE**
{res.other_lsp_analysis}

🎯 **CONFIDENCE:** {res.confidence_level}
            """.strip()
        except Exception as e:
            return f"Recommendation generation failed: {str(e)}"

    async def analyze_overall_strategy(self, state: Dict[str, Any]) -> Dict[str, Any]:
        """
        The 'Accumulator' LLM node.
        Looks at the board and decides if we should continue or stop.
        """
        prompt = f"""
        You are the Head of Procurement Strategy. Review this live negotiation board.
        
        Lane: {state['rfq'].get('origin_name_cleaned')} -> {state['rfq'].get('destination_name_cleaned')}
        Benchmark: ₹{state['benchmark_price']}
        Current Quotes: {json.dumps(state['rates'])}
        Scores: {json.dumps(state.get('scores', {}))}
        Round: {state.get('current_round')}
        
        Decide:
        1. Is there a 'Clear Winner'? (Price below/near benchmark + High Reliability)
        2. Should we push harder on any specific LSP?
        3. Should we wrap up?
        
        Return a JSON with: 'should_stop' (bool), 'strategic_message' (str), 'focus_lsp' (id or null).
        """
        res = await self.llm.ainvoke(prompt)
        return {"insight": res.content}

gemini_negotiator = GeminiNegotiator()
