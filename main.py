from pipelines.research_pipeline import run_research_pipeline

if __name__ == "__main__":
    topic = input("What do you want to research about? ")
    run_research_pipeline(topic)
