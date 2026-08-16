#!/bin/bash
set -euo pipefail
[[ ${EUID} -eq 0 ]] || { echo 'Run with sudo' >&2; exit 1; }
ARCH=$(uname -m)
case ${ARCH} in
  armv7l|armhf) ASSET=cloudflared-linux-arm ;;
  aarch64|arm64) ASSET=cloudflared-linux-arm64 ;;
  *) echo "Unsupported architecture: ${ARCH}" >&2; exit 1 ;;
esac
curl -fL "https://github.com/cloudflare/cloudflared/releases/latest/download/${ASSET}" -o /usr/local/bin/cloudflared
chmod 755 /usr/local/bin/cloudflared
/usr/local/bin/cloudflared --version
read -rsp 'Cloudflare Tunnel token: ' TOKEN; echo
[[ -n ${TOKEN} ]] || { echo 'Token is required' >&2; exit 1; }
/usr/local/bin/cloudflared service uninstall >/dev/null 2>&1 || true
/usr/local/bin/cloudflared service install "${TOKEN}"
unset TOKEN
systemctl enable --now cloudflared
systemctl --no-pager --full status cloudflared
