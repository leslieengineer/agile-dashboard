#!/bin/bash
set -euo pipefail

if [[ ${EUID} -ne 0 ]]; then
    echo "Run with sudo: sudo bash update-webui.sh" >&2
    exit 1
fi

SOURCE=/home/leslie/agile-dashboard/webui
TARGET=/opt/matter-webui

if [[ ! -f ${SOURCE}/index.html ]]; then
    echo "Missing ${SOURCE}/index.html" >&2
    exit 1
fi

systemctl stop matter-webui
rm -rf "${TARGET:?}"/*
cp -a "${SOURCE}/." "${TARGET}/"
chown -R matter-webui:matter-webui "${TARGET}"
systemctl start matter-webui
systemctl --no-pager --full status matter-webui
