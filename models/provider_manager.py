"""Provider Manager and Failover orchestrator for Astera."""

import logging
import time
from typing import Any, Callable, Dict, List, Optional, Sequence, Type, Union
from langchain_core.callbacks import CallbackManagerForLLMRun
from langchain_core.language_models.chat_models import BaseChatModel
from langchain_core.messages import BaseMessage
from langchain_core.outputs import ChatResult, ChatGeneration
from langchain_core.tools import BaseTool

from config import (
    PROVIDER_PRIORITY,
    PROVIDER_MODELS,
    PROVIDER_TIMEOUTS,
    MODEL_TEMPERATURE,
    MAX_RETRIES_PER_PROVIDER,
    INITIAL_RETRY_DELAY_SEC,
    BACKOFF_FACTOR,
    PROVIDER_COOLDOWN_SEC,
)
from models.providers.base import BaseProvider
from models.providers.groq_provider import GroqProvider
from models.providers.cerebras_provider import CerebrasProvider
from models.providers.gemini_provider import GeminiProvider
from models.providers.mistral_provider import MistralProvider
from models.providers.openrouter_provider import OpenRouterProvider

logger = logging.getLogger(__name__)


def is_retryable_error(exc: Exception) -> bool:
    """Check if exception is a retryable network / rate-limit / server error."""
    msg = str(exc).lower()
    return any(
        err in msg
        for err in [
            "429",
            "rate limit",
            "too many requests",
            "quota",
            "timeout",
            "500",
            "502",
            "503",
            "504",
            "service unavailable",
            "overloaded",
        ]
    )


class ProviderManager:
    """Orchestrates provider selection, priority failover, smart retries, and cooldowns."""

    def __init__(self):
        self._provider_registry: Dict[str, BaseProvider] = {}
        self._cooldown_until: Dict[str, float] = {}
        self._register_default_providers()

    def _register_default_providers(self):
        provider_classes: Dict[str, Type[BaseProvider]] = {
            "groq": GroqProvider,
            "cerebras": CerebrasProvider,
            "gemini": GeminiProvider,
            "mistral": MistralProvider,
            "openrouter": OpenRouterProvider,
        }

        for name in PROVIDER_PRIORITY:
            cls = provider_classes.get(name)
            if cls:
                model_name = PROVIDER_MODELS.get(name, "")
                timeout = PROVIDER_TIMEOUTS.get(name, 30)
                provider = cls(
                    model_name=model_name,
                    temperature=MODEL_TEMPERATURE,
                    timeout=timeout,
                )
                self._provider_registry[name] = provider

    def get_candidate_providers(self) -> List[BaseProvider]:
        """Returns ordered list of available providers not currently in cooldown."""
        now = time.time()
        candidates = []

        for name in PROVIDER_PRIORITY:
            provider = self._provider_registry.get(name)
            if not provider:
                continue

            if not provider.is_available():
                logger.debug(f"Skipping {provider.name}: missing API key")
                continue

            cooldown_time = self._cooldown_until.get(name, 0.0)
            if now < cooldown_time:
                remaining = int(cooldown_time - now)
                logger.debug(f"Skipping {provider.name}: in cooldown for {remaining}s")
                continue

            candidates.append(provider)

        return candidates

    def mark_failed(self, provider_name: str, reason: str):
        """Mark provider as failed and set cooldown timestamp."""
        cooldown_until = time.time() + PROVIDER_COOLDOWN_SEC
        self._cooldown_until[provider_name] = cooldown_until
        logger.warning(
            f"Provider '{provider_name}' failed ({reason}). "
            f"Placed in cooldown for {int(PROVIDER_COOLDOWN_SEC)}s."
        )

    def invoke_with_failover(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        tools: Optional[Sequence[Any]] = None,
        **kwargs: Any,
    ) -> ChatResult:
        """Executes LLM call with priority failover across available providers."""
        candidates = self.get_candidate_providers()
        if not candidates:
            raise RuntimeError(
                "All LLM providers are unavailable (missing API keys or in active cooldown)."
            )

        last_exception: Optional[Exception] = None

        for provider in candidates:
            logger.info(f"Using provider: {provider.name} ({provider.model_name})")

            llm = provider.get_llm()
            if tools:
                llm = llm.bind_tools(tools)

            delay = INITIAL_RETRY_DELAY_SEC
            success = False

            for attempt in range(1, MAX_RETRIES_PER_PROVIDER + 1):
                try:
                    if hasattr(llm, "_generate"):
                        res = llm._generate(messages=messages, stop=stop, run_manager=run_manager, **kwargs)
                    else:
                        output_msg = llm.invoke(messages, stop=stop, config={"callbacks": run_manager}, **kwargs)
                        res = ChatResult(generations=[ChatGeneration(message=output_msg)])

                    return res
                except Exception as exc:
                    last_exception = exc
                    logger.warning(
                        f"{provider.name} attempt {attempt}/{MAX_RETRIES_PER_PROVIDER} failed: {exc}"
                    )

                    if not is_retryable_error(exc) or attempt == MAX_RETRIES_PER_PROVIDER:
                        break

                    time.sleep(delay)
                    delay *= BACKOFF_FACTOR

            # Provider failed all retries — failover to next candidate
            next_candidates = [p for p in candidates if p.name != provider.name]
            next_name = next_candidates[0].name if next_candidates else "None"
            logger.warning(f"Switching from {provider.name} to {next_name} due to failure.")
            self.mark_failed(provider.name, str(last_exception))

        raise RuntimeError(f"All LLM providers failed. Last error: {last_exception}")


class MultiProviderChatModel(BaseChatModel):
    """LangChain BaseChatModel wrapper providing transparent multi-provider failover."""

    manager: ProviderManager
    bound_tools: Optional[Sequence[Any]] = None

    def __init__(self, manager: Optional[ProviderManager] = None, bound_tools: Optional[Sequence[Any]] = None, **kwargs: Any):
        mgr = manager or ProviderManager()
        super().__init__(manager=mgr, bound_tools=bound_tools, **kwargs)

    @property
    def _llm_type(self) -> str:
        return "multi_provider_chat_model"

    def _generate(
        self,
        messages: List[BaseMessage],
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
        **kwargs: Any,
    ) -> ChatResult:
        return self.manager.invoke_with_failover(
            messages=messages,
            stop=stop,
            run_manager=run_manager,
            tools=self.bound_tools,
            **kwargs,
        )

    def bind_tools(
        self,
        tools: Sequence[Union[Dict[str, Any], Type, Callable, BaseTool]],
        **kwargs: Any,
    ) -> "MultiProviderChatModel":
        return MultiProviderChatModel(manager=self.manager, bound_tools=tools, **kwargs)
