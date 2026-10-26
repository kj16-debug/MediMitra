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
