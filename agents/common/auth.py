from __future__ import annotations

import hashlib
import hmac
import secrets
import time
import uuid
from collections import defaultdict, deque

from agents.common import storage

_RATE_WINDOW_SEC = 300       # 5 minutes
_RATE_MAX_FAILS = 5
_RATE_LOCK_SEC = 300         # 5 minute lock

_failed_attempts: dict[str, deque[float]] = defaultdict(deque)
_locked_until: dict[str, float] = {}


class PairingError(Exception):
    """Raised when pairing fails (wrong PIN, no PIN set)."""


class RateLimitedError(Exception):
    """Raised when too many failed pair attempts from one IP."""

    def __init__(self, retry_after: int):
        super().__init__(f"rate limited; retry after {retry_after}s")
        self.retry_after = retry_after


def generate_pin() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


def ensure_pairing_pin() -> str:
    """Write a fresh PIN if none exists; return the current PIN."""
    existing = storage.read_pairing_pin()
    if existing:
        return existing
    pin = generate_pin()
    storage.write_pairing_pin(pin)
    return pin


def rotate_pairing_pin() -> str:
    pin = generate_pin()
    storage.write_pairing_pin(pin)
    return pin


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def _check_rate_limit(client_ip: str) -> None:
    now = time.time()
    locked = _locked_until.get(client_ip)
    if locked and now < locked:
        raise RateLimitedError(int(locked - now))
    # Drop entries outside the window.
    dq = _failed_attempts[client_ip]
    while dq and now - dq[0] > _RATE_WINDOW_SEC:
        dq.popleft()


def _record_failure(client_ip: str) -> None:
    now = time.time()
    dq = _failed_attempts[client_ip]
    dq.append(now)
    if len(dq) >= _RATE_MAX_FAILS:
        _locked_until[client_ip] = now + _RATE_LOCK_SEC


def pair(pin: str, device_name: str, client_ip: str) -> dict:
    _check_rate_limit(client_ip)
    expected = storage.read_pairing_pin()
    if not expected or not hmac.compare_digest(pin, expected):
        _record_failure(client_ip)
        raise PairingError("invalid PIN")

    token = secrets.token_urlsafe(32)  # 256 bits of entropy
    device_id = uuid.uuid4().hex
    storage.add_token(
        token_hash=_hash_token(token),
        device_id=device_id,
        name=device_name,
    )
    rotate_pairing_pin()
    _failed_attempts.pop(client_ip, None)
    return {"token": token, "device_id": device_id}


def verify_token(token: str) -> dict | None:
    if not token:
        return None
    rec = storage.find_token_by_hash(_hash_token(token))
    if rec:
        storage.touch_last_seen(rec["id"])
    return rec
