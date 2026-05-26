from __future__ import annotations

import socket
from dataclasses import dataclass

from zeroconf import IPVersion, ServiceInfo, Zeroconf

_SERVICE_TYPE = "_phone-remote._tcp.local."


@dataclass
class AdvertiseHandle:
    zeroconf: Zeroconf
    info: ServiceInfo

    def close(self) -> None:
        try:
            self.zeroconf.unregister_service(self.info)
        finally:
            self.zeroconf.close()


def _primary_lan_ip() -> str:
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        return s.getsockname()[0]
    except OSError:
        return "127.0.0.1"
    finally:
        s.close()


def advertise(hostname: str, port: int, agent_kind: str) -> AdvertiseHandle:
    ip = _primary_lan_ip()
    info = ServiceInfo(
        type_=_SERVICE_TYPE,
        name=f"{hostname}.{_SERVICE_TYPE}",
        addresses=[socket.inet_aton(ip)],
        port=port,
        properties={"kind": agent_kind, "version": "0.1.0"},
        server=f"{hostname}.local.",
    )
    zc = Zeroconf(ip_version=IPVersion.V4Only)
    try:
        zc.register_service(info)
    except Exception:
        zc.close()
        raise
    return AdvertiseHandle(zeroconf=zc, info=info)
