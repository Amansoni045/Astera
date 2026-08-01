"""Configuration module for Astera backend.

Contains all global constant values including provider priority, model settings,
Tavily search parameters, scraper configurations, and production CORS origins.
"""

import os

# Production CORS Allowed Origins
DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8000",
]

# Parse extra custom origins from ALLOWED_ORIGINS env var (comma-separated)
extra_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
ALLOWED_ORIGINS = list(
    set(DEFAULT_ALLOWED_ORIGINS + [o.strip() for o in extra_origins if o.strip()])
)

# Multi-Provider Configuration
PROVIDER_PRIORITY = ["groq", "cerebras", "gemini", "mistral", "openrouter"]

PROVIDER_MODELS = {
    "groq": "llama-3.1-8b-instant",
    "cerebras": "llama3.1-8b",
    "gemini": "gemini-2.0-flash",
    "mistral": "mistral-small-latest",
    "openrouter": "meta-llama/llama-3.3-70b-instruct:free",
}

PROVIDER_TIMEOUTS = {
    "groq": 30,
    "cerebras": 30,
    "gemini": 30,
    "mistral": 30,
    "openrouter": 45,
}

MODEL_TEMPERATURE = 0.0

# Failover & Retry Settings
MAX_RETRIES_PER_PROVIDER = 3
INITIAL_RETRY_DELAY_SEC = 2.0
BACKOFF_FACTOR = 2.0
PROVIDER_COOLDOWN_SEC = 300.0  # 5 minutes cooldown after repeated provider failures

# Tavily Search Configuration
TAVILY_MAX_RESULTS = 5
SEARCH_SNIPPET_MAX_LEN = 300

# Web Scraper Configuration
SCRAPER_TIMEOUT = 8
SCRAPER_USER_AGENT = "Mozilla/5.0"
SCRAPER_CONTENT_MAX_LEN = 3000
