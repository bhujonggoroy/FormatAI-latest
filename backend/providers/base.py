"""Abstract base definitions and error hierarchy for AI providers in FormatAI.

Enforces provider-independent contracts across Gemini, Claude, OpenAI, and future models.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional
from backend.models.provider import AIModelInfo


class ProviderError(Exception):
    """Base exception for all AI provider-level failures."""

    def __init__(self, message: str, code: str = "PROVIDER_ERROR", status_code: int = 502):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code


class ProviderConfigError(ProviderError):
    """Raised when provider configuration or API keys are missing/invalid."""

    def __init__(self, message: str, code: str = "PROVIDER_NOT_CONFIGURED"):
        super().__init__(message=message, code=code, status_code=503)


class ProviderTimeoutError(ProviderError):
    """Raised when an external AI provider call times out."""

    def __init__(self, message: str = "AI provider request timed out", code: str = "PROVIDER_TIMEOUT"):
        super().__init__(message=message, code=code, status_code=504)


class ProviderRateLimitError(ProviderError):
    """Raised when upstream AI provider rate limits are exceeded."""

    def __init__(self, message: str = "AI provider rate limit reached", code: str = "RATE_LIMIT_EXCEEDED"):
        super().__init__(message=message, code=code, status_code=429)


class ProviderUpstreamError(ProviderError):
    """Raised when the upstream AI service returns an operational error."""

    def __init__(self, message: str, code: str = "UPSTREAM_ERROR"):
        super().__init__(message=message, code=code, status_code=502)


@dataclass
class ProviderGenerateResult:
    """Standardized output from any AI provider."""

    content: str
    model: str
    provider: str


class BaseAIProvider(ABC):
    """Abstract interface that all external AI providers must implement."""

    @property
    @abstractmethod
    def provider_id(self) -> str:
        """Unique identifier string for the provider (e.g. 'gemini')."""
        pass

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Human-readable provider name (e.g. 'Google Gemini')."""
        pass

    @property
    @abstractmethod
    def default_model(self) -> str:
        """Default model identifier used when none is explicitly specified."""
        pass

    @abstractmethod
    def is_configured(self) -> bool:
        """Returns True if the required credentials (e.g. API key) are present."""
        pass

    @abstractmethod
    def get_supported_models(self) -> List[AIModelInfo]:
        """Returns list of supported models by this provider."""
        pass

    @abstractmethod
    def generate_text(
        self,
        prompt: str,
        model: Optional[str] = None,
        timeout: float = 30.0,
    ) -> ProviderGenerateResult:
        """Generates text from prompt, handling timeout, error extraction, and normalization.

        Raises:
            ProviderConfigError: If API credentials are missing.
            ProviderTimeoutError: If request exceeds specified timeout.
            ProviderRateLimitError: If upstream quota/rate limit is hit.
            ProviderUpstreamError: If upstream provider returns an error.
        """
        pass
