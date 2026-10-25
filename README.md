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
