from langchain.agents import create_agent
from models.llm import get_llm
from tools.tavily_tool import web_search

def build_search_agent():
    return create_agent(
        model=get_llm(),
        tools=[web_search]
    )
