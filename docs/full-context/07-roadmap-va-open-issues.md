# Roadmap và Open Issues

## Phase 0 — Web/Gateway mock

Trạng thái hoàn thành.

- contract package
- Vue Dashboard
- Pinia realtime state
- MQTT bridge
- command registry
- mock controller
- tests và build

## Phase 1 — Thread infrastructure và platform services

Trạng thái hoàn thành cho MVP.

- `otbr-agent` active/enabled, `wpan0` UP với IPv6
- Thread network `OpenThread-0a76` ở role leader
- restart service và full BBB reboot đều tự phục hồi leader
- Mosquitto production active/enabled với authentication và ACL
- Node gateway active/enabled từ `/opt/node20`
- WebUI service active/enabled tại port 8080
- authenticated MQTT end-to-end test đạt sau reboot

Exit criteria

- RCP owner chỉ là otbr-agent
- Thread role hợp lệ
- reboot BBB tự phục hồi services
- health check và logs rõ

## Phase 2 — Matter Controller

Trạng thái đang thực hiện với Matter.js 0.17.9.

Đã hoàn thành

- long-lived controller service trên BBB ARMv7
- persistent fabric storage
- systemd sandbox và Unix RPC socket
- gateway `matterjs` adapter
- health/list/invoke RPC boundary
- OnOff, LevelControl cơ bản và WindowCovering mapping

Còn lại

- BLE adapter/commissioning RPC
- node inventory metadata
- attribute/event forwarding
- Matter status mapping chi tiết
- subscription restore và integration tests với node thật

## Phase 3 — Smart switch node MVP

- ESP32-C6 Matter-over-Thread firmware
- OnOff endpoint
- optional LevelControl nếu hardware hỗ trợ
- local button
- attribute reporting
- commissioning/factory reset
- OTA skeleton
- HIL acceptance

Đây là node đầu tiên nên tích hợp vì risk thấp hơn motor và cooktop.

## Phase 4 — Window covering

- motor driver và calibration
- limit/obstruction safety
- position model
- standard cluster conformance
- long-running command/report behavior

## Phase 5 — Cooktop prototype

Chỉ bắt đầu sau hazard analysis và production vendor identity.

- đánh giá standard clusters có thể dùng
- vendor cluster specification versioned
- independent safety controller/interlock
- thermal/current sensing
- compliance plan

## Open issues cần owner và deadline nội bộ

| ID | Vấn đề | Owner đề xuất |
|---|---|---|
| OI-01 | Chọn Matter Controller SDK/service trên BBB armv7 | Gateway |
| OI-02 | Node inventory/fabric storage format | Gateway |
| OI-03 | ESP-IDF/ESP-Matter pinned version | Firmware |
| OI-04 | Production VID/PID và attestation | Product/Security |
| OI-05 | Device type/endpoint map mỗi SKU | Firmware + Gateway |
| OI-06 | Attribute/command naming map SDK ↔ JSON | Gateway |
| OI-07 | OTA signing/provisioning | Firmware/Security |
| OI-08 | WSS certificate và browser auth | Platform |
| OI-09 | Cooktop safety/compliance scope | Product/Safety |
| OI-10 | Node offline/timeout UX | Web/Gateway |
| OI-11 | Duplicate QoS1 command policy | Gateway/Firmware |
| OI-12 | Production Node runtime path/systemd fix | Platform |

## Contract freeze gate

Không freeze firmware interface chỉ từ MockMatterController. Freeze sau khi

1. Matter device types được chọn
2. ESP-Matter endpoint composition compile được
3. Controller discover/read thử thành công
4. command payload map tới SDK types
5. node team và gateway team review
6. test vector được lưu

## Definition of done toàn hệ thống

- node thật commission và điều khiển qua Matter
- local state change cập nhật Web realtime
- reboot BBB/node tự phục hồi
- security credentials không lộ
- services production chạy systemd
- observability đủ chẩn đoán từng boundary
- tests tự động và HIL evidence đạt
- documentation/runbook cập nhật theo release
