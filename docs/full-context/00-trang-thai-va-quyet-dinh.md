# Trạng thái và quyết định

Cập nhật ngày 2026-08-16.

## Đã hoàn thành

### WebUI

- Vue 3 + Vite + TypeScript
- TailwindCSS và responsive Dashboard
- Pinia stores cho connection, devices và activity
- mqtt.js qua WebSocket
- widget OnOff, LevelControl, WindowCovering và Cooktop
- correlation bằng `request_id`
- validation response/event bằng Zod

### Gateway mock

- Node.js MQTT bridge
- topic `home/control/tx`, `home/control/rx`, `home/control/status`
- envelope validation và giới hạn 8 KiB
- cluster/command registry mở rộng theo module
- controller abstraction
- MockMatterController phát response và attribute event
- structured JSON logging
- timeout và typed error model

### Chất lượng

- TypeScript strict
- 10 test qua 5 test files
- integration test dùng authenticated in-process MQTT broker
- production build WebUI/gateway/contracts thành công

### BBB và Thread RCP

- BBB Debian 11 `armv7l`
- SSH key-based access hoạt động
- Node.js 20.20.2 được cài user-local
- ESP32-C6 RCP đã build lại với `CONFIG_OPENTHREAD_RCP_USB_SERIAL_JTAG=y`
- USB RCP ở `/dev/serial/by-id/usb-Espressif_USB_JTAG_serial_debug_unit_98:A3:16:AA:96:9C-if00`
- Pyspinel đọc được version RCP ở 460800 baud
- source OTBR được build và cài trên BBB
- `otbr-agent` đã enable và active
- OTBR nhận đúng RCP version, khởi tạo Border Agent/Backbone Router/TREL
- Thread Operational Dataset đã được tạo và commit, không lưu Network Key trong repository
- Thread network `OpenThread-0a76`, channel 14, PAN ID `0x0a76`
- BBB đạt role `leader`
- `wpan0` đang `UP/LOWER_UP` và có IPv6 Thread/OMR addresses

- restart `otbr-agent` giữ dataset, tự attach lại và trở về role `leader`

- full BBB reboot tự phục hồi OTBR leader, Mosquitto, Gateway và WebUI
- Mosquitto TCP chỉ bind loopback 1883; authenticated WebSocket listen 9001
- Gateway/WebUI chạy bằng systemd users không đặc quyền
- authenticated MQTT end-to-end test đạt sau reboot
- WebUI dùng runtime login, không cần bundle password

- Matter.js 0.17.9 Controller service active/enabled trên BBB ARMv7
- persistent fabric storage và Unix RPC health đã xác nhận
- gateway có `matterjs` adapter nhưng vẫn chạy mock khi chưa có node

## Đang thực hiện

- bổ sung BLE adapter và ESP32-C6 application node để commissioning
- kiểm thử invoke/subscriptions với node thật rồi chuyển gateway sang `CONTROLLER_MODE=matterjs`
- thay Python static server/HTTP bằng HTTPS/WSS production frontend serving khi ra ngoài LAN

Chưa đánh dấu các mục này hoàn thành cho tới khi có output verification.

## Chưa thực hiện

- Matter Controller SDK/service thật trên BBB
- commissioning một ESP32-C6 application node
- mapping registry tới Matter invoke/read/subscribe thật
- persistent fabric credentials và node inventory
- WSS/TLS cho browser MQTT
- production vendor ID và vendor cluster specification
- OTA, diagnostics, recovery và manufacturing provisioning cho nodes

## Quyết định đã chốt

1. BBB là Linux Gateway và OpenThread Border Router host.
2. ESP32-C6 chuyên dụng làm RCP qua USB Spinel.
3. Application nodes là Matter-over-Thread devices riêng.
4. Node firmware không biết MQTT topic hoặc WebUI JSON.
5. Gateway không mở RCP serial; `otbr-agent` sở hữu độc quyền.
6. Contract Web dùng Node ID 64-bit dạng hex string.
7. Numeric Matter IDs là canonical; tên symbolic chỉ dùng tại biên Web.
8. Bản đầu chạy mock để phát triển frontend/backend độc lập phần cứng.

## Giả định cần xác nhận với nhóm node

- ESP-IDF và ESP-Matter version được pin
- board variant và antenna
- actuator/sensor pinout
- nguồn điện và brownout behavior
- endpoint composition mỗi SKU
- standard device type tương ứng
- commissioning method và QR/manual code
- factory reset gesture
- OTA transport và signing
- fail-safe behavior của bếp/rèm/công tắc
