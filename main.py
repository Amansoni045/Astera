"""Main entrypoint for Astera backend pipeline execution."""

import logging
from pipelines.research_pipeline import run_research_pipeline

def main() -> None:
    """Configures logging and prompts the user for a research topic."""
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
    )
    topic = input("What do you want to research about? ")
    if topic.strip():
        run_research_pipeline(topic.strip())
    else:
        print("No research topic provided.")


if __name__ == "__main__":
    main()
