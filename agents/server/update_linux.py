from __future__ import annotations

import subprocess
import uuid
from pathlib import Path
from typing import Optional

_LOG_DIR = Path("/var/log/server-agent")
_SCRIPT = "/usr/local/bin/server-agent-update.sh"
_jobs: dict[str, dict] = {}


def start_update() -> dict:
    _LOG_DIR.mkdir(parents=True, exist_ok=True)
    job_id = uuid.uuid4().hex[:12]
    log_path = _LOG_DIR / f"update-{job_id}.log"
    log_file = open(log_path, "wb")
    proc = subprocess.Popen(
        ["sudo", "-n", _SCRIPT],
        stdout=log_file,
        stderr=subprocess.STDOUT,
    )
    _jobs[job_id] = {"proc": proc, "log": log_path, "status": "running"}
    return {"job_id": job_id, "status": "running"}


def _read_tail(p: Path, n: int = 4096) -> str:
    if not p.exists():
        return ""
    data = p.read_bytes()
    return data[-n:].decode("utf-8", errors="replace")


def get_status(job_id: str) -> dict:
    job = _jobs.get(job_id)
    if not job:
        return {"status": "unknown"}
    rc = job["proc"].poll()
    if rc is None:
        job["status"] = "running"
    elif rc == 0:
        job["status"] = "completed"
    else:
        job["status"] = "failed"
    return {
        "status": job["status"],
        "log_tail": _read_tail(job["log"]),
    }


def cancel_for_test(job_id: str) -> None:
    """Test helper: terminate the recorded process so pytest doesn't leak it."""
    job = _jobs.pop(job_id, None)
    if job:
        try:
            job["proc"].terminate()
        except Exception:
            pass
