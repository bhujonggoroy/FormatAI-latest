"""FormatAI Backend Main Application.

FastAPI entry point for FormatAI - AI-powered academic document formatter.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="FormatAI API",
    description="Python FastAPI backend for FormatAI academic document formatting application",
    version="1.0.0",
)

# Enable CORS for frontend client communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HealthResponse(BaseModel):
    status: str
    service: str
    backend: str


@app.get("/")
def read_root():
    """Root endpoint verifying that the Python FastAPI backend is operational."""
    return {
        "status": "online",
        "service": "FormatAI",
        "backend": "Python FastAPI",
        "message": "FormatAI Python FastAPI Backend is running successfully.",
        "docs_url": "/docs",
        "version": "1.0.0",
    }


@app.get("/api/health", response_model=HealthResponse)
def health_check():
    """Health check endpoint required by FormatAI architecture specifications."""
    return {
        "status": "ok",
        "service": "FormatAI",
        "backend": "python",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8001, reload=True)
