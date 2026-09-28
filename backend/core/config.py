"""Application configuration using Pydantic Settings.

Reads configuration safely from environment variables and .env file.
Ensures zero hardcoded secrets or API keys.
"""

from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """FormatAI system configuration."""

    # Application settings
    APP_NAME: str = "FormatAI"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = False

    # Server settings
    FASTAPI_HOST: str = "0.0.0.0"
    FASTAPI_PORT: int = 8001

    # AI Provider settings (Loaded safely from environment, never hardcoded)
    GEMINI_API_KEY: Optional[str] = None
    GROQ_API_KEY: Optional[str] = None
    OPENROUTER_API_KEY: Optional[str] = None
    MISTRAL_API_KEY: Optional[str] = None
    COHERE_API_KEY: Optional[str] = None
    HUGGINGFACE_API_KEY: Optional[str] = None
    HF_TOKEN: Optional[str] = None
    OPENAI_API_KEY: Optional[str] = None
    CUSTOM_OPENAI_API_KEY: Optional[str] = None
    CUSTOM_OPENAI_BASE_URL: str = "http://localhost:11434/v1"

    DEFAULT_AI_PROVIDER: str = "gemini"
    DEFAULT_AI_TIMEOUT: float = 30.0
    DEFAULT_AI_MAX_RETRIES: int = 1
    DISABLED_AI_PROVIDERS: list[str] = []

    # CORS settings
    ALLOWED_ORIGINS: list[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )


@lru_cache()
def get_settings() -> Settings:
    """Provides cached singleton settings instance for dependency injection."""
    return Settings()
