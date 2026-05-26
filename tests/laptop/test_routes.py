from unittest.mock import patch

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from agents.common import auth, storage
from agents.common.app_factory import build_app
from agents.laptop import routes_input, routes_media, routes_power


@pytest.fixture
def authed(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "_resolve_state_dir", lambda: tmp_path)
    monkeypatch.setattr("agents.common.lan_guard.is_lan_ip", lambda ip: True)
    auth._failed_attempts.clear()
    auth._locked_until.clear()
    app = build_app(agent_name="laptop-test", agent_kind="laptop", version="0.1.0")
    routes_power.attach(app)
    routes_media.attach(app)
    routes_input.attach(app)
    client = TestClient(app)
    storage.write_pairing_pin("424242")
    token = client.post("/api/pair", json={"pin": "424242", "device_name": "p"}).json()["token"]
    return client, {"Authorization": f"Bearer {token}"}


def test_power_shutdown(authed):
    c, h = authed
    with patch("agents.laptop.routes_power.power_win.shutdown") as fn:
        r = c.post("/api/power/shutdown", json={"delay_seconds": 7}, headers=h)
    assert r.status_code == 200
    fn.assert_called_once_with(delay_seconds=7)


def test_power_lock(authed):
    c, h = authed
    with patch("agents.laptop.routes_power.power_win.lock") as fn:
        r = c.post("/api/power/lock", headers=h)
    assert r.status_code == 200
    fn.assert_called_once()


def test_power_sleep(authed):
    c, h = authed
    with patch("agents.laptop.routes_power.power_win.sleep") as fn:
        r = c.post("/api/power/sleep", headers=h)
    assert r.status_code == 200
    fn.assert_called_once()


def test_media_playpause(authed):
    c, h = authed
    with patch("agents.laptop.routes_media.media_win.playpause") as fn:
        r = c.post("/api/media/playpause", headers=h)
    assert r.status_code == 200
    fn.assert_called_once()


def test_media_volume(authed):
    c, h = authed
    with patch("agents.laptop.routes_media.media_win.volume") as fn:
        r = c.post("/api/media/volume", json={"action": "up"}, headers=h)
    assert r.status_code == 200
    fn.assert_called_once_with("up")


def test_media_volume_invalid(authed):
    c, h = authed
    r = c.post("/api/media/volume", json={"action": "loud"}, headers=h)
    assert r.status_code == 400


def test_keyboard_text(authed):
    c, h = authed
    with patch("agents.laptop.routes_input.input_win.type_text") as fn:
        r = c.post("/api/keyboard/text", json={"text": "hi"}, headers=h)
    assert r.status_code == 200
    fn.assert_called_once_with("hi")


def test_keyboard_shortcut(authed):
    c, h = authed
    with patch("agents.laptop.routes_input.input_win.shortcut") as fn:
        r = c.post("/api/keyboard/shortcut", json={"keys": ["ctrl", "c"]}, headers=h)
    assert r.status_code == 200
    fn.assert_called_once_with(["ctrl", "c"])


def test_keyboard_shortcut_invalid_key(authed):
    c, h = authed
    with patch("agents.laptop.routes_input.input_win.shortcut", side_effect=ValueError("bad")):
        r = c.post("/api/keyboard/shortcut", json={"keys": ["ctrl", "blammo"]}, headers=h)
    assert r.status_code == 400
    assert "bad" in r.json()["error"]


def test_mouse_click(authed):
    c, h = authed
    with patch("agents.laptop.routes_input.input_win.click") as fn:
        r = c.post("/api/mouse/click", json={"button": "left", "double": False}, headers=h)
    assert r.status_code == 200
    fn.assert_called_once_with("left", double=False)
