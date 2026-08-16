# BeagleBone Black deployment

## Ownership boundary

`otbr-agent` is the only process allowed to open the ESP32-C6 RCP device. The Node.js gateway never opens `/dev/ttyUSB0`; it exchanges application commands through MQTT and a `MatterController` implementation. `PrivateDevices=yes` in the systemd unit enforces this boundary.

## Prerequisites

- Node.js 20 or newer
- Mosquitto with WebSocket support
- OpenThread Border Router tools and `otbr-agent`
- ESP32-C6 flashed with the ESP-IDF `ot_rcp` example
- A commissioned Thread dataset on the BBB

Configure OTBR for the RCP. The exact configuration location depends on the BBB distribution. A representative radio URL is:

```text
spinel+hdlc+uart:///dev/ttyUSB0?uart-baudrate=460800
```

Use a udev symlink such as `/dev/ttyRCP` in production so USB re-enumeration does not change the device name.

## Install

The BBB installer expects the built artifacts under `/home/leslie/agile-dashboard` and performs an idempotent Mosquitto, Node runtime, gateway and WebUI installation.

```bash
sudo bash /home/leslie/agile-dashboard/install-production.sh
```

It installs Node at `/opt/node20`, gateway at `/opt/matter-gateway`, WebUI at `/opt/matter-webui`, and service configuration under `/etc`. It generates separate Mosquitto users with restricted ACLs. WebUI login details are written to `/home/leslie/agile-dashboard/webui-login.txt` with mode `0600`.

After installation, verify `mosquitto`, `matter-gateway`, `matter-webui`, and `otbr-agent` are active and enabled. The current WebUI server is a systemd-managed Python static server for the trusted LAN; use a production HTTPS server and WSS before external exposure.

Verify that OTBR alone owns the RCP:

```bash
sudo systemctl status otbr-agent
sudo ot-ctl state
sudo fuser -v /dev/ttyUSB0
```

Matter.js 0.17.9 Controller service and the Unix-RPC gateway adapter are installed, but keep `CONTROLLER_MODE=mock` until an ESP32-C6 application node is commissioned and real invoke/subscription HIL tests pass. See `docs/matter-thread-course/10-cutover-debugging.md`. The adapter uses Matter over the OTBR network interface and never sends application JSON to the RCP UART.
