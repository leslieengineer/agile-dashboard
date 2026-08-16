#!/bin/bash
set -euo pipefail

if [[ ${EUID} -ne 0 ]]; then
    echo "Run with sudo: sudo bash install-matter-controller.sh" >&2
    exit 1
fi

SOURCE_ROOT=/home/leslie/agile-dashboard
BUNDLE=${SOURCE_ROOT}/matter-controller.cjs
UNIT=${SOURCE_ROOT}/matter-controller.service

for path in "${BUNDLE}" "${UNIT}" /opt/node20/bin/node; do
    if [[ ! -e ${path} ]]; then
        echo "Missing required artifact: ${path}" >&2
        exit 1
    fi
done

getent group matter-rpc >/dev/null || groupadd --system matter-rpc
id matter-controller >/dev/null 2>&1 || useradd --system --no-create-home --shell /usr/sbin/nologin matter-controller
usermod -aG matter-rpc matter-controller
usermod -aG matter-rpc matter-gateway

install -d -m 755 /opt/matter-controller
install -m 644 "${BUNDLE}" /opt/matter-controller/matter-controller.cjs
install -m 644 "${UNIT}" /etc/systemd/system/matter-controller.service

install -d -m 755 /etc/systemd/system/matter-gateway.service.d
cat >/etc/systemd/system/matter-gateway.service.d/matter-controller.conf <<'EOF'
[Unit]
After=matter-controller.service
Wants=matter-controller.service

[Service]
SupplementaryGroups=matter-rpc
EOF

systemctl daemon-reload
systemctl enable matter-controller
systemctl restart matter-controller
systemctl restart matter-gateway
systemctl --no-pager --full status matter-controller
