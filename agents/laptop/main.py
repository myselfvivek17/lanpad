from __future__ import annotations

import socket
from pathlib import Path

import uvicorn
from fastapi.staticfiles import StaticFiles

from agents.common import auth, mdns
from agents.common.app_factory import build_app
from agents.laptop import routes_input, routes_media, routes_power, ws_input

PORT = 8765
VERSION = "0.1.0"


def _hostname() -> str:
    # Use the machine's hostname, sanitized for DNS-SD.
    raw = socket.gethostname().split(".")[0]
    return "".join(c if c.isalnum() or c == "-" else "-" for c in raw).lower() or "laptop"


def main() -> None:
    pin = auth.ensure_pairing_pin()
    print(f"[phone-remote] pairing PIN: {pin}", flush=True)

    app = build_app(agent_name=_hostname(), agent_kind="laptop", version=VERSION)
    routes_power.attach(app)
    routes_media.attach(app)
    routes_input.attach(app)
    ws_input.attach(app)

    pwa_dist = Path(__file__).resolve().parents[2] / "pwa" / "dist"
    if pwa_dist.exists():
        app.mount("/", StaticFiles(directory=str(pwa_dist), html=True), name="pwa")

    handle = mdns.advertise(hostname=_hostname(), port=PORT, agent_kind="laptop")
    try:
        uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")
    finally:
        handle.close()


if __name__ == "__main__":
    main()
