import pytest

from agents.common import auth, storage


@pytest.fixture(autouse=True)
def isolate(tmp_path, monkeypatch):
    monkeypatch.setattr(storage, "_resolve_state_dir", lambda: tmp_path)
    # Reset the rate-limit state between tests.
    auth._failed_attempts.clear()
    auth._locked_until.clear()
    yield


def test_generate_pin_is_6_digits():
    pin = auth.generate_pin()
    assert len(pin) == 6 and pin.isdigit()


def test_pair_with_correct_pin_returns_token():
    storage.write_pairing_pin("424242")
    res = auth.pair(pin="424242", device_name="phone", client_ip="192.168.1.5")
    assert "token" in res
    assert len(res["token"]) >= 32


def test_pair_persists_token_hash_not_plain():
    storage.write_pairing_pin("424242")
    res = auth.pair("424242", "phone", "192.168.1.5")
    tokens = storage.list_tokens()
    assert tokens[0]["token_hash"] != res["token"]
    assert len(tokens[0]["token_hash"]) == 64  # sha256 hex


def test_pair_with_wrong_pin_raises():
    storage.write_pairing_pin("424242")
    with pytest.raises(auth.PairingError):
        auth.pair("000000", "phone", "192.168.1.5")


def test_pair_rotates_pin_after_success():
    storage.write_pairing_pin("424242")
    auth.pair("424242", "phone", "192.168.1.5")
    assert storage.read_pairing_pin() != "424242"


def test_rate_limit_locks_after_five_fails():
    storage.write_pairing_pin("424242")
    ip = "192.168.1.5"
    for _ in range(5):
        with pytest.raises(auth.PairingError):
            auth.pair("000000", "p", ip)
    with pytest.raises(auth.RateLimitedError):
        auth.pair("424242", "p", ip)  # even with correct PIN


def test_verify_token_returns_record():
    storage.write_pairing_pin("424242")
    res = auth.pair("424242", "phone", "192.168.1.5")
    rec = auth.verify_token(res["token"])
    assert rec is not None and rec["name"] == "phone"


def test_verify_token_invalid_returns_none():
    assert auth.verify_token("not-a-token") is None
