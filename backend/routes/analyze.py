from flask import Blueprint, request, jsonify
from services.scraper import scrape_reviews
from services.nlp import analyze_reviews
from services.llm import generate_insights
from services.revenue import estimate_revenue

analyze_bp = Blueprint("analyze", __name__)

# routes/analyze.py

@analyze_bp.route("/analyze", methods=["POST"])
def analyze():
    data = request.json
    urls = data.get("urls")

    results = []

    for url in urls:
        if not url or not url.startswith("http"):
            continue

        reviews = scrape_reviews(url)

        sentiment = analyze_reviews(reviews)
        insights = generate_insights(reviews)
        revenue = estimate_revenue(len(reviews), sentiment=sentiment)

        results.append({
            "url": url,
            "review_count": len(reviews),
            "sentiment": sentiment,
            "insights": insights,
            "revenue": revenue
        })

    return jsonify(results)