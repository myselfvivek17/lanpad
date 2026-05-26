#!/usr/bin/env bash
set -euo pipefail

# Run as root on the Ubuntu server.
if [ "$EUID" -ne 0 ]; then echo "run as root"; exit 1; fi

SRC_DIR="$(cd "$(dirname "$0")/.." && pwd)"

install -d -m 0755 /opt/phone-remote
rsync -a --delete --exclude .venv --exclude pwa "$SRC_DIR/" /opt/phone-remote/

python3 -m venv /opt/phone-remote/.venv
/opt/phone-remote/.venv/bin/pip install -e "/opt/phone-remote[server]"

install -m 0755 "$SRC_DIR/scripts/server-agent-update.sh"   /usr/local/bin/server-agent-update.sh
install -m 0755 "$SRC_DIR/scripts/server-agent-shutdown.sh" /usr/local/bin/server-agent-shutdown.sh

cat > /etc/sudoers.d/server-agent <<'EOF'
vivek ALL=(root) NOPASSWD: /usr/local/bin/server-agent-update.sh
vivek ALL=(root) NOPASSWD: /usr/local/bin/server-agent-shutdown.sh
EOF
chmod 0440 /etc/sudoers.d/server-agent
visudo -c >/dev/null

chown -R vivek:vivek /opt/phone-remote
install -d -m 0755 /var/log/server-agent
chown vivek:vivek /var/log/server-agent
install -d -m 0700 /var/lib/phone-remote
chown vivek:vivek /var/lib/phone-remote

install -m 0644 "$SRC_DIR/scripts/phone-remote-agent.service" /etc/systemd/system/phone-remote-agent.service
systemctl daemon-reload
systemctl enable --now phone-remote-agent

echo "Installed. Pairing PIN:"
sleep 1
sudo -u vivek cat /var/lib/phone-remote/pairing.txt || echo "(check service logs: journalctl -u phone-remote-agent)"
