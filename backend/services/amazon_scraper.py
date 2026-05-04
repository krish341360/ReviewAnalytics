import re
import requests
from bs4 import BeautifulSoup

# Realistic browser headers
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept-Language":  "en-IN,en;q=0.9",
    "Accept":           "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Encoding":  "gzip, deflate, br",
    "Connection":       "keep-alive",
    "Referer":          "https://www.amazon.in/",
    "DNT":              "1",
    "Upgrade-Insecure-Requests": "1",
}


# ── Public API ────────────────────────────────────────────────────────────────

def get_listing_data(url: str) -> dict:
    """
    Get Amazon product listing data.
    """
    asin = extract_asin(url)
    if not asin:
        print(f"[Amazon] Could not extract ASIN from: {url}")
        return _empty_listing(url)

    print(f"[Amazon] Fetching listing for ASIN: {asin}")

    # Scrape the product page directly
    listing = _scrape_product_page(asin)

    return listing


def get_reviews(asin: str, max_pages: int = 1) -> list:
    """
    Scrape Amazon reviews from the main product page (/dp/ASIN) instead of 
    the dedicated reviews page to bypass the strict Sign-In CAPTCHA block.
    """
    reviews = []
    url = f"https://www.amazon.in/dp/{asin}"
    
    try:
        resp = requests.get(url, headers=HEADERS, timeout=15)
        soup = BeautifulSoup(resp.text, "html.parser")
        
        # Amazon includes the top ~8 reviews on the main product page
        for span in soup.select("span[data-hook='review-body']"):
            text = span.get_text(strip=True)
            # Filter out "The media could not be loaded." video player text
            text = text.replace("The media could not be loaded.", "").strip()
            if text and len(text) > 20:
                reviews.append(text)
                
        print(f"[Amazon] Extracted {len(reviews)} reviews directly from product page {asin}")
        
    except Exception as e:
        print(f"[Amazon] Error extracting reviews for {asin}: {e}")

    return reviews


# ── Product page scraper ──────────────────────────────────────────────────────

def _scrape_product_page(asin: str) -> dict:
    """Scrape amazon.in/dp/{asin} to get accurate listing data."""
    url = f"https://www.amazon.in/dp/{asin}"
    try:
        resp = requests.get(url, headers=HEADERS, timeout=14)
        soup = BeautifulSoup(resp.text, "html.parser")
    except Exception as e:
        print(f"[Amazon] Product page scrape failed for {asin}: {e}")
        return _empty_listing(url, asin)

    # Title
    title_el = soup.find(id="productTitle")
    title = title_el.get_text(strip=True) if title_el else "Unknown"

    # Price — try multiple selectors Amazon uses
    price = 0
    for sel in ["#priceblock_ourprice", "#priceblock_dealprice",
                ".a-price .a-price-whole", "#price_inside_buybox"]:
        el = soup.select_one(sel)
        if el:
            raw = el.get_text(strip=True).replace(",", "").replace("₹", "").strip()
            try:
                price = float(re.sub(r"[^\d.]", "", raw))
                break
            except Exception:
                pass

    # Rating
    rating = 0
    rating_el = soup.find(id="acrPopover") or soup.select_one("span[data-hook='rating-out-of-text']")
    if rating_el:
        txt = rating_el.get("title", rating_el.get_text(strip=True))
        m = re.search(r"([\d.]+)", txt)
        rating = float(m.group(1)) if m else 0

    # Review count
    review_count = 0
    rc_el = soup.find(id="acrCustomerReviewText")
    if rc_el:
        rc_txt = re.sub(r"[^\d]", "", rc_el.get_text(strip=True))
        review_count = int(rc_txt) if rc_txt else 0

    # Thumbnail
    thumbnail = ""
    for img_id in ["landingImage", "main-image", "imgBlkFront"]:
        img_el = soup.find(id=img_id)
        if img_el:
            thumbnail = img_el.get("src") or img_el.get("data-old-hires") or ""
            break

    # "Bought in past month"
    blm_raw = ""
    for tag in soup.find_all(["span", "div"]):
        txt = tag.get_text(strip=True)
        if "bought in past month" in txt.lower() and len(txt) < 60:
            blm_raw = txt
            break

    print(f"[Amazon] Scraped: {title[:60]} | ₹{price} | ★{rating} | {review_count} reviews")

    return {
        "asin":              asin,
        "title":             title,
        "price":             price,
        "old_price":         0,
        "rating":            rating,
        "review_count":      review_count,
        "bought_last_month": _parse_bought_last_month(blm_raw),
        "bought_last_month_raw": blm_raw,
        "thumbnail":         thumbnail,
        "url":               url,
    }





# ── Helpers ───────────────────────────────────────────────────────────────────

def _parse_review_page(soup: BeautifulSoup) -> list:
    reviews = []
    for div in soup.select("div[data-hook='review']"):
        body = div.select_one("span[data-hook='review-body'] span")
        if body:
            text = body.get_text(strip=True)
            if text and len(text) > 20:
                reviews.append(text)
    return reviews


def _parse_bought_last_month(raw: str) -> int:
    if not raw:
        return 0
    raw = raw.lower()
    m = re.search(r'([\d,]+)k\+?', raw)
    if m:
        return int(m.group(1).replace(",", "")) * 1000
    m = re.search(r'([\d,]+)\+?', raw)
    return int(m.group(1).replace(",", "")) if m else 0





def extract_asin(url: str) -> str | None:
    """Extract 10-char ASIN from any Amazon URL format."""
    m = re.search(r'/(?:dp|product|gp/product)/([A-Z0-9]{10})', url)
    if m:
        return m.group(1)
    # Also handles pd_rd_i= parameter
    m = re.search(r'pd_rd_i=([A-Z0-9]{10})', url)
    if m:
        return m.group(1)
    return None


def _empty_listing(url: str, asin: str = "") -> dict:
    return {
        "asin":              asin,
        "title":             "Unknown",
        "price":             0,
        "old_price":         0,
        "rating":            0,
        "review_count":      0,
        "bought_last_month": 0,
        "bought_last_month_raw": "",
        "thumbnail":         "",
        "url":               url,
    }
