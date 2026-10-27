import re
from .schemas import AnalyzeRequest, TriageResult

RULES = [
    ("chest_pain", "Chest pain or pressure", "red", r"\b(chest pain|pressure in chest|tightness in chest|chest tightness)\b"),
    ("breathing", "Breathing difficulty", "red", r"\b(difficulty breathing|can't breathe|cannot breathe|short of breath|breathless)\b"),
    ("unconscious_seizure", "Unconsciousness or seizure", "red", r"\b(unconscious|fainted and not waking|seizure|fits)\b"),
    ("stroke", "Possible stroke signs", "red", r"\b(face drooping|slurred speech|sudden weakness one side)\b"),
    ("bleeding", "Severe bleeding", "red", r"\b(heavy bleeding|bleeding won't stop|vomiting blood)\b"),
    ("self_harm", "Self-harm statement needs immediate human support", "red", r"\b(want to die|kill myself|end my life)\b"),
]
RANK = {"green": 0, "yellow": 1, "red": 2}

def apply_red_flag_rules(req: AnalyzeRequest, result: TriageResult) -> TriageResult:
    proposed_urgency = result.urgency
    text = req.text.lower()
    hits: list[str] = []
    for _id, description, _level, pattern in RULES:
        if re.search(pattern, text):
            hits.append(description)
    v = req.vitals
    if v and v.spo2_pct is not None and v.spo2_pct < 92:
        hits.append("Low oxygen level (SpO₂ below 92%)")
    if req.pregnant and re.search(r"\b(bleeding|severe headache|reduced baby movement)\b", text):
        hits.append("Pregnancy danger sign")
    if req.age_years is not None and req.age_years < 0.25 and v and v.temp_c is not None and v.temp_c >= 38:
        hits.append("Fever in an infant under 3 months")
    if v and v.systolic_bp is not None and v.systolic_bp < 90:
        hits.append("Low systolic blood pressure")

    red_hits = len(hits) > 0
    fever_vomiting = bool(
        (re.search(r"\bfever\b", text) or (v and v.temp_c is not None and v.temp_c >= 38.0))
        and re.search(r"\b(vomit|vomiting)\b", text)
    )
    yellow_hits = bool(
        (v and ((v.temp_c is not None and v.temp_c >= 39.5) or (v.pulse_bpm is not None and v.pulse_bpm > 130)))
        or fever_vomiting
    )

    reasons = list(dict.fromkeys(hits))
    if yellow_hits and not red_hits:
        if v and v.temp_c is not None and v.temp_c >= 39.5:
            reasons.append("High fever (39.5°C or above)")
        if v and v.pulse_bpm is not None and v.pulse_bpm > 130:
            reasons.append("Very high pulse (above 130 bpm)")
        if fever_vomiting and "Fever with vomiting requires clinical assessment" not in reasons:
            reasons.append("Fever with vomiting requires clinical assessment")

    level = "red" if red_hits else "yellow" if yellow_hits else result.urgency
    # Safety invariant: rules can only maintain or raise urgency, never lower it.
    if RANK[result.urgency] > RANK[level]:
        level = result.urgency
    urgency_raised = RANK[level] > RANK[proposed_urgency]
    result.urgency = level
    result.red_flags = list(dict.fromkeys(result.red_flags + reasons))
    result.rule_reasons = reasons

    # Strip existing urgency mentions and disclaimer to build in code without contradiction
    clean_referral = re.sub(r"\b(?:final\s+|current\s+)?urgency\s*(?::|is)\s*(?:green|yellow|red)\b\.?", "", result.referral_note, flags=re.I).strip()
    if result.disclaimer:
        clean_referral = clean_referral.replace(result.disclaimer, "").strip()
    clean_referral = clean_referral.replace("Decision-support prototype. Not a diagnostic tool. Mock data only.", "").replace("Decision support only. Not a diagnosis.", "").strip()

    disclaimer_text = "Decision support only. Not a diagnosis."
    result.disclaimer = disclaimer_text

    if urgency_raised:
        override = f"Safety rules raised urgency to {level.upper()} because: {'; '.join(reasons)}."
        clean_summary = re.sub(r"\b(?:final\s+|current\s+)?urgency\s*(?::|is)\s*(?:green|yellow|red)\b\.?", "", result.summary_plain, flags=re.I).strip()
        result.urgency_reason = override
        result.summary_plain = f"{override} {clean_summary} Final urgency: {level.upper()}.".strip()
        result.referral_note = f"{override} {clean_referral} Final urgency: {level.upper()}. {disclaimer_text}".strip()
    else:
        result.referral_note = f"{clean_referral} Final urgency: {level.upper()}. {disclaimer_text}".strip()

    # Self-harm safety rule must always explicitly call for immediate human support
    if any("Self-harm" in r for r in reasons):
        support_call = "IMMEDIATE HUMAN SUPPORT REQUIRED: Connect with emergency care or a crisis worker immediately."
        if support_call not in result.referral_note:
            result.referral_note = f"{support_call} {result.referral_note}"
        if support_call not in result.summary_plain:
            result.summary_plain = f"{support_call} {result.summary_plain}"

    return result
