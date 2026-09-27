"""AI Provider text generation routes."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from backend.api.deps import get_ai_service
from backend.models.ai import (
    AIGenerateRequest,
    AIGenerateResponse,
    AIErrorDetail,
    AIErrorResponse,
)
from backend.providers.base import ProviderError
from backend.services.ai_service import AIService

router = APIRouter(prefix="/api/ai", tags=["AI Generation"])


@router.post(
    "/generate",
    response_model=AIGenerateResponse,
    responses={
        400: {"model": AIErrorResponse, "description": "Validation or provider error"},
        429: {"model": AIErrorResponse, "description": "Rate limit exceeded"},
        502: {"model": AIErrorResponse, "description": "Upstream AI provider error"},
        503: {"model": AIErrorResponse, "description": "Provider not configured"},
        504: {"model": AIErrorResponse, "description": "Provider request timeout"},
    },
    summary="Generate text via AI provider",
    description="Submits prompt to configured AI provider (defaults to Google Gemini) and returns standardized content.",
)
def generate_ai_text(
    payload: AIGenerateRequest,
    ai_service: AIService = Depends(get_ai_service),
):
    """Executes AI generation request, delegating logic to AIService."""
    try:
        return ai_service.generate(payload)
    except ProviderError as exc:
        return JSONResponse(
            status_code=exc.status_code,
            content=AIErrorResponse(
                success=False,
                error=AIErrorDetail(
                    code=exc.code,
                    message=exc.message,
                ),
            ).model_dump(),
        )
    except ValueError as exc:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=AIErrorResponse(
                success=False,
                error=AIErrorDetail(
                    code="INVALID_REQUEST",
                    message=str(exc),
                ),
            ).model_dump(),
        )
    except Exception as exc:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=AIErrorResponse(
                success=False,
                error=AIErrorDetail(
                    code="INTERNAL_SERVER_ERROR",
                    message="An unexpected error occurred while processing the AI request.",
                ),
            ).model_dump(),
        )
