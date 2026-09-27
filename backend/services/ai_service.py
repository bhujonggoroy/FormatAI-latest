"""AI Service business logic layer.

Communicates with the provider abstraction (BaseAIProvider) rather than embedding
provider-specific logic directly.
"""

from typing import Optional
from backend.core.config import Settings
from backend.core.logging import logger
from backend.models.ai import AIGenerateRequest, AIGenerateResponse
from backend.providers.base import (
    BaseAIProvider,
    ProviderConfigError,
    ProviderError,
)
from backend.providers.factory import ProviderFactory


class AIService:
    """Orchestrates AI generation requests through provider abstractions."""

    def __init__(self, settings: Settings, provider: Optional[BaseAIProvider] = None):
        self._settings = settings
        self._override_provider = provider

    def _resolve_provider(self, provider_id: Optional[str]) -> BaseAIProvider:
        """Resolves target provider instance from factory or injected provider."""
        if self._override_provider is not None:
            return self._override_provider

        target_id = (provider_id or self._settings.DEFAULT_AI_PROVIDER).lower()
        provider = ProviderFactory.get_provider(target_id, self._settings)

        if not provider:
            raise ProviderError(
                message=f"Unsupported AI provider: '{target_id}'. Registered: {ProviderFactory.list_available_providers()}",
                code="UNSUPPORTED_PROVIDER",
                status_code=400,
            )

        return provider

    def generate(self, request: AIGenerateRequest) -> AIGenerateResponse:
        """Executes text generation using the resolved provider."""
        provider = self._resolve_provider(request.provider)

        if not provider.is_configured():
            raise ProviderConfigError(
                message=f"Provider '{provider.provider_name}' is not configured with an API key in the server environment (.env).",
                code="PROVIDER_NOT_CONFIGURED",
            )

        logger.info(
            f"AIService executing request [provider={provider.provider_id}, model={request.model or provider.default_model}]"
        )

        result = provider.generate_text(
            prompt=request.prompt,
            model=request.model,
        )

        return AIGenerateResponse(
            success=True,
            provider=result.provider,
            model=result.model,
            content=result.content,
        )
