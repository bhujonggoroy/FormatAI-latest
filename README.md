# FormatAI

FormatAI is an AI-powered academic document formatting application. It transforms raw AI-generated content (from ChatGPT, Gemini, NotebookLM, Claude, Copilot, Perplexity, etc.) into professionally formatted, publication-grade academic documents (primary export target: editable DOCX and PDF).

## Clean & Modular Repository Architecture

```text
FormatAI/
├── backend/
│   ├── __init__.py                  # Python package initializer
│   ├── main.py                      # FastAPI application entry point with lifespan & CORS
│   ├── requirements.txt             # Pinned backend dependencies (FastAPI, google-genai, etc.)
│   ├── api/                         # FastAPI route layer only (no business logic)
│   │   ├── __init__.py
│   │   ├── deps.py                  # Dependency injection providers (Settings, Services)
│   │   ├── router.py                # Master API router aggregating sub-routers
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── health.py            # Route handlers for /api/health and /
│   │       ├── ai.py                # POST /api/ai/generate endpoint
│   │       └── document.py          # POST /api/document/process & /analyze
│   ├── services/                    # Business logic layer
│   │   ├── __init__.py
│   │   ├── document_service.py      # Core document pipeline orchestrator
│   │   ├── content_cleanup_service.py # Strips AI conversational chatter & structural noise
│   │   ├── formatting_service.py    # Enforces heading hierarchy, typography & list rules
│   │   ├── ai_service.py            # AIService using BaseAIProvider abstraction
│   │   ├── health_service.py        # Health diagnostics & system status logic
│   │   └── provider_service.py      # AI provider status discovery and validation logic
│   ├── providers/                   # External AI provider implementations
│   │   ├── __init__.py
│   │   ├── base.py                  # BaseAIProvider abstract interface & ProviderError hierarchy
│   │   ├── gemini.py                # Google Gemini provider implementation (google-genai SDK)
│   │   └── factory.py               # Dynamic provider registry and factory resolver
│   ├── models/                      # Pydantic schemas and data contracts
│   │   ├── __init__.py
│   │   ├── document.py              # DocumentStructure, DocumentElement, TableData, InlineEntity
│   │   ├── ai.py                    # AIGenerateRequest, AIGenerateResponse, AIErrorResponse
│   │   ├── health.py                # HealthResponse and RootResponse schemas
│   │   └── provider.py              # AIModelInfo and AIProviderInfo schemas
│   ├── utils/                       # Reusable utility functions
│   │   ├── __init__.py
│   │   ├── markdown.py              # Markdown table, list, code block & heading parser
│   │   ├── text_processing.py       # Typography normalization & inline entity extraction
│   │   └── text.py                  # Word counting & whitespace normalization
│   └── core/                        # Application-level configuration and settings
│       ├── __init__.py
│       ├── config.py                # Pydantic-settings safe environment configuration
│       └── logging.py               # Centralized structured logger setup
├── frontend/
│   ├── index.html                   # HTML5 entry point for Vite React
│   ├── package.json                 # Frontend dependencies and npm scripts
│   ├── tsconfig.json                # TypeScript configuration
│   ├── vite.config.ts               # Vite configuration with API reverse proxy
│   └── src/
│       ├── App.tsx                  # Status dashboard displaying backend health & architecture
│       ├── main.tsx                 # React root mounting
│       └── index.css                # Tailwind CSS styles
├── tests/
│   ├── __init__.py                  # Python test package initializer
│   ├── test_document_pipeline.py    # 13 tests verifying all academic content types & pipeline
│   ├── test_ai_provider.py          # 9 tests verifying Gemini provider & AI API validation
│   ├── test_architecture.py         # 5 tests verifying Core, Services, Providers & Utils
│   └── test_health.py               # 2 tests verifying FastAPI health & root endpoints
├── .env.example                     # Template for environment variables (no secrets)
├── .gitignore                       # Ignored files for Python, Node, and environment files
└── README.md                        # Project documentation and architecture guide
```

---

## Document Processing Pipeline

FormatAI implements a rigorous 7-stage processing pipeline for academic content:

$$\text{Raw Input} \longrightarrow \mathbf{Content\ Analysis} \longrightarrow \mathbf{Content\ Cleanup} \longrightarrow \mathbf{Structure\ Detection} \longrightarrow \mathbf{Formatting\ Rules} \longrightarrow \mathbf{Document\ Model} \longrightarrow \mathbf{Export}$$

### Pipeline Separation Principle
1. **Formatting Cleanup**:
   - Repair non-contiguous heading leaps ($H1 \to H3$ fixed to $H1 \to H2$)
   - Spacing normalization (collapsing excessive blank lines, line trailing space trimming)
   - List standardization (bullets normalized to `-`, broken ordered numbering $1., 1., 1.$ to $1., 2., 3.$)
   - Academic typography (smart curly quotes, em-dashes `—`, en-dashes `–` for number ranges, ellipses `…`)
   - Mathematical expression delimiter validation ($...$ and display math $$...$$ protected)
   - Broken artifact removal (orphan asterisks, trailing lone hashes)
2. **Content Cleanup**:
   - Strip AI conversational preambles ("Sure, here is the paper:") and postscripts ("Hope this helps!")
   - Remove redundant and empty headings
   - Convert isolated narrative bullets into coherent academic paragraphs
   - Consolidate fragmented 1-sentence AI paragraphs into structured paragraphs
   - **Strict Guarantee**: Preserves user academic facts, equations, and meaning intact.

---

## Supported Content Types & Entities

- **Title & Headings**: Up to 6 hierarchical levels with auto-level repair
- **Paragraphs & Abstract**: Clean text blocks with entity tracking
- **Lists**: Nested and flat ordered/unordered lists
- **Markdown Tables**: Headers, data rows, alignments (left, center, right)
- **Quotations**: Academic blockquotes with attribution preservation
- **Code Blocks**: Fenced code with language identifier
- **Mathematical Expressions**: Display math ($$...$$) and LaTeX environments (`\begin{equation}...\end{equation}`)
- **Scientific Notation**: E.g., $6.022 \times 10^{23}$, $1.602 \times 10^{-19}\text{ C}$
- **Chemical Formulas**: E.g., $\text{H}_2\text{O}$, $\text{CO}_2$, $\text{C}_6\text{H}_{12}\text{O}_6$, $\text{H}_2\text{SO}_4$
- **Citations**: Numeric `[1]`, `[1, 2]`, author-year `(Smith et al., 2021)`, Pandoc `[@doe2020]`
- **References**: Structured bibliography items

---

## How to Run & Test

```bash
# Run complete test suite (29 tests)
python3 -m pytest tests/

# Run FastAPI backend
python3 -m uvicorn backend.main:app --host 0.0.0.0 --port 8001
```
