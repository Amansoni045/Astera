"""Thin FastAPI wrapper exposing the Astera research pipeline as a JSON API.

This module does not modify any pipeline behavior, agents, chains, prompts, or tools.
It only wraps the existing run_research_pipeline function for HTTP consumption.

Run with:
    uvicorn api:app --reload --port 8000
"""

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pipelines.research_pipeline import run_research_pipeline

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Astera API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["POST"],
    allow_headers=["*"],
)


class ResearchRequest(BaseModel):
    topic: str


class ResearchResponse(BaseModel):
    topic: str
    search_results: str
    scraped_content: str
    report: str
    feedback: str


@app.post("/research", response_model=ResearchResponse)
def research(request: ResearchRequest) -> ResearchResponse:
    """Run the multi-agent research pipeline for the given topic.

    Args:
        request: JSON body with a `topic` string field.

    Returns:
        ResearchResponse with all pipeline stage outputs.
    """
    topic = request.topic.strip()
    if not topic:
        raise HTTPException(status_code=422, detail="Topic must not be empty.")

    logger.info(f"API: Starting research pipeline for topic='{topic}'")
    try:
        result = run_research_pipeline(topic)
        return ResearchResponse(**result)
    except Exception as exc:
        logger.error(f"Pipeline error: {exc}")
        raise HTTPException(status_code=500, detail=f"Research pipeline failed: {str(exc)}")
