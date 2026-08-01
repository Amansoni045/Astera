"""Web scraper tool implementation for Astera."""

import logging
import requests
from bs4 import BeautifulSoup
from langchain.tools import tool
from config import SCRAPER_TIMEOUT, SCRAPER_USER_AGENT, SCRAPER_CONTENT_MAX_LEN

logger = logging.getLogger(__name__)


@tool 
def scrape_url(url: str) -> str:
    """Scrapes a given URL and returns clean text content of the page for deeper reading.

    Args:
        url: The web page URL to scrape.

    Returns:
        Cleaned text content of the webpage truncated to configured maximum length.
    """
    if not url or not url.startswith(("http://", "https://")):
        logger.warning(f"Invalid URL provided to scraper: {url}")
        return f"Failed to scrape URL: Invalid or missing URL schema in '{url}'."

    try:
        resp = requests.get(
            url,
            timeout=SCRAPER_TIMEOUT,
            headers={"User-Agent": SCRAPER_USER_AGENT}
        )
        resp.raise_for_status()

        soup = BeautifulSoup(
            resp.text,
            "html.parser"
        )
        for tag in soup(["script", "style", "nav", "footer", "header", "noscript"]):
            tag.decompose()

        cleaned_text = soup.get_text(separator=" ", strip=True)
        if not cleaned_text:
            return "Webpage reached successfully, but no extractable text content was found."

        return cleaned_text[:SCRAPER_CONTENT_MAX_LEN]

    except requests.Timeout:
        logger.error(f"Scraper timed out while accessing {url}")
        return f"Failed to scrape URL: Request timed out after {SCRAPER_TIMEOUT} seconds."
    except requests.RequestException as req_err:
        logger.error(f"HTTP request error scraping {url}: {req_err}")
        return f"Failed to scrape URL due to network error: {str(req_err)}"
    except Exception as e:
        logger.error(f"Unexpected error scraping {url}: {e}")
        return f"Failed to scrape URL: {str(e)}"
