import time
from collections import defaultdict
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
from . import config
from .schemas import AnalyzeRequest, EscalateRequest
from .llm import call_model
from .red_flags import apply_red_flag_rules
from .fixtures import DEMO_PATIENTS

app = FastAPI(title="MediMitra", description="Offline-first triage support prototype")

# In-memory rate limiting tracker (client IP -> timestamps)
_rate_limits: dict[str, list[float]] = defaultdict(list)

def _check_rate_limit(client_ip: str) -> bool:
    now = time.time()
    cutoff = now - 60.0
    # Clean up empty or stale IPs to prevent unbounded memory growth
    if len(_rate_limits) > 500:
        stale_keys = [ip for ip, times in _rate_limits.items() if not times or times[-1] <= cutoff]
        for ip in stale_keys:
            _rate_limits.pop(ip, None)

    timestamps = [t for t in _rate_limits[client_ip] if t > cutoff]
    if len(timestamps) >= config.RATE_LIMIT_PER_MINUTE:
        _rate_limits[client_ip] = timestamps
        return False
    timestamps.append(now)
    _rate_limits[client_ip] = timestamps
    return True

# 1. Custom RequestValidationError handler that NEVER echoes submitted patient text
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    safe_errors = []
    for err in exc.errors():
        safe_errors.append({
            "loc": list(err.get("loc", [])),
            "msg": err.get("msg", "Invalid input"),
            "type": err.get("type", "value_error"),
        })
    return JSONResponse(
        status_code=422,
        content={"detail": safe_errors},
    )

# 2. Generic exception handler that prevents leaking tracebacks or case text
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    if config.DEBUG_LOG:
        import logging
        logging.getLogger("uvicorn.error").error("Unhandled exception: %s", type(exc).__name__)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error. Please try again."},
    )

# 3. Security, body size limit, and rate limit middleware
@app.middleware("http")
async def security_and_limits_middleware(request: Request, call_next):
    # Check Content-Length header first if provided
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > config.MAX_BODY_SIZE:
                return JSONResponse(
                    status_code=413,
                    content={"detail": "Request payload too large."},
                )
        except (ValueError, TypeError):
            pass

    # Read and buffer request stream to enforce size limits on actual bytes (including chunked requests)
    total_bytes = 0
    chunks = []
    async for chunk in request.stream():
        total_bytes += len(chunk)
        if total_bytes > config.MAX_BODY_SIZE:
            return JSONResponse(
                status_code=413,
                content={"detail": "Request payload too large."},
            )
        chunks.append(chunk)

    body = b"".join(chunks)
    request._body = body
    async def receive():
        return {"type": "http.request", "body": body, "more_body": False}
    request._receive = receive

    # In-memory rate limit on triage endpoints (does not log request bodies)
    if request.url.path in ("/api/analyze", "/api/escalate"):
        client_ip = request.client.host if request.client else "127.0.0.1"
        if not _check_rate_limit(client_ip):
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please wait a moment."},
            )

    response: Response = await call_next(request)

    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "no-referrer"

    return response

# 4. CORS configuration strictly restricted to configured origins and allowed headers/methods
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"],
    allow_credentials=False,
)

@app.get("/api/status")
async def status():
    local_configured = bool(config.LOCAL_BASE_URL and config.LOCAL_MODEL)
    cloud_configured = bool(config.CLOUD_BASE_URL and config.CLOUD_API_KEY and config.CLOUD_MODEL)

    if config.DEMO_MODE:
        local_model = config.LOCAL_MODEL or "Simulated Gemma 4 E4B demo"
        cloud_model = config.CLOUD_MODEL or "gemma-4-26b-a4b-it (simulated demo)"
    else:
        local_model = config.LOCAL_MODEL or "Not configured"
        cloud_model = config.CLOUD_MODEL or "Not configured"

    return {
        "demo_mode": bool(config.DEMO_MODE),
        "local_configured": local_configured,
        "cloud_configured": cloud_configured,
        "local_model": local_model,
        "cloud_model": cloud_model,
    }

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
