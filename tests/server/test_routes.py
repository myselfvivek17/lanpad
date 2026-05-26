from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from agents.common import auth, storage
from agents.common.app_factory import build_app
from agents.server import routes_power, routes_update


@pytest.fixture
def authed(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "_resolve_state_dir", lambda: tmp_path)
    monkeypatch.setattr("agents.common.lan_guard.is_lan_ip", lambda ip: True)
    auth._failed_attempts.clear()
    auth._locked_until.clear()
    app = build_app(agent_name="srv", agent_kind="server", version="0.1.0")
    routes_power.attach(app)
    routes_update.attach(app)
    client = TestClient(app)
    storage.write_pairing_pin("424242")
    token = client.post("/api/pair", json={"pin": "424242", "device_name": "p"}).json()["token"]
    return client, {"Authorization": f"Bearer {token}"}


def test_server_shutdown(authed):
    c, h = authed
    with patch("agents.server.routes_power.power_linux.shutdown") as fn:
        r = c.post("/api/power/shutdown", json={"delay_seconds": 30}, headers=h)
    assert r.status_code == 200
    fn.assert_called_once_with(delay_seconds=30)


def test_update_start(authed):
    c, h = authed
    with patch("agents.server.routes_update.update_linux.start_update",
               return_value={"job_id": "j1", "status": "running"}):
        r = c.post("/api/system/update", headers=h)
    assert r.status_code == 200
    assert r.json()["job_id"] == "j1"


def test_update_status(authed):
    c, h = authed
    with patch("agents.server.routes_update.update_linux.get_status",
               return_value={"status": "completed", "log_tail": "done"}):
        r = c.get("/api/system/update/j1", headers=h)
    assert r.status_code == 200
    assert r.json()["status"] == "completed"
