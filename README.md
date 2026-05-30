# lanpad

> Control your Windows laptop and Ubuntu home server from your phone — entirely over your local network.

lanpad is a self-hosted, LAN-only PWA that turns your phone into a remote control for your home devices. No cloud, no accounts, no internet required. Pair once with a PIN, then control mouse, keyboard, media, and power from anywhere in your house.

---

## Features

**Laptop (Windows)**
- 🖱️ **Trackpad** — full mouse control via WebSocket; single-finger move, two-finger scroll, tap to click, long-press for right-click
- ⌨️ **Keyboard** — send text and keyboard shortcuts (Win+D, Alt+Tab, Ctrl+C/V/Z, Esc, F-keys…)
- 🎵 **Media** — play/pause, seek forward/back (arrow keys), volume up/down/mute
- ⚡ **Power** — shutdown (5s delay), sleep, lock screen

**Server (Ubuntu)**
- ⚡ **Power** — remote shutdown (30s delay)
- ↻ **System Update** — trigger `apt update && apt upgrade` with live log streaming

**Platform**
- 📱 Installable as a PWA (Add to Home Screen — works offline after install)
- 🔒 LAN-only — all traffic stays on your local network
- 🔑 PIN pairing → long-lived bearer tokens (SHA-256 hashed at rest)
- 🌐 mDNS advertisement (`_phone-remote._tcp.local.`)

---

## Architecture

```
Phone (PWA)
  │  REST + WebSocket  (port 8765)
  ├──────────────────► Laptop Agent  (Windows, FastAPI + pyautogui + ctypes)
  │
  │  REST             (port 8765)
  └──────────────────► Server Agent  (Ubuntu, FastAPI + systemd)
```

```
phone-remote/
├── agents/
│   ├── common/        # auth, storage, LAN guard, mDNS, app factory
│   ├── laptop/        # power, media, input, WebSocket handler
│   └── server/        # power, apt-update job runner
├── pwa/               # React 18 + Vite + TypeScript PWA
│   └── src/
│       ├── api/       # REST client, WebSocket client (RAF-batched)
│       ├── components/# TrackpadSurface, ShortcutGrid, ConfirmModal
│       ├── pages/     # Devices, Pair, Control, Trackpad, Keyboard, Media, Power
│       └── store/     # Zustand device store (localStorage)
├── scripts/
│   ├── install-laptop-windows.ps1
│   ├── install-server-linux.sh
│   ├── phone-remote-agent.service   # systemd unit
│   ├── server-agent-shutdown.sh     # sudo wrapper
│   └── server-agent-update.sh       # sudo wrapper
└── tests/             # 87 Python tests + 6 PWA tests
```

---

## Requirements

**Laptop (Windows)**
- Python 3.11+
- Node.js 18+ (for building the PWA)
- PowerShell 5+

**Server (Ubuntu)**
- Python 3.11+ with `python3.12-venv`
- systemd

---

## Installation

### Laptop (Windows)

Run in an **elevated** (Administrator) PowerShell from the project root:

```powershell
pwsh -ExecutionPolicy Bypass -File scripts\install-laptop-windows.ps1
```

This will:
- Create a Python venv and install dependencies
- Build the PWA (`pwa/dist/`)
- Add a Windows Firewall rule for TCP 8765 (Private profile)
- Register a `PhoneRemoteLaptopAgent` Scheduled Task (runs at logon)

Start the agent:
```powershell
Start-ScheduledTask -TaskName PhoneRemoteLaptopAgent
```

The **pairing PIN** is printed to the console on first run and saved to:
```
%LOCALAPPDATA%\phone-remote\pairing.txt
```

### Server (Ubuntu)

Copy the project to the server (only source files needed):
```bash
# From Windows
scp -r agents tests scripts pyproject.toml vivek@192.168.0.x:~/lanpad
```

Then SSH in and run as root:
```bash
sudo apt install python3.12-venv -y
sudo bash ~/lanpad/scripts/install-server-linux.sh
```

This will:
- Copy files to `/opt/phone-remote/`
- Create a venv and install server dependencies
- Install sudo wrappers for shutdown and apt-update
- Enable and start the `phone-remote-agent` systemd unit

The pairing PIN is printed at the end and stored at `/var/lib/phone-remote/pairing.txt`.

---

## Pairing

1. Open `http://<laptop-ip>:8765` on your phone
2. Tap **Add device**, enter the laptop's IP and PIN
3. To also control your server, tap **Add device** again with the server's IP and PIN

> **Android note:** `.local` mDNS hostnames may not resolve — use the IP address directly.

**Install as PWA:** tap your browser's menu → *Add to Home Screen*. The app shell is cached locally, so you can open it even when the laptop is off (server controls still work independently).

---

## Development

```bash
# Install Python deps (laptop profile)
python -m venv .venv
.venv/Scripts/pip install -e ".[laptop]"

# Run tests
pytest tests/ -q

# Run laptop agent (dev)
python -m agents.laptop.main

# PWA dev server
cd pwa
npm install
npm run dev    # http://localhost:5173
npm run build  # production build → pwa/dist/
```

---

## Security Notes

- Traffic is **unencrypted HTTP/WS** — suitable for trusted home LANs only
- The LAN guard middleware rejects all requests from non-RFC1918 addresses
- Tokens are stored as SHA-256 hashes; PINs are compared via `hmac.compare_digest`
- The WebSocket token is passed as a URL query parameter (visible in server logs)
- `sudo` access on the server is scoped to two specific scripts only

---

## License

MIT
