from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path
from typing import Optional


def _resolve_state_dir() -> Path:
    if sys.platform == "win32":
        base = Path(os.environ.get("LOCALAPPDATA", str(Path.home() / "AppData" / "Local")))
        return base / "phone-remote"
    return Path("/var/lib/phone-remote")


def state_dir() -> Path:
    d = _resolve_state_dir()
    d.mkdir(parents=True, exist_ok=True)
    if sys.platform != "win32":
        try:
            os.chmod(d, 0o700)
        except PermissionError:
            pass
    return d


def _tokens_path() -> Path:
    return state_dir() / "tokens.json"


def _pairing_path() -> Path:
    return state_dir() / "pairing.txt"


def write_pairing_pin(pin: str) -> None:
    _pairing_path().write_text(pin + "\n", encoding="utf-8")


def read_pairing_pin() -> Optional[str]:
    p = _pairing_path()
    if not p.exists():
        return None
    return p.read_text(encoding="utf-8").strip()


def clear_pairing_pin() -> None:
    p = _pairing_path()
    if p.exists():
        p.unlink()


def _load_tokens() -> list[dict]:
    p = _tokens_path()
    if not p.exists():
        return []
    try:
        data = json.loads(p.read_text(encoding="utf-8"))
        if not isinstance(data, list):
            return []
        return data
    except json.JSONDecodeError:
        return []


def _save_tokens(tokens: list[dict]) -> None:
    _tokens_path().write_text(json.dumps(tokens, indent=2), encoding="utf-8")


def list_tokens() -> list[dict]:
    return _load_tokens()


def add_token(token_hash: str, device_id: str, name: str) -> None:
    tokens = _load_tokens()
    now = time.time()
    tokens.append({
        "id": device_id,
        "name": name,
        "token_hash": token_hash,
        "created_at": now,
        "last_seen": now,
    })
    _save_tokens(tokens)


def revoke_token(device_id: str) -> None:
    tokens = [t for t in _load_tokens() if t.get("id") != device_id]
    _save_tokens(tokens)


def find_token_by_hash(token_hash: str) -> Optional[dict]:
    for t in _load_tokens():
        if t.get("token_hash") == token_hash:
            return t
    return None


def touch_last_seen(device_id: str) -> None:
    tokens = _load_tokens()
    for t in tokens:
        if t.get("id") == device_id:
            t["last_seen"] = time.time()
    _save_tokens(tokens)
