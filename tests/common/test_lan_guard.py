import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from agents.common.lan_guard import LanOnlyMiddleware, is_lan_ip


@pytest.mark.parametrize("ip", [
    "127.0.0.1",
    "10.0.0.5",
    "10.255.255.255",
    "172.16.0.1",
    "172.31.255.254",
    "192.168.1.10",
    "::1",
    "fe80::1",
    "fc00::1",
])
def test_lan_allowed(ip):
    assert is_lan_ip(ip) is True


@pytest.mark.parametrize("ip", [
    "8.8.8.8",
    "1.1.1.1",
    "172.32.0.1",
    "192.169.0.1",
    "2606:4700:4700::1111",
    "",
    "not-an-ip",
])
def test_non_lan_rejected(ip):
    assert is_lan_ip(ip) is False


def make_app():
    app = FastAPI()
    app.add_middleware(LanOnlyMiddleware)

    @app.get("/ping")
    def ping():
        return {"ok": True}

    return app


def test_middleware_allows_lan_client(monkeypatch):
    monkeypatch.setattr("agents.common.lan_guard.is_lan_ip", lambda ip: True)
    client = TestClient(make_app())
    r = client.get("/ping")
    assert r.status_code == 200


def test_middleware_rejects_with_forwarded_public_ip():
    # TestClient sends client host "testclient" which our guard treats as non-LAN.
    client = TestClient(make_app())
    r = client.get("/ping")
    assert r.status_code == 403
