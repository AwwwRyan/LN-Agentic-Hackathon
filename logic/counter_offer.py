# logic/counter_offer.py
# 
# NOTE: Hard-coded logic for counter-offers has been removed.
# The negotiation strategy, including counter-offer prices and justifications,
# is now handled dynamically by the Gemini LLM in `agent/nodes.py` 
# via `llm/gemini_client.py`.
#
# This allows for a more sophisticated negotiation that considers:
# - Benchmark rates
# - LSP profile (fleet, experience, lanes, profit index)
# - Negotiation history and round count
# - Professional tone and justification
