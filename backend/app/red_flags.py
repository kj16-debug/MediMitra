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
    if v and v.spo2_pct is not None and v.spo2_pct < 92: hits.append("Low oxygen level (SpO₂ below 92%)")
    if req.pregnant and re.search(r"\b(bleeding|severe headache|reduced baby movement)\b", text): hits.append("Pregnancy danger sign")
    if req.age_years is not None and req.age_years < 0.25 and v and v.temp_c is not None and v.temp_c >= 38: hits.append("Fever in an infant under 3 months")
    if v and v.systolic_bp is not None and v.systolic_bp < 90: hits.append("Low systolic blood pressure")
    red_hits = len(hits) > 0
    yellow_hits = bool(v and ((v.temp_c is not None and v.temp_c >= 39.5) or (v.pulse_bpm is not None and v.pulse_bpm > 130)))
    reasons = list(dict.fromkeys(hits))
    if yellow_hits and not reasons:
        if v.temp_c is not None and v.temp_c >= 39.5: reasons.append("High fever (39.5°C or above)")
        if v.pulse_bpm is not None and v.pulse_bpm > 130: reasons.append("Very high pulse (above 130 bpm)")
    level = "red" if red_hits else "yellow" if yellow_hits else result.urgency
    # Safety invariant: rules can raise urgency, never lower it.
    if RANK[result.urgency] > RANK[level]: level = result.urgency
    urgency_raised = RANK[level] > RANK[proposed_urgency]
    result.urgency = level
    result.red_flags = list(dict.fromkeys(result.red_flags + reasons))
    result.rule_reasons = reasons
    if urgency_raised:
        override = f"Safety rules raised urgency to {level.upper()} because: {'; '.join(reasons)}."
        urgency_label = re.compile(r"\b(?:final\s+|current\s+)?urgency\s*(?::|is)\s*(green|yellow|red)\b", re.I)
        normalize = lambda value: urgency_label.sub(f"Final urgency: {level.upper()}", value)
        result.urgency_reason = override
        result.summary_plain = f"{override} {normalize(result.summary_plain)}"
        result.referral_note = f"{override} {normalize(result.referral_note)}"
    return result
