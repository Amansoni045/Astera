"""Research Pipeline execution module for Astera."""

import logging
from typing import Dict, Any, Generator
from agents.search_agent import build_search_agent
from agents.reader_agent import build_reader_agent
from chains.writer_chain import writer_chain
from chains.critic_chain import critic_chain
from state import ResearchState

logger = logging.getLogger(__name__)


def stream_research_pipeline(topic: str) -> Generator[Dict[str, Any], None, None]:
    """Yields real progress events and results as each stage executes.

    Yielded Event Structure:
        {"event": "<event_name>", "data": <event_payload>}

    Events emitted:
        - search_started, search_completed
        - reader_started, reader_completed
        - writer_started, writer_completed
        - critic_started, critic_completed
        - finished (contains final ResearchState dict)
    """
    state: ResearchState = {
        "topic": topic,
        "search_results": "",
        "scraped_content": "",
        "report": "",
        "feedback": ""
    }

    # Step 1 - Search Agent
    logger.info(f"[Pipeline] Step 1: Running Search Agent for topic '{topic}'")
    yield {"event": "search_started", "data": {"stage": "searching"}}

    search_agent = build_search_agent()
    search_result = search_agent.invoke({
        "messages": [("user", f"Find recent, reliable and detailed information about: {topic}")]
    })

    search_text = search_result["messages"][-1].content
    state["search_results"] = search_text
    logger.info(f"[Pipeline] Search Agent completed. Total search context length: {len(search_text)} chars")
    yield {"event": "search_completed", "data": {"stage": "searching"}}

    # Step 2 - Reader Agent
    logger.info("[Pipeline] Step 2: Running Reader Agent to scrape webpage content")
    yield {"event": "reader_started", "data": {"stage": "reading"}}

    reader_agent = build_reader_agent()
    # Pass full search results to Reader Agent without artificial [:800] truncation
    reader_result = reader_agent.invoke({
        "messages": [("user",
            f"Based on the following search results about '{topic}', "
            f"pick the most relevant URL and scrape it for deeper content.\n\n"
            f"Search Results:\n{search_text}"
        )]
    })

    scraped_text = reader_result["messages"][-1].content
    state["scraped_content"] = scraped_text
    logger.info(f"[Pipeline] Reader Agent completed. Scraped content length: {len(scraped_text)} chars")
    yield {"event": "reader_completed", "data": {"stage": "reading"}}

    # Step 3 - Writer Chain
    logger.info("[Pipeline] Step 3: Running Writer Chain to draft report")
    yield {"event": "writer_started", "data": {"stage": "writing"}}

    research_combined = (
        f"SEARCH RESULTS:\n{state['search_results']}\n\n"
        f"DETAILED SCRAPED CONTENT:\n{state['scraped_content']}"
    )

    logger.info(f"[Pipeline] Final context length sent to Writer: {len(research_combined)} chars")

    writer_result = writer_chain.invoke({
        "topic": topic,
        "research": research_combined
    })

    state["report"] = writer_result
    logger.info(f"[Pipeline] Writer Chain completed. Drafted report length: {len(writer_result)} chars")
    yield {"event": "writer_completed", "data": {"stage": "writing"}}

    # Step 4 - Critic Chain
    logger.info("[Pipeline] Step 4: Running Critic Chain to review report")
    yield {"event": "critic_started", "data": {"stage": "checking"}}

    critic_result = critic_chain.invoke({
        "report": writer_result
    })

    state["feedback"] = critic_result
    logger.info("[Pipeline] Critic Chain completed evaluation.")
    yield {"event": "critic_completed", "data": {"stage": "checking"}}

    logger.info("[Pipeline] Pipeline execution completed successfully.")
    yield {"event": "finished", "data": state}


def run_research_pipeline(topic: str) -> ResearchState:
    """Executes the multi-agent research pipeline synchronously and returns final state."""
    final_state = None
    for event in stream_research_pipeline(topic):
        if event["event"] == "finished":
            final_state = event["data"]
    if final_state is None:
        raise RuntimeError("Pipeline failed to produce a final result state.")
    return final_state


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
    topic_input = input("What do you want to research about? ")
    run_research_pipeline(topic_input)
