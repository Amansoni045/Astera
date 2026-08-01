from langchain.agents import create_agent
from models.llm import get_llm
from tools.scraper_tool import scrape_url

def build_reader_agent():
    return create_agent(
        model=get_llm(),
        tools=[scrape_url]
    )
