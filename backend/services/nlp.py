# services/nlp.py

from transformers import pipeline

sentiment_model = pipeline("sentiment-analysis")

def analyze_reviews(reviews):
    # 🔥 CRITICAL FIX
    if not reviews or len(reviews) == 0:
        return {
            "positive": 0,
            "negative": 0,
            "total": 0
        }

    try:
        sentiments = sentiment_model(reviews[:50])

        positive = sum(1 for s in sentiments if s['label'] == 'POSITIVE')
        negative = sum(1 for s in sentiments if s['label'] == 'NEGATIVE')

        return {
            "positive": positive,
            "negative": negative,
            "total": len(sentiments)
        }

    except Exception as e:
        print("NLP error:", e)

        # fallback safe response
        return {
            "positive": 0,
            "negative": 0,
            "total": 0
        }