"""FastAPI Dependency Injection helpers."""

from fastapi import Depends
from backend.core.config import Settings, get_settings
from backend.services.ai_service import AIService
from backend.services.content_cleanup_service import ContentCleanupService
from backend.services.document_service import DocumentService
from backend.services.formatting_service import FormattingService
from backend.services.health_service import HealthService
from backend.services.provider_service import ProviderService


def get_health_service(settings: Settings = Depends(get_settings)) -> HealthService:
    """Dependency provider for HealthService."""
    return HealthService(settings)


def get_provider_service(settings: Settings = Depends(get_settings)) -> ProviderService:
    """Dependency provider for ProviderService."""
    return ProviderService(settings)


def get_ai_service(settings: Settings = Depends(get_settings)) -> AIService:
    """Dependency provider for AIService."""
    return AIService(settings)


def get_content_cleanup_service() -> ContentCleanupService:
    """Dependency provider for ContentCleanupService."""
    return ContentCleanupService()


def get_formatting_service() -> FormattingService:
    """Dependency provider for FormattingService."""
    return FormattingService()


def get_document_service(
    settings: Settings = Depends(get_settings),
    cleanup_service: ContentCleanupService = Depends(get_content_cleanup_service),
    formatting_service: FormattingService = Depends(get_formatting_service),
) -> DocumentService:
    """Dependency provider for DocumentService orchestrator."""
    return DocumentService(
        settings=settings,
        content_cleanup_service=cleanup_service,
        formatting_service=formatting_service,
    )
