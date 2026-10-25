"""Replaceable model adapter. Demo responses are deterministic and never claim inference."""
import re
from openai import AsyncOpenAI
from . import config
from .schemas import AnalyzeRequest, TriageResult
from .prompts import SYSTEM_PROMPT

DISCLAIMER = "Decision-support prototype. Not a diagnostic tool. Mock data only."

def mock_result(req: AnalyzeRequest, source: str = "local") -> TriageResult:
    text = req.text.strip()
    lower = text.lower()
    urgency = "red" if any(k in lower for k in ("chest pain", "chest tightness", "bleeding", "can't breathe", "seizure", "unconscious")) else "yellow" if any(k in lower for k in ("fever", "vomit", "pain", "cough")) else "green"
    symptoms = [s.strip().capitalize() for s in re.split(r"[,.;]|\band\b", text) if s.strip()][:6]
    duration = next((m.group(0) for m in [re.search(r"\b(?:for|since)\s+[^,.]+", text, re.I)] if m), None)
    reason = {"green": "No urgent warning is identified in the information provided.", "yellow": "The reported symptoms should be assessed by a clinician soon.", "red": "The reported information may need immediate clinical assessment."}[urgency]
    prefix = "SIMULATED DEMO ANALYSIS — no AI model was called. "
    return TriageResult(chief_complaint=(text[:100] or "Not provided"), symptoms=symptoms, duration=duration, red_flags=[], urgency=urgency, urgency_reason=prefix + reason, summary_plain=prefix + f"Reported: {text}. Current urgency: {urgency}.", referral_note=f"Referral (demo): Please assess the reported concern: {text}. Urgency: {urgency}. {DISCLAIMER}", suggested_questions=["When did this start?", "Has it changed or worsened?", "Are there other symptoms?"], source=source, disclaimer=DISCLAIMER)

async def call_model(req: AnalyzeRequest, cloud: bool = False) -> TriageResult:
    base = config.CLOUD_BASE_URL if cloud else config.LOCAL_BASE_URL
    key = config.CLOUD_API_KEY if cloud else config.LOCAL_API_KEY
    model = config.CLOUD_MODEL if cloud else config.LOCAL_MODEL
    if config.DEMO_MODE or not (base and model and (not cloud or key)):
        return mock_result(req, "cloud" if cloud else "local")
    client = AsyncOpenAI(base_url=base, api_key=key or "ollama", timeout=config.CLOUD_TIMEOUT_SECONDS if cloud else config.LOCAL_TIMEOUT_SECONDS)
    prompt = f"Input: {req.model_dump_json()}\nOutput language: {req.output_language}"
    response = await client.chat.completions.create(model=model, temperature=0.2, response_format={"type": "json_object"}, messages=[{"role": "system", "content": SYSTEM_PROMPT}, {"role": "user", "content": prompt}])
    import json
    payload = json.loads(response.choices[0].message.content or "")
    return TriageResult.model_validate(payload).model_copy(update={"source": "cloud" if cloud else "local"})
