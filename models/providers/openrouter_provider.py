"""OpenRouter LLM provider implementation."""

from langchain_openai import ChatOpenAI
from langchain_core.language_models.chat_models import BaseChatModel
from models.providers.base import BaseProvider


class OpenRouterProvider(BaseProvider):
    """OpenRouter Provider implementation using OpenAI-compatible API endpoint."""

    def __init__(self, model_name: str, temperature: float = 0.0, timeout: int = 30):
        super().__init__(
            name="OpenRouter",
            env_key_names=["OPENROUTER_API_KEY"],
            model_name=model_name,
            temperature=temperature,
            timeout=timeout,
        )

    def create_llm(self) -> BaseChatModel:
        api_key = self.get_api_key()
        return ChatOpenAI(
            model=self.model_name,
            base_url="https://openrouter.ai/api/v1",
            api_key=api_key,
            temperature=self.temperature,
            timeout=self.timeout,
        )
