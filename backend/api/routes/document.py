"""Academic Document Processing API Routes."""

from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from backend.api.deps import get_document_service
from backend.models.document import (
    DocumentAnalysis,
    DocumentProcessRequest,
    DocumentProcessResponse,
)
from backend.services.document_service import DocumentService

router = APIRouter(prefix="/api/document", tags=["Document Processing"])


@router.post(
    "/process",
    response_model=DocumentProcessResponse,
    summary="Process Raw Academic Content",
    description="Executes the full pipeline: Raw Input → Content Analysis → Content Cleanup → Structure Detection → Formatting Rules → Document Model.",
)
def process_document(
    payload: DocumentProcessRequest,
    document_service: DocumentService = Depends(get_document_service),
) -> DocumentProcessResponse:
    """Processes raw academic text into a structured internal document model."""
    try:
        return document_service.process(payload)
    except Exception as exc:
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={
                "success": False,
                "error": {
                    "code": "DOCUMENT_PROCESSING_FAILED",
                    "message": str(exc),
                },
            },
        )


@router.post(
    "/analyze",
    response_model=DocumentAnalysis,
    summary="Analyze Academic Content Structure",
    description="Performs structural and quality analysis on academic content without transforming it.",
)
def analyze_document(
    payload: DocumentProcessRequest,
    document_service: DocumentService = Depends(get_document_service),
) -> DocumentAnalysis:
    """Analyzes raw academic text structure, headings, math density, and citations."""
    return document_service.analyze_content(payload.raw_text)
