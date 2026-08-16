#!/bin/bash
set -euo pipefail
[[ ${EUID} -eq 0 ]] || { echo 'Run with sudo' >&2; exit 1; }
SRC=/home/leslie/agile-dashboard
[[ -f ${SRC}/webui-bff.cjs && -f ${SRC}/webui/index.html && -f ${SRC}/webui-login.txt ]] || { echo 'Missing staged artifacts/login file' >&2; exit 1; }
install -d -m 755 /opt/matter-web-auth /opt/matter-web-auth/public
install -m 644 ${SRC}/webui-bff.cjs /opt/matter-web-auth/webui-bff.cjs
rm -rf /opt/matter-web-auth/public/*
cp -a ${SRC}/webui/. /opt/matter-web-auth/public/
chown -R root:root /opt/matter-web-auth
find /opt/matter-web-auth/public -type d -exec chmod 755 {} +
find /opt/matter-web-auth/public -type f -exec chmod 644 {} +
install -d -m 750 -o root -g matter-webui /etc/matter-web-auth
MQTT_PASSWORD=$(sed -n 's/^PASSWORD=//p' ${SRC}/webui-login.txt)
[[ -n ${MQTT_PASSWORD} ]] || { echo 'Missing MQTT password' >&2; exit 1; }
cat >/etc/matter-web-auth/webui.env <<EOF
WEBUI_BIND=127.0.0.1
WEBUI_PORT=8082
WEBUI_PUBLIC_ORIGIN=https://dashboard.rhophi.uk
WEBUI_ROOT=/opt/matter-web-auth/public
WEBUI_STATE_DIR=/var/lib/matter-web-auth
MQTT_URL=mqtt://127.0.0.1:1883
MQTT_USERNAME=webui
MQTT_PASSWORD=${MQTT_PASSWORD}
WEBUI_SESSION_TTL_S=604800
WEBUI_SESSION_IDLE_S=86400
LOG_LEVEL=info
EOF
read -rp 'Admin username [admin]: ' ADMIN_USER; ADMIN_USER=${ADMIN_USER:-admin}
read -rsp 'Admin password: ' ADMIN_PASSWORD; echo
read -rsp 'Confirm password: ' ADMIN_PASSWORD_2; echo
[[ ${ADMIN_PASSWORD} == ${ADMIN_PASSWORD_2} && ${#ADMIN_PASSWORD} -ge 12 ]] || { echo 'Passwords differ or shorter than 12 chars' >&2; exit 1; }
HASH=$(printf '%s' "${ADMIN_PASSWORD}" | /opt/node20/bin/node /opt/matter-web-auth/webui-bff.cjs hash-password)
unset ADMIN_PASSWORD ADMIN_PASSWORD_2
cat >/etc/matter-web-auth/admin.env <<EOF
WEBUI_ADMIN_USERNAME=${ADMIN_USER}
WEBUI_ADMIN_PASSWORD_HASH=${HASH}
EOF
chown root:matter-webui /etc/matter-web-auth/*.env
chmod 640 /etc/matter-web-auth/*.env
install -m 644 ${SRC}/matter-web-auth.service /etc/systemd/system/matter-web-auth.service
systemctl daemon-reload
systemctl enable --now matter-web-auth
systemctl --no-pager --full status matter-web-auth
printf '\nLocal BFF: http://127.0.0.1:8082 (Host must be dashboard.rhophi.uk)\n'
