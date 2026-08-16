# Matter Smart Home Gateway

A modular Vue and Node.js gateway for Matter-shaped commands over MQTT. The production platform includes OTBR, authenticated Mosquitto, systemd services and a pinned Matter.js Controller. Gateway control remains in mock mode until a real Matter application node is commissioned and HIL-tested.

## Architecture

```text
Vue 3 + Pinia + mqtt.js
        | WebSocket :9001
        v
     Mosquitto <---- TCP :1883 ----> Node.js gateway
                                        |
                                 CommandRegistry
                                        |
                                MatterController
                                  |           |
                           mock (active) Matter.js service
                                                |
                                          OTBR on BBB
                                                |
                                  Spinel USB by-id path
                                                |
                                          ESP32-C6 RCP
```

The ESP32-C6 is an OpenThread Radio Co-Processor. It is not a JSON serial bridge. `otbr-agent` exclusively owns the stable `/dev/serial/by-id/...` device; application commands are translated into Matter controller calls above the Thread network interface.

## Packages

- `packages/contracts` contains shared Zod envelopes, Matter IDs and per-command payload schemas.
- `packages/gateway` contains the MQTT dispatcher, cluster registry and `MatterController` abstraction.
- `packages/matter-controller` contains the Matter.js service and Unix RPC server.
- `apps/webui` contains the Vue 3, TailwindCSS and Pinia dashboard.
- `deploy` contains Mosquitto ACL and systemd templates for the BBB.

## Development

Requirements are Node.js 20.11 or newer and npm.

```text
npm install
npm run build -w @agile/contracts
npm run typecheck
npm test
npm run build
```

Start an MQTT broker with TCP on 1883 and WebSockets on 9001, then run these in separate terminals:

```text
npm run dev:gateway
npm run dev:webui
```

The gateway requires `MQTT_USERNAME` and `MQTT_PASSWORD`. Copy `.env.example` values into the process environment; Vite only exposes variables prefixed with `VITE_`.

## Command model

```json
{
  "request_id": "11111111-1111-4111-8111-111111111111",
  "node_id": "0x0000000000000001",
  "endpoint": 1,
  "cluster": "OnOff",
  "command": "On",
  "payload": {}
}
```

The canonical internal form uses numeric Matter IDs. Symbolic names are accepted at the MQTT boundary and resolved before dispatch. `node_id` is normalized to a 64-bit hexadecimal string to avoid JavaScript integer precision loss.

## Add a cluster

1. Add IDs and Zod payload schemas under `packages/contracts/src`.
2. Add a cluster module under `packages/gateway/src/clusters`.
3. Register it in `packages/gateway/src/clusters/index.ts`.
4. Add a WebUI widget only if the cluster needs a dedicated control.

MQTT routing and the controller interface do not change. `VendorCooktop` demonstrates a manufacturer-specific cluster and requires an explicit `vendor_id`.

## MQTT topics

- Commands `home/control/tx`
- Responses and attribute events `home/control/rx`
- Retained gateway availability `home/control/status`

The WebUI accepts MQTT credentials at runtime and keeps them only in the current tab's memory. Browser credentials are still visible to the browser and must be restricted by Mosquitto ACL. Use HTTPS/WSS before exposing the Dashboard outside a trusted network.

## Documentation

Start at [`docs/00-huong-dan-he-thong-hien-tai.md`](docs/00-huong-dan-he-thong-hien-tai.md) for a beginner-friendly walkthrough, then use [`docs/README.md`](docs/README.md) for the courses and technical handoff context.
