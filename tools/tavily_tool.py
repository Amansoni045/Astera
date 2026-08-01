"""Tavily web search tool implementation for Astera."""

import logging
import os
from typing import List, Dict, Any
from langchain.tools import tool
from tavily import TavilyClient
from dotenv import load_dotenv
from config import TAVILY_MAX_RESULTS, SEARCH_SNIPPET_MAX_LEN

load_dotenv()

logger = logging.getLogger(__name__)

API_KEY = os.getenv("TAVILY_API_KEY")
tavily_client = TavilyClient(api_key=API_KEY) if API_KEY else None


def execute_raw_search(query: str, max_results: int = TAVILY_MAX_RESULTS) -> List[Dict[str, str]]:
    """Execute raw Tavily search returning a list of dicts with title, url, and snippet."""
    if not tavily_client:
        logger.error("[Tavily] TAVILY_API_KEY environment variable is not set.")
        return []

    logger.info(f"[Tavily] Executing raw search query: '{query}'")

    try:
        results = tavily_client.search(
            query=query,
            max_results=max_results,
            search_depth="advanced",
        )
        raw_results = results.get("results", [])
        logger.info(f"[Tavily] Raw results returned: {len(raw_results)} for query '{query}'")

        items = []
        for r in raw_results:
            title = r.get("title", "No Title").strip()
            url = r.get("url", "").strip()
            content = r.get("content", "").strip()[:SEARCH_SNIPPET_MAX_LEN]
            if url:
                items.append({
                    "title": title,
                    "url": url,
                    "snippet": content,
                })
        return items
    except Exception as e:
        logger.error(f"[Tavily] Search failed for query '{query}': {e}")
        return []


@tool
def web_search(query: str) -> str: 
    """Search the web for recent and reliable information on a topic. Returns Titles, URLs and Snippets.

    Args:
        query: Search query string.

    Returns:
        Formatted string containing search result titles, URLs, and text snippets.
    """
    raw = execute_raw_search(query)
    if not raw:
        return "No relevant search results found."

    out = []
    for r in raw:
        out.append(f"Title: {r['title']}\nURL: {r['url']}\nSnippet: {r['snippet']}")

    return "\n----\n".join(out)
