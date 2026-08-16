#!/bin/bash
set -euo pipefail
[[ ${EUID} -eq 0 ]] || { echo 'Run with sudo' >&2; exit 1; }
read -rsp 'New Cloudflare Tunnel token: ' TOKEN; echo
[[ -n ${TOKEN} ]] || { echo 'Token is required' >&2; exit 1; }
printf '%s' "${TOKEN}" >/etc/cloudflared/token
unset TOKEN
chown root:root /etc/cloudflared/token
chmod 600 /etc/cloudflared/token
systemctl restart cloudflared
systemctl --no-pager --full status cloudflared
