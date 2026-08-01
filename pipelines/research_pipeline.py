"""Deep Research Pipeline execution module for Astera.

Implements multi-query planning, source authority ranking, multi-page web scraping,
structured evidence reconciliation, and real-time SSE progress streaming.
"""

import logging
import re
from typing import Dict, Any, Generator, List
from urllib.parse import urlparse
from langchain_core.messages import SystemMessage, HumanMessage
from models.llm import get_llm
from tools.tavily_tool import execute_raw_search
from tools.scraper_tool import scrape_url
from chains.writer_chain import writer_chain
from chains.critic_chain import critic_chain
from state import ResearchState

logger = logging.getLogger(__name__)

# High authority domain signatures
HIGH_AUTHORITY_DOMAINS = [
    "gov", "edu", "org",
    "apple.com", "bloomberg.com", "reuters.com", "wsj.com", "nytimes.com",
    "macrumors.com", "theverge.com", "techcrunch.com", "espn.com", "bbc.com",
    "finance.yahoo.com", "bseindia.com", "nseindia.com", "nature.com",
    "arxiv.org", "wikipedia.org", "cnbc.com", "ft.com", "forbes.com"
]

LOW_QUALITY_KEYWORDS = ["clickbait", "content-farm", "spam", "buzz", "viral"]


def generate_search_queries(topic: str) -> List[str]:
    """Generate 3 to 4 focused, diverse search queries for comprehensive coverage."""
    prompt = (
        f"Generate 3 distinct, highly focused search queries to research the following topic thoroughly.\n"
        f"Topic: {topic}\n\n"
        f"Return ONLY the 3 search queries, one per line. Do not add numbers, quotes, or markdown."
    )

    try:
        llm = get_llm()
        resp = llm.invoke([
            SystemMessage(content="You are a research planning assistant. Output exact search query strings."),
            HumanMessage(content=prompt),
        ])

        raw_text = resp.content.strip()
        lines = [re.sub(r"^\d+[\.\)]\s*", "", line).strip(' "\'') for line in raw_text.split("\n")]
        queries = [line for line in lines if line]

        # Always include the original topic as the primary query
        all_queries = [topic] + [q for q in queries if q.lower() != topic.lower()]
        return all_queries[:4]
    except Exception as exc:
        logger.warning(f"[Planning] Query generation fallback due to: {exc}")
        return [topic, f"{topic} latest updates", f"{topic} official facts"]


def score_source_authority(item: Dict[str, str]) -> int:
    """Score source based on domain authority, URL structure, and content quality."""
    url = item.get("url", "").lower()
    parsed = urlparse(url)
    domain = parsed.hostname or ""

    score = 10  # Base score

    # Check high authority domains
    if any(auth_domain in domain for auth_domain in HIGH_AUTHORITY_DOMAINS):
        score += 30

    # TLD bonus
    if domain.endswith((".gov", ".edu", ".org")):
        score += 25

    # Penalize low quality or suspicious URLs
    if any(bad in domain for bad in LOW_QUALITY_KEYWORDS):
        score -= 20

    # Content length bonus
    snippet = item.get("snippet", "")
    if len(snippet) > 500:
        score += 10

    return score


