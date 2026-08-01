"""Thin FastAPI wrapper exposing the Astera research pipeline as a JSON API and SSE Stream.

Run with:
    uvicorn api:app --reload --port 8000
"""

import json
import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from pipelines.research_pipeline import run_research_pipeline, stream_research_pipeline

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(title="Astera API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
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
    """Run the multi-agent research pipeline synchronously."""
    topic = request.topic.strip()
    if not topic:
        raise HTTPException(status_code=422, detail="Topic must not be empty.")

    logger.info(f"API: Starting synchronous research pipeline for topic='{topic}'")
    try:
        result = run_research_pipeline(topic)
        return ResearchResponse(**result)
    except Exception as exc:
        logger.error(f"Pipeline error: {exc}")
        raise HTTPException(status_code=500, detail=f"Research pipeline failed: {str(exc)}")


@app.get("/research/stream")
def research_stream(topic: str):
    """Stream real-time research pipeline progress events via Server-Sent Events (SSE)."""
    topic_clean = topic.strip()
    if not topic_clean:
        raise HTTPException(status_code=422, detail="Topic must not be empty.")

    logger.info(f"API: Starting SSE research stream for topic='{topic_clean}'")

    def event_generator():
        try:
            for item in stream_research_pipeline(topic_clean):
                event_name = item["event"]
                payload = json.dumps(item["data"])
                yield f"event: {event_name}\ndata: {payload}\n\n"
        except Exception as exc:
            logger.error(f"SSE stream error: {exc}")
            err_data = json.dumps({"detail": str(exc)})
            yield f"event: error\ndata: {err_data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
