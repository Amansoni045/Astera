"""Cerebras LLM provider implementation."""

from langchain_openai import ChatOpenAI
from langchain_core.language_models.chat_models import BaseChatModel
from models.providers.base import BaseProvider


class CerebrasProvider(BaseProvider):
    """Cerebras Provider implementation using OpenAI-compatible API endpoint."""

    def __init__(self, model_name: str, temperature: float = 0.0, timeout: int = 30):
        super().__init__(
            name="Cerebras",
            env_key_names=["CEREBRAS_API_KEY"],
            model_name=model_name,
            temperature=temperature,
            timeout=timeout,
        )

    def create_llm(self) -> BaseChatModel:
        api_key = self.get_api_key()
        return ChatOpenAI(
            model=self.model_name,
            base_url="https://api.cerebras.ai/v1",
            api_key=api_key,
            temperature=self.temperature,
            timeout=self.timeout,
        )
