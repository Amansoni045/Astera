"""LLM Provider module for Astera using Groq."""

import logging
from typing import Optional
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from config import MODEL_NAME, MODEL_TEMPERATURE

load_dotenv()

logger = logging.getLogger(__name__)

_llm_instance: Optional[ChatGroq] = None


def get_llm() -> ChatGroq:
    """Retrieves or initializes the shared ChatGroq LLM singleton instance.

    Returns:
        ChatGroq: Configured LLM client instance.
    """
    global _llm_instance
    if _llm_instance is None:
        logger.info(f"Initializing ChatGroq LLM (model={MODEL_NAME}, temp={MODEL_TEMPERATURE})")
        _llm_instance = ChatGroq(model=MODEL_NAME, temperature=MODEL_TEMPERATURE)
    return _llm_instance
