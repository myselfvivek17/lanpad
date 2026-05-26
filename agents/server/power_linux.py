from __future__ import annotations

import subprocess

_SCRIPT = "/usr/local/bin/server-agent-shutdown.sh"


def shutdown(delay_seconds: int = 30) -> None:
    res = subprocess.run(
        ["sudo", "-n", _SCRIPT, str(delay_seconds)],
        capture_output=True,
    )
    if res.returncode != 0:
        raise RuntimeError(res.stderr.decode("utf-8", errors="replace") or "shutdown failed")
