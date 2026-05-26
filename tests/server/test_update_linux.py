import time
from unittest.mock import patch, MagicMock

import pytest

from agents.server import update_linux


def test_start_returns_job_id(tmp_path, monkeypatch):
    monkeypatch.setattr(update_linux, "_LOG_DIR", tmp_path)
    proc = MagicMock()
    proc.poll.return_value = None
    with patch("agents.server.update_linux.subprocess.Popen", return_value=proc):
        job = update_linux.start_update()
    assert job["status"] == "running"
    assert job["job_id"]
    update_linux.cancel_for_test(job["job_id"])


def test_get_status_transitions_to_completed(tmp_path, monkeypatch):
    monkeypatch.setattr(update_linux, "_LOG_DIR", tmp_path)
    proc = MagicMock()
    proc.poll.side_effect = [None, 0]
    with patch("agents.server.update_linux.subprocess.Popen", return_value=proc):
        job = update_linux.start_update()
    # First call: still running.
    s = update_linux.get_status(job["job_id"])
    assert s["status"] == "running"
    # Second call: completed.
    s = update_linux.get_status(job["job_id"])
    assert s["status"] == "completed"


def test_get_status_failed(tmp_path, monkeypatch):
    monkeypatch.setattr(update_linux, "_LOG_DIR", tmp_path)
    proc = MagicMock()
    proc.poll.return_value = 2
    with patch("agents.server.update_linux.subprocess.Popen", return_value=proc):
        job = update_linux.start_update()
    s = update_linux.get_status(job["job_id"])
    assert s["status"] == "failed"


def test_get_status_unknown_job():
    s = update_linux.get_status("not-a-job")
    assert s["status"] == "unknown"


def test_log_tail_truncated_to_4k(tmp_path, monkeypatch):
    monkeypatch.setattr(update_linux, "_LOG_DIR", tmp_path)
    proc = MagicMock()
    proc.poll.return_value = 0
    with patch("agents.server.update_linux.subprocess.Popen", return_value=proc):
        job = update_linux.start_update()
    log_path = tmp_path / f"update-{job['job_id']}.log"
    log_path.write_text("x" * 10_000)
    s = update_linux.get_status(job["job_id"])
    assert len(s["log_tail"]) <= 4096
