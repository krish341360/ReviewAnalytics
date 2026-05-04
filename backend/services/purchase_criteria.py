# services/purchase_criteria.py

import re
from config import Config

# ── GPT-powered extraction ────────────────────────────────────────────────────

CRITERIA_PROMPT = """You are an Amazon product analyst. Below are customer reviews for one or more products in the same category.

Your task: identify the TOP 8 KEY PURCHASE CRITERIA that customers use to evaluate products in this category.

For each criterion, output a JSON array with this exact format:
[
  {{
    "criterion": "Display Quality",
    "mentions": 42,
    "positive_mentions": 35,
    "negative_mentions": 7,
    "representative_quote": "The display is incredibly sharp and vivid",
    "is_gap": false
  }},
  ...
]

Rules:
- "mentions" = total times this criterion appears in reviews
- "positive_mentions" = times it was praised
- "negative_mentions" = times it was complained about
- "is_gap" = true if more than 40% of mentions are negative (opportunity for improvement)
- Order by mentions descending
- Use concise criterion names (2-4 words max)
- Extract EXACTLY 8 criteria
- Return ONLY valid JSON, no markdown fences

Reviews:
{reviews}
"""


def extract_purchase_criteria(all_reviews: list[str]) -> list[dict]:
    """
    Given a combined list of reviews from multiple products,
    use GPT to extract the top 8 key purchase criteria.
    Falls back to keyword-frequency analysis if GPT is unavailable.
    """
    if not all_reviews:
        return []

    # Use up to 100 reviews (enough for GPT, saves tokens)
    sample = all_reviews[:100]
    review_text = "\n".join(f"- {r[:300]}" for r in sample)

    if Config.OPENAI_API_KEY:
        result = _run_gpt_criteria(review_text)
        if result:
            return result

    # Fallback: keyword frequency
    return _keyword_frequency_criteria(all_reviews)


# ── GPT call ──────────────────────────────────────────────────────────────────

def _run_gpt_criteria(review_text: str) -> list[dict] | None:
    try:
        from openai import OpenAI
        client = OpenAI(api_key=Config.OPENAI_API_KEY)

        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a precise JSON-outputting product analyst. Return only valid JSON arrays."
                },
                {
                    "role": "user",
                    "content": CRITERIA_PROMPT.format(reviews=review_text)
                }
            ],
            temperature=0.2,
            max_tokens=800,
        )

        raw = response.choices[0].message.content.strip()

        # Strip any accidental markdown fences
        raw = re.sub(r"```json\s*|```\s*", "", raw).strip()

        import json
        criteria = json.loads(raw)

        # Validate and compute sentiment score
        for c in criteria:
            total = c.get("mentions", 1) or 1
            pos   = c.get("positive_mentions", 0)
            c["sentiment_score"] = round(pos / total, 2)

        print(f"[PurchaseCriteria] Extracted {len(criteria)} criteria via GPT")
        return criteria

    except Exception as e:
        print(f"[PurchaseCriteria] GPT error: {e}")
        return None


# ── Keyword fallback ──────────────────────────────────────────────────────────

FEATURE_KEYWORDS = {
    "Display Quality":      ["display", "screen", "resolution", "brightness", "panel", "image quality"],
    "Build Quality":        ["build", "sturdy", "durable", "plastic", "metal", "premium", "flimsy"],
    "Price / Value":        ["price", "value", "worth", "expensive", "cheap", "affordable", "cost"],
    "Performance / Speed":  ["fast", "speed", "performance", "lag", "smooth", "responsive"],
    "Battery Life":         ["battery", "charge", "charging", "power", "drain"],
    "Customer Support":     ["support", "service", "customer care", "warranty", "replacement"],
    "Ease of Setup":        ["setup", "install", "easy", "simple", "plug", "configure"],
    "Refresh Rate / Gaming":["hz", "refresh", "gaming", "fps", "game", "144hz", "165hz", "180hz"],
}

def _keyword_frequency_criteria(reviews: list[str]) -> list[dict]:
    text = " ".join(reviews).lower()
    results = []

    for criterion, keywords in FEATURE_KEYWORDS.items():
        mentions = sum(text.count(k) for k in keywords)
        results.append({
            "criterion":          criterion,
            "mentions":           mentions,
            "positive_mentions":  0,
            "negative_mentions":  0,
            "sentiment_score":    0.5,
            "representative_quote": "",
            "is_gap":             False,
        })

    results.sort(key=lambda x: x["mentions"], reverse=True)
    print(f"[PurchaseCriteria] Extracted {len(results)} criteria via keyword fallback")
    return results
