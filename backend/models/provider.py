"""Pydantic schemas for AI providers and model metadata."""

from typing import List, Optional
from pydantic import BaseModel, Field


class AIModelInfo(BaseModel):
    """Information regarding a specific AI model."""
    id: str = Field(..., description="Unique model identifier")
    name: str = Field(..., description="Human-readable model name")
    context_window: Optional[int] = Field(default=None, description="Context window size in tokens")
    supports_formatting: bool = Field(default=True, description="Whether model supports document formatting")


class AIProviderInfo(BaseModel):
    """Metadata regarding an integrated AI provider."""
    id: str = Field(..., description="Provider identifier (e.g. 'gemini')")
    name: str = Field(..., description="Provider display name")
    is_available: bool = Field(default=False, description="Whether valid API configuration exists")
    supported_models: List[AIModelInfo] = Field(default_factory=list)
