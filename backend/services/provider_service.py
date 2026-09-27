"""Business logic for querying AI providers and models."""

from typing import List
from backend.core.config import Settings
from backend.models.provider import AIProviderInfo
from backend.providers.factory import ProviderFactory


class ProviderService:
    """Manages AI provider discovery and operational readiness check."""

    def __init__(self, settings: Settings):
        self._settings = settings

    def get_provider_manifest(self) -> List[AIProviderInfo]:
        """Discovers all supported providers and reports their availability status."""
        manifest: List[AIProviderInfo] = []
        registered_ids = ProviderFactory.list_available_providers()

        for pid in registered_ids:
            provider = ProviderFactory.get_provider(pid, self._settings)
            if provider:
                manifest.append(
                    AIProviderInfo(
                        id=provider.provider_id,
                        name=provider.provider_name,
                        is_available=provider.is_configured(),
                        supported_models=provider.get_supported_models(),
                    )
                )
        return manifest
