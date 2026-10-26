import pytest
import httpx
from app.main import app, _rate_limits
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

def test_cors_origins_never_wildcard():
    assert "*" not in config.CORS_ORIGINS
    assert "http://localhost:5173" in config.CORS_ORIGINS
    assert "http://127.0.0.1:5173" in config.CORS_ORIGINS
