#!/bin/bash
set -euo pipefail
[[ ${EUID} -eq 0 ]] || { echo 'Run with sudo' >&2; exit 1; }
SRC=/home/leslie/agile-dashboard
[[ -f ${SRC}/webui-bff.cjs && -f ${SRC}/webui/index.html ]] || { echo 'Missing staged BFF/WebUI artifacts' >&2; exit 1; }
systemctl stop matter-web-auth
install -m 644 ${SRC}/webui-bff.cjs /opt/matter-web-auth/webui-bff.cjs
rm -rf /opt/matter-web-auth/public/*
cp -a ${SRC}/webui/. /opt/matter-web-auth/public/
chown -R root:root /opt/matter-web-auth
find /opt/matter-web-auth/public -type d -exec chmod 755 {} +
find /opt/matter-web-auth/public -type f -exec chmod 644 {} +
if grep -q '^MOBILE_ALLOWED_ORIGINS=' /etc/matter-web-auth/webui.env; then
  sed -i 's|^MOBILE_ALLOWED_ORIGINS=.*|MOBILE_ALLOWED_ORIGINS=https://localhost|' /etc/matter-web-auth/webui.env
else
  printf '\nMOBILE_ALLOWED_ORIGINS=https://localhost\n' >>/etc/matter-web-auth/webui.env
fi
systemctl start matter-web-auth
systemctl --no-pager --full status matter-web-auth
