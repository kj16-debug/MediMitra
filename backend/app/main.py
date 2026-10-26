from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from . import config
from .schemas import AnalyzeRequest, EscalateRequest
from .llm import call_model
from .red_flags import apply_red_flag_rules
from .fixtures import DEMO_PATIENTS

app = FastAPI(title="MediMitra", description="Offline-first triage support prototype")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"], allow_methods=["*"], allow_headers=["*"])

@app.get("/api/status")
async def status():
    if config.DEMO_MODE:
        return {"local_ok": True, "cloud_ok": True, "local_model": "Simulated Gemma 4 E4B demo", "cloud_model": f"{config.CLOUD_MODEL or 'Gemma 4 26B A4B IT'} (simulated demo)", "simulated": True}
    async def reachable(base: str, key: str) -> bool:
        if not base:
            return False
        try:
            async with httpx.AsyncClient(timeout=3) as client:
                response = await client.get(base.rstrip("/") + "/models", headers={"Authorization": f"Bearer {key}"} if key else {})
                return response.is_success
        except httpx.HTTPError:
            return False
    local_ok, cloud_ok = await __import__("asyncio").gather(
        reachable(config.LOCAL_BASE_URL, config.LOCAL_API_KEY),
        reachable(config.CLOUD_BASE_URL, config.CLOUD_API_KEY),
    )
    return {"local_ok": local_ok, "cloud_ok": cloud_ok and bool(config.CLOUD_MODEL), "local_model": config.LOCAL_MODEL or "Not configured", "cloud_model": config.CLOUD_MODEL or "Not configured", "simulated": False}

@app.post("/api/analyze")
async def analyze(req: AnalyzeRequest):
    if config.DEMO_MODE:
        result = await call_model(req)
        return apply_red_flag_rules(req, result)

    try:
        result = await call_model(req)
    except Exception:
        from .llm import rules_only_result
        result = rules_only_result(req, source="local")

    return apply_red_flag_rules(req, result)

@app.post("/api/escalate")
async def escalate(body: EscalateRequest):
    if not config.DEMO_MODE and not (config.CLOUD_BASE_URL and config.CLOUD_API_KEY and config.CLOUD_MODEL):
        raise HTTPException(status_code=503, detail="Cloud escalation is not configured. Your local result is still available.")
    try:
        result = await call_model(body.request, cloud=True)
        if config.DEMO_MODE:
            result.urgency_reason = "SIMULATED SECOND OPINION — no cloud service was called. " + result.urgency_reason
        return apply_red_flag_rules(body.request, result)
    except Exception:
        raise HTTPException(status_code=503, detail="Cloud escalation is unavailable. Your local result is still available.")

@app.get("/api/demo-patients")
async def demo_patients():
    return [{"name": item["name"], **item["request"].model_dump()} for item in DEMO_PATIENTS]
