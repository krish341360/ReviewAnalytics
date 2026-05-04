# services/scraper.py

import re
import requests
from bs4 import BeautifulSoup


HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}


def scrape_reviews(url):
    """Detect platform from URL and route to the right scraper."""
    url = url.strip()

    if "trustpilot.com" in url:
        return scrape_trustpilot(url)
    elif "play.google.com" in url:
        return scrape_google_play(url)
    elif "store.steampowered.com" in url:
        return scrape_steam(url)
    elif "apps.apple.com" in url:
        return scrape_app_store(url)
    elif "flipkart.com" in url:
        return scrape_flipkart(url)
    else:
        print(f"Unsupported platform URL: {url}")
        print("Supported: trustpilot.com, play.google.com, store.steampowered.com, apps.apple.com, flipkart.com")
        return []


# ── Trustpilot ────────────────────────────────────────────────────────────────

def scrape_trustpilot(url):
    """Scrape reviews from a Trustpilot company page."""
    response = requests.get(url, headers=HEADERS, timeout=10)
    soup = BeautifulSoup(response.text, "html.parser")

    reviews = []
    for el in soup.select("p[data-service-review-text-typography='true']"):
        text = el.get_text(strip=True)
        if text:
            reviews.append(text)

    print(f"[Trustpilot] Scraped {len(reviews)} reviews")
    return reviews


# ── Google Play ───────────────────────────────────────────────────────────────

def scrape_google_play(url):
    """Scrape Google Play app reviews using google-play-scraper package."""
    try:
        from google_play_scraper import reviews, Sort
    except ImportError:
        print("[Google Play] Package not installed. Run: pip install google-play-scraper")
        return []

    match = re.search(r'id=([a-zA-Z0-9._]+)', url)
    if not match:
        print("[Google Play] Could not extract app ID from URL")
        return []

    app_id = match.group(1)
    result, _ = reviews(app_id, lang='en', count=20, sort=Sort.MOST_RELEVANT)
    texts = [r['content'] for r in result if r.get('content')]
    print(f"[Google Play] Scraped {len(texts)} reviews for {app_id}")
    return texts


# ── Steam ─────────────────────────────────────────────────────────────────────

def scrape_steam(url):
    """Scrape Steam game reviews using Steam's free public JSON API."""
    match = re.search(r'/app/(\d+)/', url)
    if not match:
        print("[Steam] Could not extract app ID from URL")
        return []

    app_id = match.group(1)
    api_url = (
        f"https://store.steampowered.com/appreviews/{app_id}"
        f"?json=1&num_per_page=20&language=english&review_type=all&purchase_type=all"
    )

    response = requests.get(api_url, timeout=10)
    data = response.json()
    texts = [r['review'] for r in data.get('reviews', []) if r.get('review')]
    print(f"[Steam] Scraped {len(texts)} reviews for app {app_id}")
    return texts


# ── Apple App Store ───────────────────────────────────────────────────────────

def scrape_app_store(url):
    """Scrape App Store reviews using the public iTunes RSS feed."""
    match = re.search(r'/id(\d+)', url)
    if not match:
        print("[App Store] Could not extract app ID from URL")
        return []

    app_id = match.group(1)
    country_match = re.search(r'apps\.apple\.com/([a-z]{2})/', url)
    country = country_match.group(1) if country_match else 'us'

    rss_url = (
        f"https://itunes.apple.com/{country}/rss/customerreviews"
        f"/page=1/id={app_id}/sortby=mostrecent/json"
    )

    response = requests.get(rss_url, timeout=10)
    data = response.json()

    reviews = []
    for entry in data.get('feed', {}).get('entry', []):
        if isinstance(entry, dict):
            label = entry.get('content', {}).get('label', '')
            if label:
                reviews.append(label)

    print(f"[App Store] Scraped {len(reviews)} reviews for app {app_id}")
    print(reviews)
    return reviews


# ── Flipkart ──────────────────────────────────────────────────────────────────

def scrape_flipkart(url):
    """Scrape Flipkart product reviews."""
    response = requests.get(url, headers=HEADERS, timeout=10)
    soup = BeautifulSoup(response.text, "html.parser")

    reviews = []
    for el in soup.select("div.ZmyHeo div, div.t-ZTKy div"):
        text = el.get_text(strip=True)
        if text and len(text) > 20:
            reviews.append(text)

    print(f"[Flipkart] Scraped {len(reviews)} reviews")
    print(reviews)
    return reviews