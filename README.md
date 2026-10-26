# MediMitra

An offline-first triage support prototype for community health workers. It demonstrates a structured intake, urgency summary, deterministic safety rules, a referral note, and a cloud escalation comparison. It is decision support only, not a diagnostic tool.

## Run locally

Requirements: Python 3.11+ and Node.js 18+.

```bash
cp .env.example .env
python3 -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
uvicorn app.main:app --app-dir backend --reload --port 8000
```

In another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open <http://localhost:5173>. API docs: <http://localhost:8000/docs>.

## Demo mode and model integrations

The default `DEMO_MODE=1` returns deterministic fictional demo analyses and labels them as simulated. The local and cloud workflow buttons work without downloading a model, API keys, or network service. The demo data is fictional; submitted text is held in application memory for the request and is not logged or written to disk.

To connect real inference, install Ollama and verify the exact Gemma 4 E4B/E2B model tag with `ollama list` or the Ollama library. Set `LOCAL_MODEL` and `LOCAL_BASE_URL` in `.env`. For Jarvislabs Token Factory, set `CLOUD_BASE_URL=https://models.jarvislabs.net/v1`, add your secret as `JARVISLABS_API_KEY`, and set `CLOUD_MODEL` to the exact model ID shown in your Jarvislabs account/catalog (the selected model ID is `gemma-4-26b-a4b-it`). Jarvislabs documents this base URL and recommends keeping the key in a server environment; this backend reads it server-side and never sends it to the browser. Set `DEMO_MODE=0` only after configuring both endpoints. The model adapter and schema validation are in `backend/app/llm.py`; deterministic rules always run after model output.

`DEBUG_LOG` defaults to `0`; this prototype does not log case text. Never use real patient data in the demo. Frontend demo translations remain in English until a configured model supplies the requested output language.

## Tests and build

```bash
cd backend
pytest -q
cd ../frontend
npm run build
```

## Three-minute demo

1. Introduce the privacy and connectivity problem. The badge identifies the app as a simulated Gemma 4 demo.
2. Load **Kabir · fever and vomiting**, analyze, and review the structured summary and referral.
3. Load **Dev · low oxygen rule override** and analyze. The SpO₂ rule forces red urgency even if the generated proposal is lower.
4. Select **Escalate to Gemma 4 26B A4B IT** to display a simulated side-by-side cloud second opinion. No cloud service is called in demo mode.
5. Point out that the referral includes the decision-support disclaimer.

## Safety and scope

No diagnosis, treatment, or dosage output is intended. Red-flag rules only maintain or raise urgency. Self-harm rule hits explicitly call for immediate human support. All patient examples are fictional. This prototype is not clinically validated and must not be used to make real care decisions.

## Environment Variables

### Backend Configuration (`.env`)
- `DEMO_MODE`: Set to `1` (default) for deterministic offline simulation without external dependencies. Set to `0` for live inference.
- `LOCAL_BASE_URL`: Local model endpoint (e.g. `http://localhost:11434/v1`).
- `LOCAL_MODEL`: Local model tag in Ollama.
- `CLOUD_BASE_URL`: Cloud provider endpoint (e.g. `https://models.jarvislabs.net/v1`).
- `JARVISLABS_API_KEY`: Cloud provider API token (kept strictly server-side).
- `CLOUD_MODEL`: Cloud served model identifier (`gemma-4-26b-a4b-it`).
- `CORS_ORIGINS`: Comma-separated list of allowed browser origins (defaults to local Vite dev and preview ports; wildcards disabled).
- `MAX_BODY_SIZE`: Maximum request payload size in bytes (defaults to `65536` / 64 KB; enforced on streaming bytes).
- `RATE_LIMIT_PER_MINUTE`: Sliding-window request ceiling per client IP (defaults to `60` rpm with automatic memory cleanup).
- `DEBUG_LOG`: Default `0`. Case text and model outputs are never written to disk or logs regardless of setting.

### Frontend Configuration (`frontend/.env`)
- `VITE_API_BASE_URL`: Public base URL for the backend API (leave blank when using the default Vite `/api` proxy).
- `VITE_HELPLINE_TEXT`: Public helpline and supervisor contact text displayed on the self-harm safety screen. Only shown if configured.
- **Security Notice**: Never put API keys (e.g. `JARVISLABS_API_KEY`) in `frontend/.env` or any `VITE_` variable; client-side environment variables are bundled into browser assets.

## Runtime Behavior & Hardening

### Live Fallback Behavior
In live mode (`DEMO_MODE=0`), if the model inference call fails, times out, or returns invalid schema data, the backend does **not** return the simulated mock result. Instead, it falls back to a deterministic rules-only evaluation:
- Urgency is derived solely from the deterministic safety rules.
- Urgency is floored at `yellow` (it can never be `green`).
- The response is explicitly tagged with `rules_only: true` and labelled `"AI unavailable - assess manually"`.
- The frontend displays an ambient `"AI unavailable - rules only"` alert banner across screens.

### Security and Privacy Hardening
- **Privacy-safe errors**: Pydantic validation and middleware errors return sanitized messages and never echo submitted case text or model outputs.
- **Payload limits**: Middleware limits chunked streaming bodies to prevent memory exhaustion attacks.
- **Rate limiting**: In-memory IP rate limiter cleans up stale timestamps to prevent unbounded memory growth and never logs request bodies on HTTP 429.
- **Security headers**: Strict HTTP security headers applied on all responses (`X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, CSP).
- **Log privacy**: Uvicorn access logging and application loggers are sanitized so that case text and model responses never reach server logs.

## Known Limitations

- **Keyword-based rules**: Deterministic red-flag rules rely on targeted clinical keywords and vitals thresholds. They do not parse complex linguistic negation and intentionally err on the side of caution (may raise urgency when a symptom is mentioned in a negated context).
- **Per-IP rate limiting**: Rate limiting tracks client IP from direct socket connection. If deployed behind a reverse proxy or load balancer, configure trusted reverse-proxy headers (e.g. `X-Forwarded-For`) to avoid grouping clinic clients.
- **Tailwind 3 Dev Dependencies**: 3 moderate dev-only npm advisories exist upstream via Tailwind CSS 3.x build toolchain; production builds remain secure.
- **Clinical validation**: MediMitra is a technology prototype and has not undergone formal clinical trials. Deterministic red-flag rules must be reviewed and validated by licensed medical officers before deployment beyond demonstration environments.
- **Helpline verification**: Emergency contact and helpline text must be explicitly configured and verified with local district health authorities (`VITE_HELPLINE_TEXT` / `SUPERVISOR_EMERGENCY_CONTACT`).
