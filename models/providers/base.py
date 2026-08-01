"""Base provider interface for Astera multi-provider LLM architecture."""

import logging
import os
from abc import ABC, abstractmethod
from typing import List, Optional
from langchain_core.language_models.chat_models import BaseChatModel

logger = logging.getLogger(__name__)


class BaseProvider(ABC):
    """Abstract Base Class for all LLM providers."""

    def __init__(
        self,
        name: str,
        env_key_names: List[str],
        model_name: str,
        temperature: float = 0.0,
        timeout: int = 30,
    ):
        self.name = name
        self.env_key_names = env_key_names
        self.model_name = model_name
        self.temperature = temperature
        self.timeout = timeout
        self._llm_instance: Optional[BaseChatModel] = None

    def is_available(self) -> bool:
        """Check if any of the required API keys for this provider exist in environment."""
        return any(bool(os.getenv(k)) for k in self.env_key_names)

    def get_api_key(self) -> Optional[str]:
        """Returns the first non-empty API key matching self.env_key_names."""
        for key in self.env_key_names:
            val = os.getenv(key)
            if val:
                return val
        return None

    @abstractmethod
    def create_llm(self) -> BaseChatModel:
        """Instantiate the Chat model for this provider."""
        pass

    def get_llm(self) -> BaseChatModel:
        """Return the singleton instance for this provider."""
        if self._llm_instance is None:
            logger.info(f"Initializing {self.name} provider (model={self.model_name})")
            self._llm_instance = self.create_llm()
        return self._llm_instance
