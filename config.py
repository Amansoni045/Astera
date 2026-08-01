"""Configuration module for Astera backend.

Contains all global constant values including model settings, Tavily search parameters,
and scraper configurations.
"""

# LLM Configuration
MODEL_NAME = "llama-3.1-8b-instant"
MODEL_TEMPERATURE = 0

# Tavily Search Configuration
TAVILY_MAX_RESULTS = 5
SEARCH_SNIPPET_MAX_LEN = 300

# Web Scraper Configuration
SCRAPER_TIMEOUT = 8
SCRAPER_USER_AGENT = "Mozilla/5.0"
SCRAPER_CONTENT_MAX_LEN = 3000