def stream_research_pipeline(topic: str) -> Generator[Dict[str, Any], None, None]:
    """Yields real progress events and results across deep research execution stages."""
    state: ResearchState = {
        "topic": topic,
        "search_results": "",
        "scraped_content": "",
        "report": "",
        "feedback": ""
    }

    # Step 1: Research Planning & Query Generation
    logger.info(f"[Pipeline] Step 1: Planning deep research for topic '{topic}'")
    yield {"event": "search_started", "data": {"stage": "searching", "status": "Planning research strategy"}}

    queries = generate_search_queries(topic)
    logger.info(f"[Pipeline] Generated search queries: {queries}")

    # Step 2: Multi-Query Search & URL Deduplication
    all_results: List[Dict[str, str]] = []
    seen_urls = set()

    for query in queries:
        items = execute_raw_search(query, max_results=5)
        for item in items:
            url = item["url"]
            if url not in seen_urls:
                seen_urls.add(url)
                all_results.append(item)

    logger.info(f"[Pipeline] Multi-query search complete. Total unique sources found: {len(all_results)}")
    yield {
        "event": "search_completed",
        "data": {
            "stage": "searching",
            "found_sources": len(all_results),
            "queries_executed": len(queries),
        },
    }

    # Step 3: Domain Authority Scoring & Source Ranking
    ranked_results = sorted(all_results, key=score_source_authority, reverse=True)
    
    # Adaptive N: select top 4 to 6 sources for scraping
    num_to_scrape = min(max(4, len(ranked_results)), 6)
    selected_sources = ranked_results[:num_to_scrape]
    selected_urls = [s["url"] for s in selected_sources]

    logger.info(f"[Pipeline] Selected top {len(selected_sources)} authority sources for deep scraping: {selected_urls}")

    # Format search results payload
    search_payload_lines = []
    for idx, s in enumerate(all_results, 1):
        search_payload_lines.append(
            f"SOURCE [{idx}]:\nTitle: {s['title']}\nURL: {s['url']}\nSnippet: {s['snippet']}"
        )
    state["search_results"] = "\n----\n".join(search_payload_lines)

    # Step 4: Multi-Page Web Scraping
    logger.info(f"[Pipeline] Step 4: Deep scraping {len(selected_sources)} top-ranked pages")
    yield {"event": "reader_started", "data": {"stage": "reading", "total_pages": len(selected_sources)}}

    scraped_blocks = []
    for idx, source in enumerate(selected_sources, 1):
        url = source["url"]
        logger.info(f"[Pipeline] Deep reading source [{idx}/{len(selected_sources)}]: {url}")
        content = scrape_url.invoke(url)
        if content and not content.startswith("Failed to scrape"):
            scraped_blocks.append(
                f"FULL SCRAPED CONTENT FROM SOURCE [{idx}] ({url}):\n{content}"
            )

    state["scraped_content"] = "\n\n====================\n\n".join(scraped_blocks)
    logger.info(f"[Pipeline] Scraping complete. Total scraped pages: {len(scraped_blocks)}, Total chars: {len(state['scraped_content'])}")
    yield {"event": "reader_completed", "data": {"stage": "reading", "scraped_pages": len(scraped_blocks)}}

    # Step 5: Writer Chain & Evidence Synthesis
    logger.info("[Pipeline] Step 5: Running Writer Chain to draft report")
    yield {"event": "writer_started", "data": {"stage": "writing"}}

    research_combined = (
        f"=== MULTI-QUERY SEARCH RESULTS ({len(all_results)} SOURCES FOUND) ===\n"
        f"{state['search_results']}\n\n"
        f"=== DEEP SCRAPED CONTENT ({len(scraped_blocks)} PAGES SCRAPED) ===\n"
        f"{state['scraped_content']}"
    )

    logger.info(f"[Pipeline] Total research evidence context payload sent to Writer: {len(research_combined)} chars")

    writer_result = writer_chain.invoke({
        "topic": topic,
        "research": research_combined
    })

    state["report"] = writer_result
    logger.info(f"[Pipeline] Writer Chain completed. Final report length: {len(writer_result)} chars")
    yield {"event": "writer_completed", "data": {"stage": "writing"}}

    # Step 6: Critic Chain Review
    logger.info("[Pipeline] Step 6: Running Critic Chain to review report")
    yield {"event": "critic_started", "data": {"stage": "checking"}}

    critic_result = critic_chain.invoke({
        "report": writer_result
    })

    state["feedback"] = critic_result
    logger.info("[Pipeline] Critic Chain completed evaluation.")
    yield {"event": "critic_completed", "data": {"stage": "checking"}}

    logger.info("[Pipeline] Deep research pipeline execution completed successfully.")
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
