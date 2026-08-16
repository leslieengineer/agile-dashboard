#!/bin/bash
set -euo pipefail

if [[ ${EUID} -ne 0 ]]; then
    echo "Run with sudo: sudo bash install-production.sh" >&2
    exit 1
fi

SOURCE_ROOT=/home/leslie/agile-dashboard
NODE_SOURCE=/home/leslie/.local/node20/bin/node
GATEWAY_SOURCE=${SOURCE_ROOT}/gateway.cjs
WEBUI_SOURCE=${SOURCE_ROOT}/webui

for path in "${NODE_SOURCE}" "${GATEWAY_SOURCE}" "${WEBUI_SOURCE}/index.html"; do
    if [[ ! -e ${path} ]]; then
        echo "Missing required artifact: ${path}" >&2
        exit 1
    fi
done

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y mosquitto mosquitto-clients openssl

id matter-gateway >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin matter-gateway
id matter-webui >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin matter-webui

install -d -m 755 /opt/node20/bin /opt/matter-gateway /opt/matter-webui
install -m 755 "${NODE_SOURCE}" /opt/node20/bin/node
install -m 644 "${GATEWAY_SOURCE}" /opt/matter-gateway/gateway.cjs
rm -rf /opt/matter-webui/*
cp -a "${WEBUI_SOURCE}/." /opt/matter-webui/
chown -R root:root /opt/node20 /opt/matter-gateway
chown -R matter-webui:matter-webui /opt/matter-webui

install -d -m 750 -o root -g matter-gateway /etc/matter-gateway
GATEWAY_PASSWORD=$(openssl rand -hex 20)
WEBUI_PASSWORD=$(openssl rand -hex 16)

mosquitto_passwd -b -c /etc/mosquitto/passwd gateway "${GATEWAY_PASSWORD}"
mosquitto_passwd -b /etc/mosquitto/passwd webui "${WEBUI_PASSWORD}"
chown root:mosquitto /etc/mosquitto/passwd
chmod 640 /etc/mosquitto/passwd

cat >/etc/mosquitto/aclfile <<'ACL'
user gateway
topic read home/control/tx
topic write home/control/rx
topic write home/control/status

user webui
topic write home/control/tx
topic read home/control/rx
topic read home/control/status
ACL
chown root:mosquitto /etc/mosquitto/aclfile
chmod 640 /etc/mosquitto/aclfile

cat >/etc/mosquitto/conf.d/matter.conf <<'MOSQUITTO'
per_listener_settings true
max_packet_size 16384

listener 1883 127.0.0.1
protocol mqtt
allow_anonymous false
password_file /etc/mosquitto/passwd
acl_file /etc/mosquitto/aclfile

listener 9001 0.0.0.0
protocol websockets
allow_anonymous false
password_file /etc/mosquitto/passwd
acl_file /etc/mosquitto/aclfile
MOSQUITTO

cat >/etc/matter-gateway/gateway.env <<EOF
MQTT_URL=mqtt://127.0.0.1:1883
MQTT_USERNAME=gateway
MQTT_PASSWORD=${GATEWAY_PASSWORD}
MQTT_CLIENT_ID=matter-gateway
MQTT_TX_TOPIC=home/control/tx
MQTT_RX_TOPIC=home/control/rx
CONTROLLER_MODE=mock
CONTROLLER_TIMEOUT_MS=5000
MOCK_LATENCY_MS=30
LOG_LEVEL=info
EOF
chown root:matter-gateway /etc/matter-gateway/gateway.env
chmod 640 /etc/matter-gateway/gateway.env

cat >${SOURCE_ROOT}/webui-login.txt <<EOF
URL=ws://192.168.1.192:9001
USERNAME=webui
PASSWORD=${WEBUI_PASSWORD}
EOF
chown leslie:leslie ${SOURCE_ROOT}/webui-login.txt
chmod 600 ${SOURCE_ROOT}/webui-login.txt

install -m 644 ${SOURCE_ROOT}/matter-gateway.service /etc/systemd/system/matter-gateway.service
install -m 644 ${SOURCE_ROOT}/matter-webui.service /etc/systemd/system/matter-webui.service

systemctl daemon-reload
systemctl enable mosquitto matter-gateway matter-webui
systemctl restart mosquitto
systemctl restart matter-gateway
systemctl restart matter-webui

printf '\nInstalled services:\n'
systemctl --no-pager --full status mosquitto matter-gateway matter-webui || true
printf '\nWebUI credentials are stored in %s/webui-login.txt (mode 0600).\n' "${SOURCE_ROOT}"
printf 'Dashboard: http://192.168.1.192:8080/\n'
