"""Factory to instantiate and resolve AI providers dynamically."""

from typing import Dict, Optional, Type
from backend.core.config import Settings
from backend.providers.base import BaseAIProvider
from backend.providers.gemini import GeminiProvider


class ProviderFactory:
    """Manages AI provider registration and instance resolution."""

    _registry: Dict[str, Type[BaseAIProvider]] = {
        "gemini": GeminiProvider,
    }

    @classmethod
    def get_provider(cls, provider_id: str, settings: Settings) -> Optional[BaseAIProvider]:
        """Instantiates provider with safe credentials from settings."""
        provider_class = cls._registry.get(provider_id.lower())
        if not provider_class:
            return None

        if provider_id.lower() == "gemini":
            return GeminiProvider(api_key=settings.GEMINI_API_KEY)

        return provider_class()  # Default instantiation for future providers

    @classmethod
    def list_available_providers(cls) -> list[str]:
        """Returns list of registered provider IDs."""
        return list(cls._registry.keys())
