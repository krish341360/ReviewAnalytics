# services/revenue.py


def estimate_amazon_revenue(
    bought_last_month: int,
    price: float,
    review_count: int = 0,
    rating: float = 0,
) -> dict:
    """
    Estimate Amazon revenue for a single listing.

    Primary signal: bought_last_month (Amazon's own badge, e.g. "50+ bought in past month")
    Fallback signal: review_count heuristic (when bought_last_month = 0)
    """

    # ── Primary: bought_last_month ────────────────────────────────────────────
    if bought_last_month > 0:
        monthly_units   = bought_last_month
        monthly_revenue = monthly_units * price
        annual_revenue  = monthly_revenue * 12
        confidence      = "high"

    # ── Fallback: review-count heuristic ─────────────────────────────────────
    # Industry benchmark: ~3% of buyers leave a review on Amazon India.
    # monthly_units ≈ total_reviews × monthly_review_rate
    # We assume reviews accumulated over ~12 months.
    elif review_count > 0:
        monthly_units   = max(1, int(review_count / 12 / 0.03))
        monthly_revenue = monthly_units * price
        annual_revenue  = monthly_revenue * 12
        confidence      = "low"

    else:
        monthly_units   = 0
        monthly_revenue = 0
        annual_revenue  = 0
        confidence      = "none"

    # ── Revenue lost from poor ratings ────────────────────────────────────────
    # Products with rating < 4.0 lose ~20% of potential sales
    if rating > 0 and rating < 4.0:
        penalty_rate    = (4.0 - rating) * 0.10  # 10% loss per 1-star below 4
        lost_revenue    = monthly_revenue * penalty_rate
    else:
        lost_revenue    = 0

    return {
        "monthly_units":   monthly_units,
        "monthly_revenue": f"₹{monthly_revenue:,.0f}",
        "annual_revenue":  f"₹{annual_revenue:,.0f}",
        "lost_to_rating":  f"₹{lost_revenue:,.0f}" if lost_revenue > 0 else None,
        "raw_monthly":     monthly_revenue,  # for sorting/charting
        "confidence":      confidence,
        "note": (
            f"Based on {'Amazon badge' if bought_last_month else 'review-count estimate'}. "
            f"Price: ₹{price:,.0f}/unit."
        ),
    }


def estimate_revenue(review_count: int, sentiment: dict = None, avg_price: float = None) -> dict:
    """Legacy single-product endpoint (kept for /analyze route)."""
    price    = avg_price or 29
    positive = sentiment.get("positive", 0) if sentiment else 0
    negative = sentiment.get("negative", 0) if sentiment else 0
    total    = sentiment.get("total", review_count) if sentiment else review_count

    satisfaction_rate = round((positive / total) * 100, 1) if total > 0 else 0

    RATIO        = 50
    CHURN_RATE   = 3
    WOM_MULT     = 5
    buyers       = review_count * RATIO
    revenue      = buyers * price
    lost         = negative * CHURN_RATE * price
    opportunity  = (negative * CHURN_RATE + positive * WOM_MULT * 0.1) * price

    return {
        "estimated_buyers":            f"{buyers:,}",
        "estimated_revenue":           f"${revenue:,.0f}",
        "lost_revenue_from_negatives": f"${lost:,.0f}",
        "revenue_opportunity":         f"${opportunity:,.0f}",
        "satisfaction_rate":           f"{satisfaction_rate}%",
        "note": f"Based on {review_count} reviews × {RATIO} buyers/review. Assumes avg price ${price}.",
    }