from agents.search_agent import build_search_agent
from agents.reader_agent import build_reader_agent
from chains.writer_chain import writer_chain
from chains.critic_chain import critic_chain
from state import ResearchState

def run_research_pipeline(topic: str) -> ResearchState:

    state: ResearchState = {
        "topic": topic,
        "search_results": "",
        "scraped_content": "",
        "report": "",
        "feedback": ""
    }

    #search agent working 
    print("\n" + " =" * 50)
    print("step 1 - search agent is working...")
    print("=" * 50) 

    search_agent = build_search_agent()
    search_result = search_agent.invoke({
        "messages": [("user", f"Find recent, reliable and detailed information about: {topic}")]
    })

    state["search_results"] = search_result["messages"][-1].content

    print("\n search result ", state["search_results"])

    #reader agent working 
    print("\n" + " =" * 50)
    print("step 2 - reader agent is scraping resources...")
    print(" =" * 50) 

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

    #writer chain 
    print("\n" + " =" * 50)
    print("step 3 - writer is drafting a report...")
    print(" =" * 50) 

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

    #critic chain 
    print("\n" + "=" * 50)
    print("step 4 - critic is reviewing the report...")
    print("=" * 50) 

    critic_result = critic_chain.invoke({
        "report": writer_result
    })

    state["feedback"] = critic_result

    print("\n Critic Feedback: ", state["feedback"])
    
    return state


if __name__ == "__main__":
    topic = input("What do you want to research about? ")
    run_research_pipeline(topic)
