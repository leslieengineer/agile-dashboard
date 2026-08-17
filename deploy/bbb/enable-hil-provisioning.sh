#!/usr/bin/env bash
set -euo pipefail
[[ ${EUID} -eq 0 ]] || { echo 'Run with sudo' >&2; exit 1; }

SRC=/home/leslie/agile-dashboard
ENV_FILE=/etc/matter-web-auth/webui.env
BFF=/opt/matter-web-auth/webui-bff.cjs
REGISTRY_DIR=/etc/matter-provisioning
[[ -f ${SRC}/webui-bff.cjs && -f ${SRC}/devices.registry.enc && -f ${SRC}/registry.key ]] || {
    echo 'Missing staged BFF or provisioning files' >&2
    exit 1
}

cp -a "${BFF}" "${BFF}.pre-hil"
cp -a "${ENV_FILE}" "${ENV_FILE}.pre-hil"
rollback() {
    cp -a "${BFF}.pre-hil" "${BFF}"
    cp -a "${ENV_FILE}.pre-hil" "${ENV_FILE}"
    systemctl restart matter-web-auth.service || true
}
trap rollback ERR

OT_OUTPUT=$(/usr/sbin/ot-ctl dataset active -x)
DATASET=$(printf '%s\n' "${OT_OUTPUT}" |
    sed -e 's/^[[:space:]>]*//' -e 's/[[:space:]\r]//g' |
    grep -E '^[0-9a-fA-F]{32,}$' |
    head -n 1 || true)
unset OT_OUTPUT
[[ ${#DATASET} -ge 32 && $(( ${#DATASET} % 2 )) -eq 0 ]] || {
    echo 'Unable to parse active Thread dataset from ot-ctl output' >&2
    exit 1
}

install -d -m 0700 -o matter-webui -g matter-webui "${REGISTRY_DIR}"
install -m 0400 -o matter-webui -g matter-webui "${SRC}/devices.registry.enc" "${REGISTRY_DIR}/devices.registry.enc"
install -m 0400 -o matter-webui -g matter-webui "${SRC}/registry.key" "${REGISTRY_DIR}/registry.key"
printf '%s\n' "${DATASET}" | install -m 0400 -o matter-webui -g matter-webui /dev/stdin "${REGISTRY_DIR}/thread-dataset.hex"
unset DATASET

set_env() {
    local key=$1 value=$2
    if grep -q "^${key}=" "${ENV_FILE}"; then
        sed -i "s|^${key}=.*|${key}=${value}|" "${ENV_FILE}"
    else
        printf '%s=%s\n' "${key}" "${value}" >>"${ENV_FILE}"
    fi
}
set_env MOBILE_ALLOWED_ORIGINS https://localhost
set_env PROVISIONING_ENABLED true
set_env PROVISIONING_REGISTRY_PATH "${REGISTRY_DIR}/devices.registry.enc"
set_env PROVISIONING_REGISTRY_KEY_FILE "${REGISTRY_DIR}/registry.key"
set_env THREAD_DATASET_PATH "${REGISTRY_DIR}/thread-dataset.hex"
set_env PROVISIONING_TRANSACTION_PATH /var/lib/matter-web-auth/provisioning-transactions.json
set_env MATTER_SOCKET_PATH /run/matter-controller/controller.sock

usermod -a -G matter-rpc matter-webui
install -m 0644 "${SRC}/webui-bff.cjs" "${BFF}"
chown root:matter-webui "${ENV_FILE}"
chmod 0640 "${ENV_FILE}"
systemctl restart matter-controller.service matter-web-auth.service
systemctl is-active --quiet matter-controller.service matter-web-auth.service

trap - ERR
printf 'HIL provisioning enabled. Registry records: '
/opt/node20/bin/node -e "const fs=require('fs'); const v=JSON.parse(fs.readFileSync('${REGISTRY_DIR}/devices.registry.enc')); console.log(v.records.length)"
