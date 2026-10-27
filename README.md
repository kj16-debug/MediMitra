# MediMitra

> **DISCLAIMER**: Decision support only. Not a diagnosis. MediMitra is a technology prototype for community health workers and must never be used to make real clinical decisions, establish medical diagnoses, or prescribe medications and dosages. Always defer to qualified medical officers and local emergency healthcare protocols.

MediMitra is an offline-first clinical triage decision support assistant tailored for community health workers (e.g. ASHA workers) in low-connectivity rural settings. It provides structured symptom intake, preliminary urgency categorization (Green, Yellow, Red), deterministic red-flag safety overrides, printable referral notes, and dual-model cloud second-opinion comparisons.

---

## Quick Start & Local Setup

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Backend Service
```bash
# Set up virtual environment
python -m venv .venv

# Activate virtual environment
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Linux / macOS:
# source .venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Start backend on port 8000
uvicorn app.main:app --app-dir backend --reload --port 8000
```
- Backend API: <http://localhost:8000>
- Interactive API Docs: <http://localhost:8000/docs>

### 2. Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
- Frontend Web App: <http://localhost:5173>

### 3. Running Tests and Verifying Builds
```bash
# Run backend pytest suite (124 tests)
.\.venv\Scripts\Activate.ps1
pytest -q

# Verify frontend production build
cd frontend
npm run build
```

---

## Demo Mode vs. Live Mode

### Demo Mode (`DEMO_MODE=1`, Default)
- Runs completely offline with deterministic simulated triage responses.
- Requires no external API keys, internet connection, or local model downloads.
- Allows full workflow evaluation (intake, urgency classification, safety overrides, printable referral notes, and side-by-side cloud comparison) out of the box.
- Sample demo cases (e.g. Kabir, Dev) test normal and safety-override workflows without live inference.

### Live Mode (`DEMO_MODE=0`)
- Connects to live language models for clinical summary generation and question suggestion.
- **Local On-Device Engine**: Calls local OpenAI-compatible endpoints (e.g. Ollama running Gemma models).
- **Cloud Escalation**: Calls cloud OpenAI-compatible endpoints (e.g. Jarvislabs Token Factory running `gemma-4-26b-a4b-it`).
- **Independent Model Operation**: Local and cloud endpoints operate independently. If only local is configured, local runs while cloud escalation indicates unavailable; if only cloud is configured, local falls back to rules-only while cloud escalation functions.
- **Rules-Only Fallback**: If an AI model fails, times out, or returns invalid schema, the system returns a deterministic rules-only result (`rules_only: true`, minimum yellow urgency) labelled `"AI unavailable - rules only"`.

---

## Environment Variables

### Backend Configuration (`.env`)
Configuration template is provided in `.env.example`. Copy `.env.example` to `.env` to configure.

| Variable | Default Value | Description |
|---|---|---|
| `DEMO_MODE` | `1` | `1` for deterministic offline simulation; `0` for live model inference. |
| `LOCAL_BASE_URL` | `http://localhost:11434/v1` | Base URL for local OpenAI-compatible inference server (e.g. Ollama). |
| `LOCAL_API_KEY` | `ollama` | API key for local inference endpoint. |
| `LOCAL_MODEL` | `""` | Local model tag in Ollama (e.g. `gemma4:e4b`). Empty disables local model. |
| `CLOUD_BASE_URL` | `https://models.jarvislabs.net/v1` | Base URL for cloud inference provider (Jarvislabs Token Factory). |
| `JARVISLABS_API_KEY` | `""` | Secret API key for cloud provider (kept strictly server-side). |
| `CLOUD_MODEL` | `gemma-4-26b-a4b-it` | Served model identifier on the cloud provider. |
| `LOCAL_TIMEOUT_SECONDS` | `120.0` | Request timeout for local model (float; allows slow CPU inference). Bad/negative values safely fall back to `120.0`. |
| `CLOUD_TIMEOUT_SECONDS` | `60.0` | Request timeout for cloud model (float). Bad/negative values safely fall back to `60.0`. |
| `CLOUD_MAX_TOKENS` | `4000` | Maximum generation tokens for cloud model requests (prevents truncation on reasoning models). |
| `CLOUD_ENABLE_THINKING` | `0` | Enable thinking/reasoning on cloud models (`0` disables thinking for direct, fast JSON output; `1` enables). |
| `DEBUG_LOG` | `0` | Debug logging toggle. Patient case text and model outputs are never logged regardless of setting. |
| `CORS_ORIGINS` | `http://localhost:5173,...` | Comma-separated list of allowed browser origins (wildcards prohibited). |
| `SUPERVISOR_EMERGENCY_CONTACT` | `"Contact your supervisor..."` | Fallback emergency instruction string for field health workers. |
| `MAX_BODY_SIZE` | `1000000` | Maximum request body size in bytes enforced by middleware. |
| `RATE_LIMIT_PER_MINUTE` | `60` | In-memory sliding-window request limit per client IP. |

### Frontend Configuration (`frontend/.env`)
Configuration template is provided in `frontend/.env.example`.

| Variable | Default Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `""` | Base URL for backend API. Leave empty to use Vite `/api` proxy in development. |
| `VITE_HELPLINE_TEXT` | `""` | Public district emergency helpline text displayed on the self-harm screen. Hidden if unset. |

