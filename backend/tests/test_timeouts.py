import os
from unittest import mock
from app.config import _safe_float

def test_safe_float_fallback():
    default = 120.0
    assert _safe_float(None, default) == 120.0
    assert _safe_float("", default) == 120.0
    assert _safe_float("   ", default) == 120.0
    assert _safe_float("not-a-number", default) == 120.0
    assert _safe_float("-10", default) == 120.0
    assert _safe_float("0", default) == 120.0
    assert _safe_float("-0.0", default) == 120.0
    assert _safe_float("nan", default) == 120.0
    assert _safe_float("NaN", default) == 120.0
    assert _safe_float("inf", default) == 120.0
    assert _safe_float("-inf", default) == 120.0

def test_safe_float_valid():
    default = 120.0
    assert _safe_float("45.5", default) == 45.5
    assert _safe_float("60", default) == 60.0
    assert _safe_float(" 15.0 ", default) == 15.0

def test_timeout_defaults_in_config():
    # Test that default values are 120.0 and 60.0 when env vars are absent
    with mock.patch("dotenv.load_dotenv"):
        with mock.patch.dict(os.environ, {}, clear=True):
            import importlib
            import app.config as conf
            importlib.reload(conf)
            assert conf.LOCAL_TIMEOUT_SECONDS == 120.0
            assert conf.CLOUD_TIMEOUT_SECONDS == 60.0

def test_timeout_bad_env_falls_back_to_defaults():
    with mock.patch("dotenv.load_dotenv"):
        with mock.patch.dict(
            os.environ,
            {"LOCAL_TIMEOUT_SECONDS": "invalid", "CLOUD_TIMEOUT_SECONDS": "-5"},
            clear=True,
        ):
            import importlib
            import app.config as conf
            importlib.reload(conf)
            assert conf.LOCAL_TIMEOUT_SECONDS == 120.0
            assert conf.CLOUD_TIMEOUT_SECONDS == 60.0
