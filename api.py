"""Production-ready FastAPI application for Astera backend.

Exposes JSON API, SSE progress stream, health check, and dynamic production CORS.
"""

import json
import logging
import re
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel
from config import ALLOWED_ORIGINS
from pipelines.research_pipeline import run_research_pipeline, stream_research_pipeline

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Astera API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url=None,
)

# Allow explicit origins from config plus any Vercel deployment (*.vercel.app)
VERCEL_REGEX = re.compile(r"^https://.*\.vercel\.app$")


def get_cors_origin(request: Request) -> str:
    """Dynamically validate request origin against allowed list and Vercel pattern."""
    origin = request.headers.get("origin", "")
    if not origin:
        return ALLOWED_ORIGINS[0]
    if origin in ALLOWED_ORIGINS or VERCEL_REGEX.match(origin):
        return origin
    return ALLOWED_ORIGINS[0]


app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler ensuring unhandled errors return CORS headers and clean JSON."""
    logger.error(f"Unhandled backend exception: {exc}")
    origin = get_cors_origin(request)
    status_code = exc.status_code if isinstance(exc, HTTPException) else 500
    detail = exc.detail if isinstance(exc, HTTPException) else "An unexpected server error occurred."

    return JSONResponse(
        status_code=status_code,
        content={"detail": detail},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Credentials": "true",
        },
    )


@app.get("/health")
def health_check():
    """Health check endpoint for Railway & infrastructure deployment."""
    return {"status": "ok", "service": "Astera Backend", "version": "1.0.0"}


class ResearchRequest(BaseModel):
    topic: str


class ResearchResponse(BaseModel):
    topic: str
    search_results: str
    scraped_content: str
    report: str
    feedback: str


@app.options("/research")
@app.options("/research/stream")
def cors_preflight(request: Request):
    """Preflight OPTIONS handler returning dynamic CORS headers."""
    origin = get_cors_origin(request)
    return JSONResponse(
        content={},
        headers={
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
        },
    )


@app.post("/research", response_model=ResearchResponse)
def research(request: ResearchRequest, req: Request) -> ResearchResponse:
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
def research_stream(topic: str, request: Request):
    """Stream real-time research pipeline progress events via Server-Sent Events (SSE)."""
    topic_clean = topic.strip()
    if not topic_clean:
        raise HTTPException(status_code=422, detail="Topic must not be empty.")

    logger.info(f"API: Starting SSE research stream for topic='{topic_clean}'")
    origin = get_cors_origin(request)

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
            "Access-Control-Allow-Origin": origin,
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


if __name__ == "__main__":
    import os
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    logger.info(f"Starting server on 0.0.0.0:{port}")
    uvicorn.run(app, host="0.0.0.0", port=port)