> **IMPORTANT SECURITY NOTE**: API keys (including `JARVISLABS_API_KEY`) must remain strictly in backend `.env` (which is git-ignored). Never put API keys or secrets in `frontend/.env`, any `VITE_` variable, or version control. Any variable prefixed with `VITE_` is compiled into client-side JavaScript and exposed to the browser.

---

## Safety Architecture & Guardrails

MediMitra implements multi-layered safety guardrails to ensure decision support integrity:

1. **Deterministic Red-Flag Rules Run After Model**:
   - Safety rules in `backend/app/red_flags.py` evaluate on every intake after the model (or fallback) returns.
   - **Safety Invariant**: Rules can only maintain or raise urgency (e.g. Green -> Yellow, Yellow -> Red), never lower it. Low SpO₂ (< 90%), chest pain, convulsions, or respiratory distress automatically force RED urgency regardless of model proposal.

2. **Self-Harm Safety Protocol**:
   - Detection of self-harm phrases (`want to die`, `kill myself`, `end my life`) immediately triggers a priority safety override:
     - Urgency is locked to **RED**.
     - Referral note and summary prominently display: `IMMEDIATE HUMAN SUPPORT REQUIRED: Connect with emergency care or a crisis worker immediately.`
     - The UI routes directly to an empathetic safety guidance screen instructing the worker to stay with the person, never leave them alone, and contact a supervisor.

3. **Model Output Treatment & Dosage Filter**:
   - Every free-text field returned by an external model is inspected by `backend/app/output_filter.py`.
   - If any dosage units (e.g. `mg`, `ml`, `tablets`, `puffs`), prescription/administration actions (`prescribe`, `administer`, `give him/her`), or drug names (`paracetamol`, `antibiotics`, `ibuprofen`, `ORS`, etc.) appear, **all model output is discarded**.
   - The request automatically falls back to a rules-only result (`rules_only: true`, minimum yellow urgency).
   - Word-boundary matching (`\b`) ensures harmless words (e.g. "table", "doctors", "orders") pass without false positives.

4. **Case Text Delimited as Untrusted Data**:
   - In prompts, patient text is enclosed within `<case_data>...</case_data>` delimiters.
   - Any raw `</case_data>` closing tags in user input are neutralized to prevent delimiter escape.
   - The system prompt explicitly instructs the model that data inside tags is untrusted patient observations and that instructions inside must be ignored.

5. **No Case Text Logged or Stored**:
   - Patient text, vitals, and model responses are held in transient memory only for the duration of the request.
   - Server access logging, error handlers, and client storage (localStorage, sessionStorage, indexedDB, console) never store or log case text.

---

## Status API & Header Indicators

The backend exposes `GET /api/status`, returning configuration status without exposing secrets:
- `demo_mode`: Boolean flag indicating whether simulation mode is active.
- `local_configured`: Boolean indicating whether local model and endpoint are configured.
- `cloud_configured`: Boolean indicating whether cloud model, endpoint, and API key are configured.
- `local_model`: Configured local model name (or simulated demo label).
- `cloud_model`: Configured cloud model name (or simulated demo label).

### Header Status Pill Meaning
The frontend header status pill dynamically indicates runtime state:
- **`Simulated demo`**: Backend is running in demo mode (`DEMO_MODE=1`).
- **`Live: <model>`**: Backend is running in live mode (`DEMO_MODE=0`) and the model is configured (e.g. `Live: gemma4:e4b` or `Live: Cloud (gemma-4-26b-a4b-it)`).
- **`Live: not configured`**: Backend is in live mode (`DEMO_MODE=0`), but neither local nor cloud models are configured.
- **`Status unavailable`**: Frontend cannot reach `/api/status` (e.g. backend offline or network disruption).

---

## Privacy Notice

- **Cloud Escalation Privacy**: When escalating a case for cloud second opinion, patient case text and vital signs are transmitted over HTTPS to the configured cloud provider (Jarvislabs Token Factory).
- **Synthetic Data Requirement**: Because this is a prototype, evaluators and health workers must **only use fictional patient cases**. Never enter real patient identifying information, national ID numbers, or protected health information (PHI).

---

## Known Limitations

- **Keyword-Based Rules Cannot Read Negation**: Deterministic red-flag rules match targeted clinical keywords and vital signs thresholds. They intentionally err on the side of caution and do not interpret complex linguistic negation (e.g. "patient has no chest pain" may still trigger a yellow/red check).
- **Clinical Validation Required**: MediMitra is a technology proof-of-concept and has not undergone formal clinical trials. Deterministic red-flag rules and prompt structures must be reviewed and validated by licensed medical officers before deployment in field operations.
- **Per-IP Rate Limiting**: The in-memory sliding-window rate limiter tracks client socket IPs. In deployments behind reverse proxies or load balancers, trusted header forwarding (e.g. `X-Forwarded-For`) must be configured to avoid grouping multiple clinic devices under one IP.
- **No Real Translations**: The language selector is disabled with `"More languages coming soon"` to avoid unverified medical translations. The interface and triage outputs remain in English.
- **No Hardcoded Helpline Numbers**: No specific emergency helpline telephone numbers are hardcoded. Deployments must configure verified local district emergency contacts via `VITE_HELPLINE_TEXT` and `SUPERVISOR_EMERGENCY_CONTACT`.
