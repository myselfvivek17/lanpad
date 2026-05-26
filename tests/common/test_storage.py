import json
from pathlib import Path

import pytest

from agents.common import storage


@pytest.fixture
def tmp_state(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "_resolve_state_dir", lambda: tmp_path)
    return tmp_path


def test_state_dir_created(tmp_state):
    d = storage.state_dir()
    assert d == tmp_state
    assert d.exists()


def test_write_and_read_pairing_pin(tmp_state):
    storage.write_pairing_pin("123456")
    assert storage.read_pairing_pin() == "123456"
    assert (tmp_state / "pairing.txt").read_text().strip() == "123456"


def test_read_pairing_pin_missing(tmp_state):
    assert storage.read_pairing_pin() is None


def test_tokens_round_trip(tmp_state):
    storage.add_token(token_hash="abc", device_id="d1", name="phone")
    tokens = storage.list_tokens()
    assert len(tokens) == 1
    assert tokens[0]["id"] == "d1"
    assert tokens[0]["name"] == "phone"
    assert tokens[0]["token_hash"] == "abc"
    assert "created_at" in tokens[0]


def test_revoke_token(tmp_state):
    storage.add_token("h1", "d1", "p1")
    storage.add_token("h2", "d2", "p2")
    storage.revoke_token("d1")
    ids = [t["id"] for t in storage.list_tokens()]
    assert ids == ["d2"]


def test_find_by_hash(tmp_state):
    storage.add_token("h1", "d1", "p1")
    rec = storage.find_token_by_hash("h1")
    assert rec is not None and rec["id"] == "d1"
    assert storage.find_token_by_hash("nope") is None


def test_touch_last_seen_updates(tmp_state):
    storage.add_token("h1", "d1", "p1")
    before = storage.list_tokens()[0]["last_seen"]
    storage.touch_last_seen("d1")
    after = storage.list_tokens()[0]["last_seen"]
    assert after >= before


def test_corrupt_tokens_file_recovers(tmp_state):
    (tmp_state / "tokens.json").write_text("{not json")
    # Reading should reset to empty list, not crash.
    assert storage.list_tokens() == []
