# FormatAI

FormatAI is an AI-powered academic document formatting application. It transforms raw AI-generated content (from ChatGPT, Gemini, NotebookLM, Claude, Copilot, Perplexity, etc.) into professionally formatted, publication-grade academic documents (primary export target: editable DOCX and PDF).

## Initial Repository Architecture

```text
FormatAI/
├── backend/
│   ├── __init__.py          # Python package initializer
│   ├── main.py              # FastAPI backend with health and root endpoints
│   └── requirements.txt     # Python backend dependencies (FastAPI, Uvicorn, etc.)
├── frontend/
│   ├── index.html           # HTML5 entry point for Vite React
│   ├── package.json         # Frontend dependencies and npm scripts
│   ├── tsconfig.json        # TypeScript configuration
│   ├── vite.config.ts       # Vite configuration with API reverse proxy
│   └── src/
│       ├── App.tsx          # Minimal dashboard displaying backend status & health
│       ├── main.tsx         # React root mounting
│       └── index.css        # Tailwind CSS styles
├── tests/
│   ├── __init__.py          # Python test package initializer
│   └── test_health.py       # Pytest suite for FastAPI health & root endpoints
├── .env.example             # Template for environment variables (no secrets)
├── .gitignore               # Ignored files for Python, Node, and environment files
└── README.md                # Project documentation and running instructions
```

---

## Technology Stack

- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Testing**: Pytest, HTTPX, FastAPI TestClient
- **Document Processing Engine**: Python-based (`python-docx` and Pandoc planned)
- **AI Architecture**: Provider-independent model integration (starting with Google Gemini)

---

## How to Run

### 1. Run the Python FastAPI Backend

From the repository root:

```bash
# 1. Install backend dependencies
pip install -r backend/requirements.txt

# 2. Start the FastAPI development server with Uvicorn
uvicorn backend.main:app --host 0.0.0.0 --port 8001 --reload
```

The backend API will be available at:
- Root info: `http://localhost:8001/`
- Health check: `http://localhost:8001/api/health`
- Interactive Swagger docs: `http://localhost:8001/docs`
- ReDoc documentation: `http://localhost:8001/redoc`

### 2. Run the React Frontend

From the repository root or `frontend/` directory:

```bash
# If running standalone frontend
cd frontend
npm install
npm run dev

# Or from repository root
npm run dev
```

The frontend development server will launch at:
- Web App: `http://localhost:3000`

---

## Verifying the Backend

### Run Unit Tests
```bash
python3 -m pytest tests/
```

### Manual Curl Verification
```bash
# Test health endpoint
curl -s http://localhost:8001/api/health
# Response:
# {"status":"ok","service":"FormatAI","backend":"python"}

# Test root endpoint
curl -s http://localhost:8001/
# Response:
# {"status":"online","service":"FormatAI","backend":"Python FastAPI","message":"FormatAI Python FastAPI Backend is running successfully.","docs_url":"/docs","version":"1.0.0"}
```
