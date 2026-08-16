#!/bin/bash
set -euo pipefail

if [[ ${EUID} -ne 0 ]]; then
    echo "Run with sudo: sudo bash rotate-webui-credential.sh" >&2
    exit 1
fi

LOGIN_FILE=/home/leslie/agile-dashboard/webui-login.txt
URL_VALUE=ws://192.168.1.192:9001
if [[ -r ${LOGIN_FILE} ]]; then
    EXISTING_URL=$(sed -n 's/^URL=//p' "${LOGIN_FILE}")
    [[ -n ${EXISTING_URL} ]] && URL_VALUE=${EXISTING_URL}
fi

WEBUI_PASSWORD=$(openssl rand -hex 16)
mosquitto_passwd -b /etc/mosquitto/passwd webui "${WEBUI_PASSWORD}"
chown root:mosquitto /etc/mosquitto/passwd
chmod 640 /etc/mosquitto/passwd

cat >"${LOGIN_FILE}" <<EOF
URL=${URL_VALUE}
USERNAME=webui
PASSWORD=${WEBUI_PASSWORD}
EOF
chown leslie:leslie "${LOGIN_FILE}"
chmod 600 "${LOGIN_FILE}"

systemctl restart mosquitto
printf 'WebUI MQTT credential rotated. Read the new value from %s.\n' "${LOGIN_FILE}"
