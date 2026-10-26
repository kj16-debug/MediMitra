import logging
import pytest
import httpx
from app.main import app, _rate_limits, _check_rate_limit
from app import config

@pytest.mark.anyio
async def test_validation_error_never_echoes_patient_text():
    sensitive_text = "CONFIDENTIAL_PATIENT_SYMPTOM_DATA_DO_NOT_LEAK"
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Invalid age_years (out of range) alongside sensitive text
        resp = await client.post("/api/analyze", json={
            "text": sensitive_text,
            "age_years": 999
        })
        assert resp.status_code == 422
        # Ensure the sensitive patient text is NEVER reflected back in the 422 validation response
        assert sensitive_text not in resp.text
        data = resp.json()
        assert "detail" in data
        for err in data["detail"]:
            assert "input" not in err

@pytest.mark.anyio
async def test_case_text_never_logged_or_echoed_in_errors(caplog):
    unique_marker = "UNIQUE_CASE_TEXT_SECURITY_MARKER_884912"
    with caplog.at_level(logging.DEBUG):
        async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
            # 1. Success case
            success_resp = await client.post("/api/analyze", json={"text": f"Patient symptoms: {unique_marker}"})
            assert success_resp.status_code == 200

            # 2. Failure case (422 validation error)
            fail_resp = await client.post("/api/analyze", json={
                "text": f"Patient symptoms: {unique_marker}",
                "age_years": 999
            })
            assert fail_resp.status_code == 422
            assert unique_marker not in fail_resp.text

    # Assert marker NEVER appears in any captured server logs
    for record in caplog.records:
        assert unique_marker not in record.getMessage()
        if record.exc_info:
            assert unique_marker not in str(record.exc_info)

@pytest.mark.anyio
async def test_security_headers_present():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.get("/api/status")
        assert resp.status_code == 200
        assert resp.headers.get("x-content-type-options") == "nosniff"
        assert resp.headers.get("x-frame-options") == "DENY"
        assert resp.headers.get("referrer-policy") == "no-referrer"

@pytest.mark.anyio
async def test_request_body_size_limit():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # Send oversized content-length header
        resp = await client.post(
            "/api/analyze",
            content=b'{"text": "Short text"}',
            headers={"Content-Length": str(config.MAX_BODY_SIZE + 5000), "Content-Type": "application/json"}
        )
        assert resp.status_code == 413
        assert "too large" in resp.text.lower()

@pytest.mark.anyio
async def test_chunked_body_size_limit(monkeypatch):
    # Set a small test max body size
    monkeypatch.setattr(config, "MAX_BODY_SIZE", 500)
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        async def chunk_gen():
            yield b"A" * 300
            yield b"B" * 300  # Total 600 > 500

        resp = await client.post(
            "/api/analyze",
            content=chunk_gen(),
            headers={"Content-Type": "application/json"}
        )
        assert resp.status_code == 413
        assert "too large" in resp.text.lower()

@pytest.mark.anyio
async def test_rate_limiting(monkeypatch):
    monkeypatch.setattr(config, "RATE_LIMIT_PER_MINUTE", 3)
    _rate_limits.clear()

    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        for i in range(3):
            resp = await client.post("/api/analyze", json={"text": f"Patient visit {i}"})
            assert resp.status_code == 200

        # 4th request must be rate limited
        blocked_resp = await client.post("/api/analyze", json={"text": "Patient visit 4"})
        assert blocked_resp.status_code == 429
        assert "Rate limit exceeded" in blocked_resp.text

    _rate_limits.clear()

def test_rate_limiter_stale_cleanup():
    _rate_limits.clear()
    # Add 550 dummy stale IPs with old timestamps
    for i in range(550):
        _rate_limits[f"10.0.0.{i}"] = [100.0]  # Very old timestamp
    assert len(_rate_limits) == 550
    # Checking an active IP triggers cleanup of stale keys
    _check_rate_limit("192.168.1.1")
    assert len(_rate_limits) <= 2
    _rate_limits.clear()

def test_cors_origins_never_wildcard():
    assert "*" not in config.CORS_ORIGINS
    assert "http://localhost:5173" in config.CORS_ORIGINS
    assert "http://127.0.0.1:5173" in config.CORS_ORIGINS

@pytest.mark.anyio
async def test_cors_preflight_and_credentials():
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        resp = await client.options(
            "/api/analyze",
            headers={
                "Origin": "http://localhost:5173",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "Content-Type"
            }
        )
        assert resp.status_code == 200
        assert resp.headers.get("access-control-allow-origin") == "http://localhost:5173"
        # allow_credentials is False, so header must not be 'true'
        assert resp.headers.get("access-control-allow-credentials") != "true"
