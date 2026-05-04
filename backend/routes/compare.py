# routes/compare.py

from flask import Blueprint, request, jsonify
from services.amazon_scraper import get_listing_data, get_reviews
from services.purchase_criteria import extract_purchase_criteria
from services.revenue import estimate_amazon_revenue
from services.llm import generate_competitor_analysis
from services.nlp import analyze_reviews

compare_bp = Blueprint("compare", __name__)


@compare_bp.route("/compare", methods=["POST"])
def compare():
    """
    POST body:
    {
        "your_url": "https://amazon.in/dp/B0ABC...",
        "competitor_urls": ["https://amazon.in/dp/B0XYZ...", ...]
    }

    Returns a full competitor intelligence report.
    """
    body = request.json or {}
    your_url         = body.get("your_url", "").strip()
    competitor_urls  = [u.strip() for u in body.get("competitor_urls", []) if u.strip()]

    if not your_url:
        return jsonify({"error": "your_url is required"}), 400

    all_urls = [your_url] + competitor_urls[:9]  # max 10 total

    # ── 1. Fetch listing data + reviews for each product ─────────────────────
    products = []
    all_reviews = []

    for i, url in enumerate(all_urls):
        is_primary = (i == 0)
        print(f"\n{'='*50}")
        print(f"[Compare] Processing {'YOUR LISTING' if is_primary else f'Competitor {i}'}: {url}")

        listing = get_listing_data(url)
        asin    = listing.get("asin", "")
        reviews = get_reviews(asin) if asin else []

        listing["reviews"]    = reviews
        listing["is_primary"] = is_primary
        products.append(listing)
        all_reviews.extend(reviews)

        print(f"[Compare] Got {len(reviews)} reviews for {listing['title'][:50]}")

    # ── 2. Purchase criteria (across ALL reviews combined) ────────────────────
    purchase_criteria = extract_purchase_criteria(all_reviews)

    # ── 3. Revenue estimation for each product ────────────────────────────────
    for p in products:
        p["revenue"] = estimate_amazon_revenue(
            bought_last_month=p.get("bought_last_month", 0),
            price=p.get("price", 0),
            review_count=p.get("review_count", 0),
            rating=p.get("rating", 0),
        )
        # Sentiment for each product's reviews
        p["sentiment"] = analyze_reviews(p["reviews"])

    # ── 4. Competitor LLM analysis ────────────────────────────────────────────
    competitor_analysis = generate_competitor_analysis(products)

    # ── 5. Sort competitors by monthly revenue (descending) ──────────────────
    sorted_products = sorted(
        products,
        key=lambda x: x["revenue"].get("raw_monthly", 0),
        reverse=True,
    )

    # Add rank and strip large review text from response (keep only count)
    for rank, p in enumerate(sorted_products, start=1):
        p["rank"]         = rank
        p["review_count"] = len(p.pop("reviews", []))  # send count, not full text

    return jsonify({
        "products":           sorted_products,
        "purchase_criteria":  purchase_criteria,
        "analysis":           competitor_analysis,
        "total_reviews_used": len(all_reviews),
    })
