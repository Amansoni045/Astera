import os
from langchain.tools import tool
from tavily import TavilyClient
from dotenv import load_dotenv
from config import TAVILY_MAX_RESULTS, SEARCH_SNIPPET_MAX_LEN

load_dotenv()

API_KEY = os.getenv("TAVILY_API_KEY")

tavily = TavilyClient(api_key=API_KEY)

@tool
def web_search(query: str) -> str: 
    """Search the web for recent and reliable information on a topic. Returns Titles, URLs and Snippets."""

    results = tavily.search(query=query, max_results=TAVILY_MAX_RESULTS) 

    out = []

    for r in results["results"]:
        out.append(f"Title: {r['title']}\nURL: {r['url']}\nSnippet: {r['content'][:SEARCH_SNIPPET_MAX_LEN]}")

    return "\n----\n".join(out)
