"""System tray icon for the lanpad laptop agent."""
from __future__ import annotations

import socket
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path

try:
    import pystray
    from PIL import Image, ImageDraw
except ImportError:
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pystray", "pillow", "-q"])
    import pystray
    from PIL import Image, ImageDraw

ROOT = Path(__file__).parent
PYTHON = ROOT / ".venv" / "Scripts" / "python.exe"
PORT = 8765
_agent_proc: subprocess.Popen | None = None


def _is_running() -> bool:
    try:
        with socket.create_connection(("127.0.0.1", PORT), timeout=1):
            return True
    except OSError:
        return False


def _make_icon(green: bool) -> Image.Image:
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    color = (0, 220, 100) if green else (220, 60, 60)
    d.ellipse([8, 8, 56, 56], fill=color)
    d.text((22, 18), "LP", fill=(255, 255, 255))
    return img


def _open_browser(_icon, _item):
    webbrowser.open(f"http://127.0.0.1:{PORT}")


def _start_agent(_icon=None, _item=None):
    global _agent_proc
    if _is_running():
        return
    _agent_proc = subprocess.Popen(
        [str(PYTHON), "-m", "agents.laptop.main"],
        cwd=str(ROOT),
        creationflags=subprocess.CREATE_NO_WINDOW,
    )


def _stop_agent(_icon=None, _item=None):
    global _agent_proc
    if _agent_proc:
        _agent_proc.terminate()
        _agent_proc = None
    # also kill any orphan on the port
    result = subprocess.run(
        ["netstat", "-ano"],
        capture_output=True, text=True
    )
    for line in result.stdout.splitlines():
        if f":{PORT}" in line and "LISTENING" in line:
            pid = line.strip().split()[-1]
            subprocess.run(["taskkill", "/F", "/PID", pid], capture_output=True)


def _exit_tray(icon, _item):
    icon.stop()


def _poll_loop(icon: pystray.Icon):
    last = None
    while True:
        running = _is_running()
        if running != last:
            icon.icon = _make_icon(running)
            icon.title = "lanpad — running" if running else "lanpad — stopped"
            last = running
        time.sleep(3)


def main():
    _start_agent()  # auto-start on tray launch

    icon = pystray.Icon(
        "lanpad",
        _make_icon(False),
        "lanpad — starting…",
        menu=pystray.Menu(
            pystray.MenuItem("Open in browser", _open_browser, default=True),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("Start agent", _start_agent),
            pystray.MenuItem("Stop agent", _stop_agent),
            pystray.Menu.SEPARATOR,
            pystray.MenuItem("Exit", _exit_tray),
        ),
    )

    threading.Thread(target=_poll_loop, args=(icon,), daemon=True).start()
    icon.run()


if __name__ == "__main__":
    main()
