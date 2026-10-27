"""Replaceable model adapter. Demo responses are deterministic and never claim inference."""
import json
import re
from openai import AsyncOpenAI
from . import config
from .schemas import AnalyzeRequest, TriageResult
from .prompts import SYSTEM_PROMPT, build_user_prompt

DISCLAIMER = "Decision-support prototype. Not a diagnostic tool. Mock data only."

def clean_llm_output(raw: str) -> dict:
    text = (raw or "").strip()
    # Strip reasoning tags (e.g. <think>...</think>)
    text = re.sub(r"<think>[\s\S]*?</think>", "", text).strip()
    # Strip markdown code fences (```json ... ``` or ``` ... ```)
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text, re.I)
    if match:
        text = match.group(1).strip()
    # Extract outer JSON object if wrapped in extra text
    if not (text.startswith("{") and text.endswith("}")):
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            text = text[start : end + 1]

    data = json.loads(text)
    if not isinstance(data, dict):
        raise ValueError("Model output is not a JSON object")

    # Normalize urgency to lowercase and accept RED/YELLOW/GREEN
    raw_urgency = str(data.get("urgency", "")).strip().lower()
    if raw_urgency in ("green", "yellow", "red"):
        data["urgency"] = raw_urgency
    else:
        data["urgency"] = "yellow"

    # Trim suggested_questions to the first 3 instead of failing validation
    questions = data.get("suggested_questions")
    if isinstance(questions, list):
        data["suggested_questions"] = [str(q).strip() for q in questions if str(q).strip()][:3]
    else:
        data["suggested_questions"] = ["When did this start?", "Has it changed or worsened?", "Are there other symptoms?"]

    # Ensure required fields exist with sensible fallbacks
    if "duration" not in data:
        data["duration"] = None
    if not data.get("chief_complaint"):
        data["chief_complaint"] = "Not provided"
    if not isinstance(data.get("symptoms"), list):
        data["symptoms"] = []
    if not data.get("urgency_reason"):
        data["urgency_reason"] = "Clinical assessment advised."
    if not data.get("summary_plain"):
        data["summary_plain"] = "Case summary for clinical review."
    if not data.get("referral_note"):
        data["referral_note"] = f"Referral note: Please assess the patient. Urgency: {data['urgency']}. {DISCLAIMER}"
    if not data.get("disclaimer"):
        data["disclaimer"] = DISCLAIMER
    if not isinstance(data.get("red_flags"), list):
        data["red_flags"] = []
    if not isinstance(data.get("rule_reasons"), list):
        data["rule_reasons"] = []

    return data

def mock_result(req: AnalyzeRequest, source: str = "local") -> TriageResult:
    text = req.text.strip()
    lower = text.lower()
    urgency = "red" if any(k in lower for k in ("chest pain", "chest tightness", "bleeding", "can't breathe", "seizure", "unconscious")) else "yellow" if any(k in lower for k in ("fever", "vomit", "pain", "cough")) else "green"
    symptoms = [s.strip().capitalize() for s in re.split(r"[,.;]|\band\b", text) if s.strip()][:6]
    duration = next((m.group(0) for m in [re.search(r"\b(?:for|since)\s+[^,.]+", text, re.I)] if m), None)
    reason = {"green": "No urgent warning is identified in the information provided.", "yellow": "The reported symptoms should be assessed by a clinician soon.", "red": "The reported information may need immediate clinical assessment."}[urgency]
    prefix = "SIMULATED DEMO ANALYSIS — no AI model was called. "
    return TriageResult(
        chief_complaint=(text[:100] or "Not provided"),
        symptoms=symptoms,
        duration=duration,
        red_flags=[],
        urgency=urgency,
        urgency_reason=prefix + reason,
        summary_plain=prefix + f"Reported: {text}. Current urgency: {urgency}.",
        referral_note=f"Referral (demo): Please assess the reported concern: {text}. Urgency: {urgency}. {DISCLAIMER}",
        suggested_questions=["When did this start?", "Has it changed or worsened?", "Are there other symptoms?"],
        source=source,
        rules_only=False,
        disclaimer=DISCLAIMER,
    )

def rules_only_result(req: AnalyzeRequest, source: str = "local") -> TriageResult:
    text = req.text.strip()
    symptoms = [s.strip().capitalize() for s in re.split(r"[,.;]|\band\b", text) if s.strip()][:6]
    duration = next((m.group(0) for m in [re.search(r"\b(?:for|since)\s+[^,.]+", text, re.I)] if m), None)
    prefix = "AI unavailable - assess manually. "
    reason = "AI model is unavailable or returned invalid output. Urgency determined by safety rules only. Please assess manually."
    return TriageResult(
        chief_complaint=(text[:100] or "Not provided"),
        symptoms=symptoms,
        duration=duration,
        red_flags=[],
        urgency="yellow",  # Fallback must never be green
        urgency_reason=prefix + reason,
        summary_plain=f"{prefix}Reported: {text}.",
        referral_note=f"Referral (manual triage): Please assess reported concern: {text}. Urgency: YELLOW. {DISCLAIMER}",
        suggested_questions=["When did this start?", "Has it changed or worsened?", "Are there other symptoms?"],
        source=source,
        rules_only=True,
        disclaimer=DISCLAIMER,
    )

async def call_model(req: AnalyzeRequest, cloud: bool = False) -> TriageResult:
    if config.DEMO_MODE:
        return mock_result(req, "cloud" if cloud else "local")

    base = config.CLOUD_BASE_URL if cloud else config.LOCAL_BASE_URL
    key = config.CLOUD_API_KEY if cloud else config.LOCAL_API_KEY
    model = config.CLOUD_MODEL if cloud else config.LOCAL_MODEL
    timeout = config.CLOUD_TIMEOUT_SECONDS if cloud else config.LOCAL_TIMEOUT_SECONDS

    if cloud:
        if not (base and key and model):
            raise RuntimeError("Model endpoint is not configured")
    else:
        if not (base and model):
            raise RuntimeError("Model endpoint is not configured")

    client = AsyncOpenAI(base_url=base, api_key=key or "ollama", timeout=timeout)
    user_prompt = build_user_prompt(req)

    try:
        response = await client.chat.completions.create(
            model=model,
            temperature=0.2,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
        )
    except Exception:
        # Retry without response_format if endpoint does not support json_object mode
        response = await client.chat.completions.create(
            model=model,
            temperature=0.2,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_prompt},
            ],
        )

    raw_content = response.choices[0].message.content or ""
    payload = clean_llm_output(raw_content)

    from .output_filter import contains_treatment_or_dosage, logger as filter_logger
    if contains_treatment_or_dosage(payload):
        filter_logger.warning("model output rejected by filter")
        return rules_only_result(req, source="cloud" if cloud else "local")

    result = TriageResult.model_validate(payload).model_copy(update={"source": "cloud" if cloud else "local", "rules_only": False})
    if contains_treatment_or_dosage(result):
        filter_logger.warning("model output rejected by filter")
        return rules_only_result(req, source="cloud" if cloud else "local")

    return result
