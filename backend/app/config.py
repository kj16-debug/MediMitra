import os
from dotenv import load_dotenv

load_dotenv()

def _safe_float(val: str | None, default: float) -> float:
    if val is None or not str(val).strip():
        return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default

def _safe_int(val: str | None, default: int) -> int:
    if val is None or not str(val).strip():
        return default
    try:
        return int(val)
    except (ValueError, TypeError):
        return default

LOCAL_BASE_URL = os.getenv("LOCAL_BASE_URL", "http://localhost:11434/v1")
LOCAL_API_KEY = os.getenv("LOCAL_API_KEY", "ollama")
LOCAL_MODEL = os.getenv("LOCAL_MODEL", "")
CLOUD_BASE_URL = os.getenv("CLOUD_BASE_URL", "")
CLOUD_API_KEY = os.getenv("JARVISLABS_API_KEY", os.getenv("CLOUD_API_KEY", ""))
CLOUD_MODEL = os.getenv("CLOUD_MODEL", "")
LOCAL_TIMEOUT_SECONDS = _safe_float(os.getenv("LOCAL_TIMEOUT_SECONDS"), 60.0)
CLOUD_TIMEOUT_SECONDS = _safe_float(os.getenv("CLOUD_TIMEOUT_SECONDS"), 20.0)
DEBUG_LOG = os.getenv("DEBUG_LOG", "0") == "1"
DEMO_MODE = os.getenv("DEMO_MODE", "1") == "1"

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
]
_raw_origins = os.getenv("CORS_ORIGINS", "")
CORS_ORIGINS = [o.strip() for o in _raw_origins.split(",") if o.strip()] if _raw_origins.strip() else DEFAULT_CORS_ORIGINS
CORS_ORIGINS = [o for o in CORS_ORIGINS if o != "*"]
if not CORS_ORIGINS:
    CORS_ORIGINS = DEFAULT_CORS_ORIGINS

MAX_BODY_SIZE = _safe_int(os.getenv("MAX_BODY_SIZE"), 1_000_000)
RATE_LIMIT_PER_MINUTE = _safe_int(os.getenv("RATE_LIMIT_PER_MINUTE"), 60)
