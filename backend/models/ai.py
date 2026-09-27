"""Pydantic request and response models for AI text generation."""

from typing import Optional
from pydantic import BaseModel, Field, field_validator


class AIGenerateRequest(BaseModel):
    """Payload for text generation request."""

    prompt: str = Field(
        ...,
        description="The input text or prompt to send to the AI provider.",
        min_length=1,
    )
    model: Optional[str] = Field(
        default=None,
        description="Specific model to use (e.g. 'gemini-2.5-flash'). Defaults to provider standard.",
    )
    provider: Optional[str] = Field(
        default="gemini",
        description="AI provider identifier (defaults to 'gemini').",
    )

    @field_validator("prompt")
    @classmethod
    def validate_prompt_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Prompt cannot be empty or solely whitespace.")
        return stripped


class AIGenerateResponse(BaseModel):
    """Predictable response contract for successful AI generation."""

    success: bool = Field(default=True, description="Indicates request success.")
    provider: str = Field(..., description="Provider that processed the request.")
    model: str = Field(..., description="Exact model employed.")
    content: str = Field(..., description="Generated text content.")


class AIErrorDetail(BaseModel):
    """Structured error descriptor."""

    code: str = Field(..., description="Machine-readable error code.")
    message: str = Field(..., description="Human-readable error description.")


class AIErrorResponse(BaseModel):
    """Structured response contract for AI generation errors."""

    success: bool = Field(default=False, description="Always false on error.")
    error: AIErrorDetail
