"""Research Pipeline execution module for Astera."""

import logging
from agents.search_agent import build_search_agent
from agents.reader_agent import build_reader_agent
from chains.writer_chain import writer_chain
from chains.critic_chain import critic_chain
from state import ResearchState

logger = logging.getLogger(__name__)


def run_research_pipeline(topic: str) -> ResearchState:
    """Executes the multi-agent research pipeline end-to-end.

    Pipeline stages:
        1. Search: Web search agent gathers initial topic information.
        2. Scrape: Reader agent scrapes relevant web page content.
        3. Write: Writer chain generates structured report from research.
        4. Critic: Critic chain reviews and evaluates the draft report.

    Args:
        topic: The user-specified research topic string.

    Returns:
        ResearchState: Dict containing topic, search_results, scraped_content, report, feedback.
    """
    state: ResearchState = {
        "topic": topic,
        "search_results": "",
        "scraped_content": "",
        "report": "",
        "feedback": ""
    }

    # Step 1 - Search Agent
    print("\n" + " =" * 50)
    print("step 1 - search agent is working...")
    print("=" * 50)
    logger.info(f"Step 1: Running Search Agent for topic '{topic}'")

    search_agent = build_search_agent()
    search_result = search_agent.invoke({
        "messages": [("user", f"Find recent, reliable and detailed information about: {topic}")]
    })

    state["search_results"] = search_result["messages"][-1].content
    print("\n search result ", state["search_results"])

    # Step 2 - Reader Agent
    print("\n" + " =" * 50)
    print("step 2 - reader agent is scraping resources...")
    print(" =" * 50)
    logger.info("Step 2: Running Reader Agent to scrape webpage content")

    reader_agent = build_reader_agent()
    reader_result = reader_agent.invoke({
        "messages": [("user",
            f"Based on the following search results about '{topic}', "
            f"pick the most relevant URL and scrape it for deeper content.\n\n"
            f"Search Results:\n{state['search_results'][:800]}"
        )]
    })

    state["scraped_content"] = reader_result["messages"][-1].content
    print("\nscraped content: \n", state["scraped_content"])

    # Step 3 - Writer Chain
    print("\n" + " =" * 50)
    print("step 3 - writer is drafting a report...")
    print(" =" * 50)
    logger.info("Step 3: Running Writer Chain to draft report")

    research_combined = (
        f"SEARCH RESULTS: \n {state['search_results']} \n\n"
        f"DETAILED SCRAPED CONTENT: \n {state['scraped_content']}"
    )

    writer_result = writer_chain.invoke({
        "topic": topic,
        "research": research_combined
    })

    state["report"] = writer_result
    print("\n Writer Report\n", state["report"])

    # Step 4 - Critic Chain
    print("\n" + "=" * 50)
    print("step 4 - critic is reviewing the report...")
    print("=" * 50)
    logger.info("Step 4: Running Critic Chain to review report")

    critic_result = critic_chain.invoke({
        "report": writer_result
    })

    state["feedback"] = critic_result
    print("\n Critic Feedback: ", state["feedback"])

    logger.info("Pipeline execution completed successfully.")
    return state


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
    topic_input = input("What do you want to research about? ")
    run_research_pipeline(topic_input)
