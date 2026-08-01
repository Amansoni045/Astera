"""Google Gemini LLM provider implementation."""

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.language_models.chat_models import BaseChatModel
from models.providers.base import BaseProvider


class GeminiProvider(BaseProvider):
    """Google Gemini Provider implementation."""

    def __init__(self, model_name: str, temperature: float = 0.0, timeout: int = 30):
        super().__init__(
            name="Gemini",
            env_key_names=["GOOGLE_API_KEY", "GEMINI_API_KEY"],
            model_name=model_name,
            temperature=temperature,
            timeout=timeout,
        )

    def create_llm(self) -> BaseChatModel:
        api_key = self.get_api_key()
        return ChatGoogleGenerativeAI(
            model=self.model_name,
            google_api_key=api_key,
            temperature=self.temperature,
            request_timeout=self.timeout,
        )
