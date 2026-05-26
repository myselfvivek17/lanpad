from __future__ import annotations

import ctypes
import subprocess


def shutdown(delay_seconds: int = 5) -> None:
    res = subprocess.run(
        ["shutdown.exe", "/s", "/t", str(delay_seconds)],
        capture_output=True,
    )
    if res.returncode != 0:
        raise RuntimeError(res.stderr.decode("utf-8", errors="replace") or "shutdown failed")


def lock() -> None:
    if not ctypes.windll.user32.LockWorkStation():
        raise RuntimeError("LockWorkStation failed")


def sleep() -> None:
    # SetSuspendState(hibernate=0, forceCritical=1, disableWakeEvent=0)
    ctypes.windll.powrprof.SetSuspendState(0, 1, 0)
