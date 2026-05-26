# phone-remote — manual smoke test

## Setup
1. On laptop: `pwsh -ExecutionPolicy Bypass -File scripts\install-laptop-windows.ps1`
2. Start the task: `Start-ScheduledTask -TaskName PhoneRemoteLaptopAgent`
3. Open `http://localhost:8765/api/health` in a browser — should return JSON.
4. PIN is in `%LOCALAPPDATA%\phone-remote\pairing.txt`.
5. On server (as root): `sudo ./scripts/install-server-linux.sh`
6. Service: `systemctl status phone-remote-agent`. PIN: `cat /var/lib/phone-remote/pairing.txt`.

## Phone setup
1. On the phone, open `http://laptop.local:8765/` (or the laptop's IP).
2. "Add to Home Screen" to install the PWA.
3. Tap "+ Add device": hostname `laptop.local`, port `8765`, kind `laptop`,
   name `phone`, paste the PIN. Tap Pair.
4. Repeat for the server: hostname `homeserver.local`, kind `server`.

## Smoke test checklist
- [ ] Devices screen lists both devices.
- [ ] Trackpad: move cursor; single-tap = left click; long-press = right click; two-finger drag = scroll.
- [ ] Keyboard: send text into Notepad. Try shortcuts: Win+D, Alt+Tab, Ctrl+T (in browser).
- [ ] Media: open Spotify or YouTube, then Play/Pause, Next, Prev, Vol up/down/mute.
- [ ] Power: Lock the laptop; Sleep; then Shutdown — cancel with `shutdown /a` before the 5 s elapses.
- [ ] Server: Shutdown (cancel with `sudo shutdown -c` on the server before the minute elapses).
- [ ] Server: System update — watch the log_tail update; `apt` runs successfully.
- [ ] Revoke a device from Devices screen; the controller bounces to Pair on the next request.
