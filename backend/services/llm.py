# services/llm.py

from openai import OpenAI
import anthropic
from config import Config


# ── Single-product analysis ───────────────────────────────────────────────────

def generate_insights(reviews: list[str]) -> dict:
    """GPT analysis + Claude critique for a single product's reviews."""
    if not reviews:
        return {"gpt": "No reviews to analyze.", "claude": "No reviews to analyze."}

    review_text = "\n".join(f"- {r[:300]}" for r in reviews[:50])
    gpt_out    = _run_gpt_single(review_text)
    claude_out = _run_claude_critique(review_text, gpt_out)

    return {"gpt": gpt_out, "claude": claude_out}


# ── Competitor / market analysis ──────────────────────────────────────────────

COMPETITOR_PROMPT = """You are an Amazon marketplace strategist. Below is structured data for {n} products in the same category — including their titles, prices, ratings, monthly sales estimates, and sample customer reviews.

Your analysis must cover:

**Market Overview:**
(1-2 sentences on the competitive landscape)

**What Customers Value Most:**
- (top 3-4 purchase criteria driving buying decisions in this category)

**Competitive Gaps (Opportunities):**
- (specific weaknesses or unmet needs across competitor reviews that represent opportunities)

**Your Listing vs Competitors:**
- (direct comparison — where the primary listing is stronger or weaker)

**3 Actionable Recommendations to Win:**
1.
2.
3.

Products data:
{products_data}

Combined review highlights:
{review_highlights}
"""

def generate_competitor_analysis(products: list[dict]) -> dict:
    """
    Analyze up to 10 products as a competitive set.
    products: list of dicts with keys: title, price, rating, review_count,
              bought_last_month, reviews (list), is_primary (bool)
    """
    if not products:
        return {"gpt": "No products to analyze.", "claude": "No analysis available."}

    # Build compact products summary
    lines = []
    for i, p in enumerate(products):
        tag = "★ YOUR LISTING" if p.get("is_primary") else f"Competitor {i}"
        lines.append(
            f"{tag}: {p['title'][:80]}\n"
            f"  Price: ₹{p['price']} | Rating: {p['rating']}⭐ | "
            f"Reviews: {p['review_count']} | Est. Monthly Sales: {p.get('bought_last_month', '?')} units"
        )

    # Combine a sample of reviews across all products
    all_reviews = []
    for p in products:
        all_reviews.extend(p.get("reviews", [])[:10])

    review_highlights = "\n".join(f"- {r[:200]}" for r in all_reviews[:60])

    prompt = COMPETITOR_PROMPT.format(
        n=len(products),
        products_data="\n\n".join(lines),
        review_highlights=review_highlights or "No review text available.",
    )

    gpt_out    = _run_gpt_competitor(prompt)
    claude_out = _run_claude_market(prompt, gpt_out)

    return {"gpt": gpt_out, "claude": claude_out}


# ── GPT helpers ───────────────────────────────────────────────────────────────

SINGLE_PROMPT = """You are a senior product analyst. Analyze these customer reviews and return a structured report:

**Overall Sentiment:** (one sentence)

**Top Praised Aspects:**
- (max 4 bullets)

**Top Complaints:**
- (max 4 bullets)

**Key Customer Pain Points:**
- (max 3 bullets)

**Actionable Recommendations:**
- (max 3 specific, practical bullets)

Reviews:
{reviews}
"""

def _run_gpt_single(review_text: str) -> str:
    if not Config.OPENAI_API_KEY:
        return "OpenAI API key not set."
    try:
        client = OpenAI(api_key=Config.OPENAI_API_KEY)
        r = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a concise, data-driven product analyst."},
                {"role": "user",   "content": SINGLE_PROMPT.format(reviews=review_text)},
            ],
            temperature=0.4,
            max_tokens=600,
        )
        return r.choices[0].message.content.strip()
    except Exception as e:
        print(f"[GPT single] {e}")
        return f"GPT analysis failed: {e}"


def _run_gpt_competitor(prompt: str) -> str:
    if not Config.OPENAI_API_KEY:
        return "OpenAI API key not set."
    try:
        client = OpenAI(api_key=Config.OPENAI_API_KEY)
        r = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a senior Amazon marketplace strategist. Be specific and actionable."},
                {"role": "user",   "content": prompt},
            ],
            temperature=0.4,
            max_tokens=800,
        )
        return r.choices[0].message.content.strip()
    except Exception as e:
        print(f"[GPT competitor] {e}")
        return f"GPT analysis failed: {e}"


# ── Claude helpers ────────────────────────────────────────────────────────────

CLAUDE_SINGLE = """Given these customer reviews:
{reviews}

And GPT's analysis:
{gpt}

Provide a brief critical second opinion:
1. Most important insight GPT missed
2. The single most urgent issue to fix
3. One non-obvious opportunity"""

CLAUDE_MARKET = """GPT's competitive analysis:
{gpt}

As a contrarian strategist, identify:
1. The biggest risk GPT's analysis underestimates
2. The single highest-ROI action to take in the next 30 days
3. A market positioning angle competitors are completely ignoring"""

def _run_claude_critique(review_text: str, gpt_analysis: str) -> str:
    if not Config.ANTHROPIC_API_KEY:
        return "Anthropic API key not set."
    try:
        client = anthropic.Anthropic(api_key=Config.ANTHROPIC_API_KEY)
        msg = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=400,
            messages=[{"role": "user", "content": CLAUDE_SINGLE.format(reviews=review_text[:2000], gpt=gpt_analysis)}],
        )
        return msg.content[0].text.strip()
    except Exception as e:
        print(f"[Claude critique] {e}")
        return f"Claude failed: {e}"


def _run_claude_market(prompt: str, gpt_analysis: str) -> str:
    if not Config.ANTHROPIC_API_KEY:
        return "Anthropic API key not set."
    try:
        client = anthropic.Anthropic(api_key=Config.ANTHROPIC_API_KEY)
        msg = client.messages.create(
            model="claude-3-5-haiku-20241022",
            max_tokens=500,
            messages=[{"role": "user", "content": CLAUDE_MARKET.format(gpt=gpt_analysis)}],
        )
        return msg.content[0].text.strip()
    except Exception as e:
        print(f"[Claude market] {e}")
        return f"Claude failed: {e}"