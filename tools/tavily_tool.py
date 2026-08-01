"""Tavily web search tool implementation for Astera."""

import logging
import os
from langchain.tools import tool
from tavily import TavilyClient
from dotenv import load_dotenv
from config import TAVILY_MAX_RESULTS, SEARCH_SNIPPET_MAX_LEN

load_dotenv()

logger = logging.getLogger(__name__)

API_KEY = os.getenv("TAVILY_API_KEY")
tavily_client = TavilyClient(api_key=API_KEY) if API_KEY else None


@tool
def web_search(query: str) -> str: 
    """Search the web for recent and reliable information on a topic. Returns Titles, URLs and Snippets.

    Args:
        query: Search query string.

    Returns:
        Formatted string containing search result titles, URLs, and text snippets.
    """
    if not tavily_client:
        logger.error("TAVILY_API_KEY environment variable is not set.")
        return "Search failed: TAVILY_API_KEY is missing."

    try:
        results = tavily_client.search(query=query, max_results=TAVILY_MAX_RESULTS) 
        
        raw_results = results.get("results", [])
        if not raw_results:
            logger.warning(f"No search results returned for query: {query}")
            return "No relevant search results found."

        out = []
        for r in raw_results:
            title = r.get("title", "No Title")
            url = r.get("url", "")
            content = r.get("content", "")[:SEARCH_SNIPPET_MAX_LEN]
            out.append(f"Title: {title}\nURL: {url}\nSnippet: {content}")

        return "\n----\n".join(out)
    except Exception as e:
        logger.error(f"Tavily search failed for query '{query}': {e}")
        return f"Failed to execute web search: {str(e)}"
