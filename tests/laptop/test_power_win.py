from unittest.mock import patch

import pytest

from agents.laptop import power_win


def test_shutdown_invokes_shutdown_exe():
    with patch("agents.laptop.power_win.subprocess.run") as run:
        run.return_value.returncode = 0
        power_win.shutdown(delay_seconds=10)
        args = run.call_args.args[0]
        assert args[0].lower().endswith("shutdown.exe") or args[0].lower() == "shutdown"
        assert "/s" in args and "/t" in args and "10" in args


def test_shutdown_failure_raises():
    with patch("agents.laptop.power_win.subprocess.run") as run:
        run.return_value.returncode = 1
        run.return_value.stderr = b"nope"
        with pytest.raises(RuntimeError):
            power_win.shutdown(delay_seconds=5)


def test_lock_calls_user32():
    with patch("agents.laptop.power_win.ctypes") as c:
        power_win.lock()
        c.windll.user32.LockWorkStation.assert_called_once()


def test_sleep_calls_powrprof():
    with patch("agents.laptop.power_win.ctypes") as c:
        power_win.sleep()
        c.windll.powrprof.SetSuspendState.assert_called_once_with(0, 1, 0)


def test_lock_failure_raises():
    with patch("agents.laptop.power_win.ctypes") as c:
        c.windll.user32.LockWorkStation.return_value = 0
        with pytest.raises(RuntimeError):
            power_win.lock()


def test_sleep_failure_raises():
    with patch("agents.laptop.power_win.ctypes") as c:
        c.windll.powrprof.SetSuspendState.return_value = 0
        with pytest.raises(RuntimeError):
            power_win.sleep()
