"""Groq LLM provider implementation."""

from langchain_groq import ChatGroq
from langchain_core.language_models.chat_models import BaseChatModel
from models.providers.base import BaseProvider


class GroqProvider(BaseProvider):
    """Groq Provider implementation."""

    def __init__(self, model_name: str, temperature: float = 0.0, timeout: int = 30):
        super().__init__(
            name="Groq",
            env_key_names=["GROQ_API_KEY"],
            model_name=model_name,
            temperature=temperature,
            timeout=timeout,
        )

    def create_llm(self) -> BaseChatModel:
        api_key = self.get_api_key()
        return ChatGroq(
            model=self.model_name,
            temperature=self.temperature,
            timeout=self.timeout,
            api_key=api_key,
        )
