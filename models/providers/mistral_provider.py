"""Mistral LLM provider implementation."""

from langchain_mistralai import ChatMistralAI
from langchain_core.language_models.chat_models import BaseChatModel
from models.providers.base import BaseProvider


class MistralProvider(BaseProvider):
    """Mistral Provider implementation."""

    def __init__(self, model_name: str, temperature: float = 0.0, timeout: int = 30):
        super().__init__(
            name="Mistral",
            env_key_names=["MISTRAL_API_KEY", "MISTRALAI_API_KEY"],
            model_name=model_name,
            temperature=temperature,
            timeout=timeout,
        )

    def create_llm(self) -> BaseChatModel:
        api_key = self.get_api_key()
        return ChatMistralAI(
            model=self.model_name,
            temperature=self.temperature,
            timeout=self.timeout,
            api_key=api_key,
        )
