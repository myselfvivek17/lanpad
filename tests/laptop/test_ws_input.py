from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient

from agents.common import auth, storage
from agents.common.app_factory import build_app
from agents.laptop import ws_input


@pytest.fixture
def setup(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "_resolve_state_dir", lambda: tmp_path)
    monkeypatch.setattr("agents.common.lan_guard.is_lan_ip", lambda ip: True)
    auth._failed_attempts.clear()
    auth._locked_until.clear()
    app = build_app(agent_name="laptop-test", agent_kind="laptop", version="0.1.0")
    ws_input.attach(app)
    client = TestClient(app)
    storage.write_pairing_pin("424242")
    token = client.post("/api/pair", json={"pin": "424242", "device_name": "p"}).json()["token"]
    return client, token


def test_ws_rejects_missing_token(setup):
    client, _ = setup
    with pytest.raises(Exception):
        with client.websocket_connect("/ws/input"):
            pass


def test_ws_accepts_good_token_and_dispatches(setup):
    client, token = setup
    with patch("agents.laptop.ws_input.input_win.move_rel") as move, \
         patch("agents.laptop.ws_input.input_win.scroll") as scroll, \
         patch("agents.laptop.ws_input.input_win.mouse_down") as down, \
         patch("agents.laptop.ws_input.input_win.mouse_up") as up:
        with client.websocket_connect(f"/ws/input?t={token}") as ws:
            ws.send_json({"t": "move", "dx": 3, "dy": -2})
            ws.send_json({"t": "scroll", "dx": 0, "dy": 5})
            ws.send_json({"t": "down", "btn": "left"})
            ws.send_json({"t": "up", "btn": "left"})
            ws.send_json({"t": "garbage"})  # should be ignored, not crash
    move.assert_called_once_with(3.0, -2.0)
    scroll.assert_called_once_with(0, 5)
    down.assert_called_once_with("left")
    up.assert_called_once_with("left")
