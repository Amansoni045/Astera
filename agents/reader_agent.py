"""Reader Agent module for web page scraping."""

from typing import Any
from langchain.agents import create_agent
from models.llm import get_llm
from tools.scraper_tool import scrape_url


def build_reader_agent() -> Any:
    """Builds and returns the Reader Agent equipped with BeautifulSoup URL scraper.

    Returns:
        Agent graph object configured with LLM and scrape_url tool.
    """
    return create_agent(
        model=get_llm(),
        tools=[scrape_url]
    )
