# Chương 1 — Biên giới process, protocol và secret

## Mục tiêu

- vẽ đúng đường Browser/Mobile tới node
- biết process nào sở hữu port, credential và state
- không nhầm RCP với Matter application node

## Runtime chain

```mermaid
flowchart LR
    Client["Browser / Mobile"] -->|"HTTPS 443"| CF["Cloudflare"]
    CF -->|"HTTP 8082"| BFF
    BFF -->|"MQTT 1883"| MQ["Mosquitto"]
    MQ --> GW["Gateway"]
    GW -.->|"Unix RPC"| CTRL["Matter Controller"]
    CTRL -.->|"CASE / IPv6"| OTBR
    OTBR -->|"Spinel USB"| RCP
    RCP -.->|"Thread"| Node["Matter node"]
```

Nét đứt là đường chưa đạt real-node HIL.

## Ownership matrix

| Thành phần | Sở hữu | Không được sở hữu |
|---|---|---|
| Cloudflare | public ingress/TLS route | device state/fabric |
| BFF | web/mobile auth, REST/SSE, MQTT credential | Thread dataset |
| Mosquitto | topic ACL, message persistence | endpoint behavior |
| Gateway | validation, translation, dispatch | RCP serial |
| Controller | fabric, CASE, node session | Web cookie |
| OTBR | Thread dataset, `wpan0`, RCP | relay logic |
| RCP | 802.15.4 radio | Matter endpoint |
| Application node | endpoint, relay, local state | MQTT/Web JSON |

## Port và interface

- Public HTTPS `443`
- BFF loopback `127.0.0.1:8082`
- MQTT loopback `127.0.0.1:1883`
- MQTT WebSocket `9001` là LAN/legacy path
- Static WebUI `8080` là legacy/rollback path
- Controller RPC `/run/matter-controller/controller.sock`
- OTBR ↔ RCP dùng Spinel HDLC UART 460800

## Invariants

- Chỉ `otbr-agent` mở RCP.
- Browser/Mobile không truy cập Controller socket.
- Commissioning secret không đi qua MQTT.
- Gateway lỗi không được làm mất local relay control.

## Bài thực hành

```bash
ss -ltnp                                      # QS
sudo fuser -v /dev/ttyUSB0                    # QS
systemctl show matter-controller -p User,Group,StateDirectory,RuntimeDirectory  # QS
```

## Checkpoint

Hoàn thành khi bạn giải thích được vì sao Gateway không được mở USB RCP và BFF không được đọc fabric storage.
