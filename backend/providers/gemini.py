"""Google Gemini AI Provider implementation using official google-genai SDK.

Supports:
- Model selection and validation (default: gemini-3.8-flash)
- Prompt submission and response extraction
- Error normalization without key leakage
- Safe configuration check
"""

from typing import Any, List, Optional
from google import genai
from google.genai.errors import APIError

from backend.core.logging import logger
from backend.models.provider import AIModelInfo
from backend.providers.base import (
    BaseAIProvider,
    ProviderConfigError,
    ProviderError,
    ProviderGenerateResult,
    ProviderRateLimitError,
    ProviderTimeoutError,
    ProviderUpstreamError,
)


class GeminiProvider(BaseAIProvider):
    """Concrete Google Gemini AI Provider."""

    DEFAULT_MODEL = "gemini-3.8-flash"

    SUPPORTED_MODELS = [
        AIModelInfo(
            id="gemini-3.8-flash",
            name="Gemini 3.8 Flash",
            context_window=1048576,
            supports_formatting=True,
        ),
        AIModelInfo(
            id="gemini-3.1-pro-preview",
            name="Gemini 3.1 Pro",
            context_window=2097152,
            supports_formatting=True,
        ),
    ]

    def __init__(self, api_key: Optional[str] = None, client: Optional[Any] = None):
        """Initializes Gemini provider with optional API key or pre-configured client (for testing)."""
        self._api_key = api_key.strip() if api_key and api_key.strip() else None
        self._client = client

    @property
    def provider_id(self) -> str:
        return "gemini"

    @property
    def provider_name(self) -> str:
        return "Google Gemini"

    @property
    def default_model(self) -> str:
        return self.DEFAULT_MODEL

    def is_configured(self) -> bool:
        """Verifies if the provider has credentials configured."""
        if self._client is not None:
            return True
        return bool(self._api_key)

    def get_supported_models(self) -> List[AIModelInfo]:
        return list(self.SUPPORTED_MODELS)

    def _get_client(self) -> genai.Client:
        """Instantiates or returns the cached GenAI client."""
        if self._client is not None:
            return self._client

        if not self.is_configured():
            raise ProviderConfigError(
                message="Google Gemini API key is not configured. Set GEMINI_API_KEY in the server environment (.env).",
                code="GEMINI_KEY_NOT_CONFIGURED",
            )

        return genai.Client(api_key=self._api_key)

    def generate_text(
        self,
        prompt: str,
        model: Optional[str] = None,
        timeout: float = 30.0,
    ) -> ProviderGenerateResult:
        """Submits prompt to Gemini API and returns standardized result.

        Normalizes provider-specific exceptions into structured ProviderError types.
        Never leaks the API key or raw credential details.
        """
        target_model = model or self.default_model

        # Ensure provider is configured before attempting network call
        if not self.is_configured():
            raise ProviderConfigError(
                message="Google Gemini API key is not configured. Set GEMINI_API_KEY in the server environment (.env).",
                code="GEMINI_KEY_NOT_CONFIGURED",
            )

        client = self._get_client()

        logger.info(f"Submitting generation request to Gemini provider [model: {target_model}]")

        try:
            response = client.models.generate_content(
                model=target_model,
                contents=prompt,
            )

            # Extract generated content safely
            content = getattr(response, "text", None)
            if content is None:
                # Fallback for structured content blocks if text property is empty
                if hasattr(response, "candidates") and response.candidates:
                    parts = response.candidates[0].content.parts
                    content = "".join([getattr(p, "text", "") for p in parts if hasattr(p, "text")])
                else:
                    content = ""

            return ProviderGenerateResult(
                content=content,
                model=target_model,
                provider=self.provider_id,
            )

        except APIError as exc:
            # Handle official Google GenAI API exceptions
            status_code = getattr(exc, "code", 502)
            raw_message = getattr(exc, "message", str(exc))
            # Sanitize to prevent key leakage
            sanitized = self._sanitize_message(str(raw_message))

            logger.error(f"Gemini API Error (status {status_code}): {sanitized}")

            if status_code in (401, 403):
                raise ProviderConfigError(
                    message=f"Gemini authentication failed: {sanitized}",
                    code="GEMINI_AUTH_FAILED",
                ) from exc
            elif status_code == 429:
                raise ProviderRateLimitError(
                    message=f"Gemini quota/rate limit exceeded: {sanitized}",
                ) from exc
            else:
                raise ProviderUpstreamError(
                    message=f"Gemini service error: {sanitized}",
                    code="GEMINI_UPSTREAM_ERROR",
                ) from exc

        except TimeoutError as exc:
            logger.error("Gemini call timed out.")
            raise ProviderTimeoutError(
                message="Request to Google Gemini API timed out.",
            ) from exc

        except ProviderError:
            # Re-raise already normalized provider errors
            raise

        except Exception as exc:
            sanitized = self._sanitize_message(str(exc))
            logger.error(f"Unexpected error communicating with Gemini: {sanitized}")
            raise ProviderUpstreamError(
                message=f"Failed to generate content with Gemini: {sanitized}",
                code="GEMINI_GENERATION_FAILED",
            ) from exc

    def _sanitize_message(self, text: str) -> str:
        """Ensures any accidental inclusion of the API key is completely redacted."""
        if self._api_key and self._api_key in text:
            return text.replace(self._api_key, "[REDACTED_API_KEY]")
        return text
