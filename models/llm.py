"""Multi-provider LLM interface module for Astera."""

import logging
from typing import Optional
from dotenv import load_dotenv
from models.provider_manager import MultiProviderChatModel, ProviderManager

load_dotenv()

logger = logging.getLogger(__name__)

_singleton_model: Optional[MultiProviderChatModel] = None


def get_llm() -> MultiProviderChatModel:
    """Retrieves or initializes the shared MultiProviderChatModel instance.

    Returns:
        MultiProviderChatModel: Chat model supporting priority failover across free-tier providers.
    """
    global _singleton_model
    if _singleton_model is None:
        logger.info("Initializing Astera Multi-Provider LLM architecture.")
        manager = ProviderManager()
        _singleton_model = MultiProviderChatModel(manager=manager)
    return _singleton_model
