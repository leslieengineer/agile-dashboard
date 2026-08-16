#!/bin/bash
set -euo pipefail

CREDENTIALS=/home/leslie/agile-dashboard/webui-login.txt
if [[ ! -r ${CREDENTIALS} ]]; then
    echo "Missing ${CREDENTIALS}" >&2
    exit 1
fi

# shellcheck disable=SC1090
source "${CREDENTIALS}"
export MQTT_URL=${URL}
export MQTT_USERNAME=${USERNAME}
export MQTT_PASSWORD=${PASSWORD}
exec /opt/node20/bin/node /home/leslie/agile-dashboard/verify.cjs 127.0.0.1
