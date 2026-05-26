from unittest.mock import patch

import pytest

from agents.server import power_linux


def test_shutdown_calls_sudo_script():
    with patch("agents.server.power_linux.subprocess.run") as run:
        run.return_value.returncode = 0
        power_linux.shutdown(delay_seconds=30)
        cmd = run.call_args.args[0]
        assert cmd[:2] == ["sudo", "-n"]
        assert cmd[2] == "/usr/local/bin/server-agent-shutdown.sh"
        assert cmd[3] == "30"


def test_shutdown_failure_raises():
    with patch("agents.server.power_linux.subprocess.run") as run:
        run.return_value.returncode = 1
        run.return_value.stderr = b"nope"
        with pytest.raises(RuntimeError):
            power_linux.shutdown(30)
