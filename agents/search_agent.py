"""Search Agent module for web research."""

from typing import Any
from langchain.agents import create_agent
from models.llm import get_llm
from tools.tavily_tool import web_search


def build_search_agent() -> Any:
    """Builds and returns the Search Agent equipped with Tavily web search.

    Returns:
        Agent graph object configured with LLM and web_search tool.
    """
    return create_agent(
        model=get_llm(),
        tools=[web_search]
    )
