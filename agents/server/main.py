from __future__ import annotations

import socket

import uvicorn

from agents.common import auth, mdns
from agents.common.app_factory import build_app
from agents.server import routes_power, routes_update

PORT = 8765
VERSION = "0.1.0"


def _hostname() -> str:
    raw = socket.gethostname().split(".")[0]
    return "".join(c if c.isalnum() or c == "-" else "-" for c in raw).lower() or "homeserver"


def main() -> None:
    pin = auth.ensure_pairing_pin()
    print(f"[phone-remote] pairing PIN: {pin}", flush=True)

    app = build_app(agent_name=_hostname(), agent_kind="server", version=VERSION)
    routes_power.attach(app)
    routes_update.attach(app)

    handle = mdns.advertise(hostname=_hostname(), port=PORT, agent_kind="server")
    try:
        uvicorn.run(app, host="0.0.0.0", port=PORT, log_level="info")
    finally:
        handle.close()


if __name__ == "__main__":
    main()
