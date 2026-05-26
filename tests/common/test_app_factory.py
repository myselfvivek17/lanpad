import re

import pytest
from fastapi.testclient import TestClient

from agents.common import auth, storage
from agents.common.app_factory import build_app


@pytest.fixture(autouse=True)
def isolate(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "_resolve_state_dir", lambda: tmp_path)
    monkeypatch.setattr("agents.common.lan_guard.is_lan_ip", lambda ip: True)
    auth._failed_attempts.clear()
    auth._locked_until.clear()
    yield


def _client(kind="laptop"):
    app = build_app(agent_name="test", agent_kind=kind, version="0.1.0")
    return TestClient(app)


def test_health_endpoint():
    r = _client().get("/api/health")
    assert r.status_code == 200
    body = r.json()
    assert body["name"] == "test"
    assert body["agent_kind"] == "laptop"
    assert body["version"] == "0.1.0"


def test_pair_flow():
    c = _client()
    storage.write_pairing_pin("424242")
    r = c.post("/api/pair", json={"pin": "424242", "device_name": "phone"})
    assert r.status_code == 200
    token = r.json()["token"]
    # Now an authenticated request must succeed:
    r = c.get("/api/auth/devices", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    devices = r.json()
    assert any(d["name"] == "phone" for d in devices)


def test_pair_wrong_pin_401():
    c = _client()
    storage.write_pairing_pin("424242")
    r = c.post("/api/pair", json={"pin": "000000", "device_name": "phone"})
    assert r.status_code == 401


def test_pair_rate_limit_429():
    c = _client()
    storage.write_pairing_pin("424242")
    for _ in range(5):
        c.post("/api/pair", json={"pin": "000000", "device_name": "p"})
    r = c.post("/api/pair", json={"pin": "424242", "device_name": "p"})
    assert r.status_code == 429
    assert "Retry-After" in r.headers


def test_auth_required_without_token():
    c = _client()
    r = c.get("/api/auth/devices")
    assert r.status_code == 401


def test_revoke_device():
    c = _client()
    storage.write_pairing_pin("424242")
    token = c.post("/api/pair", json={"pin": "424242", "device_name": "phone"}).json()["token"]
    dev_id = storage.list_tokens()[0]["id"]
    r = c.delete(f"/api/auth/devices/{dev_id}", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 204
    # Now the token is invalid:
    r = c.get("/api/auth/devices", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 401


def test_cors_preflight_allows_local_origin():
    c = _client()
    r = c.options(
        "/api/health",
        headers={
            "Origin": "http://laptop.local:8765",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert r.status_code == 200
    assert r.headers.get("access-control-allow-origin") == "http://laptop.local:8765"
