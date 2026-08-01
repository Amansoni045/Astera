from langchain.tools import tool
import requests
from bs4 import BeautifulSoup
from config import SCRAPER_TIMEOUT, SCRAPER_USER_AGENT, SCRAPER_CONTENT_MAX_LEN

@tool 
def scrape_url(url: str) -> str:
    """Scrapes a given URL and returns clean text content of the page for deeper reading.""" 
    
    try:
        resp = requests.get(
            url,
            timeout=SCRAPER_TIMEOUT,
            headers={"User-Agent": SCRAPER_USER_AGENT}
        )
        soup = BeautifulSoup(
            resp.text,
            "html.parser"
        )
        for tag in soup(["script", "style", "nav", "footer"]):
            tag.decompose()

        return soup.get_text(separator=" ", strip=True)[:SCRAPER_CONTENT_MAX_LEN]
        
    except Exception as e:
        return f"Failed to scrape URL: {str(e)}"
