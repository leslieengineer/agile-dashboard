# Matter.js Controller Service

## Trạng thái

- matter.js version `0.17.9` được pin
- Node.js requirement `20.19+`, BBB đang dùng `20.20.2`
- service `matter-controller.service` active/enabled
- persistent state tại `/var/lib/matter-controller`
- Unix socket tại `/run/matter-controller/controller.sock`
- system user `matter-controller`
- shared socket group `matter-rpc`
- gateway user thuộc `matter-rpc`
- BLE chưa enable vì BBB chưa có adapter
- commissioned node list hiện trống

## Process boundary

```text
matter-gateway
  → JSON lines over Unix socket
  → matter-controller
  → Matter.js fabric/session/subscription
  → IPv6/UDP through OTBR network
```

Gateway không import Matter SDK. Điều này cô lập lifecycle, storage migration, mDNS và fabric credentials khỏi MQTT process.

## RPC methods

### health

Trả readiness, implementation version và commissioned node IDs.

### listNodes

Trả operational Node IDs đã commission.

### invoke

Nhận normalized command

```json
{
  "node_id": "0x0000000000000001",
  "endpoint": 1,
  "cluster": 6,
  "command": 1,
  "payload": {}
}
```

Mapping hiện implement OnOff, phần cơ bản LevelControl và WindowCovering. VendorCooktop chưa implement vì production vendor cluster chưa được freeze.

## Gateway mode

Gateway hỗ trợ

```text
CONTROLLER_MODE=mock
CONTROLLER_MODE=matterjs
```

Production hiện vẫn để `mock` cho tới khi có ESP32-C6 application node. Khi chuyển `matterjs`, gateway startup gọi RPC health; nếu controller/socket không ready thì gateway fail và systemd retry.

## Startup readiness

Systemd `Type=simple` xem process active ngay sau exec, trong khi Matter.js cần vài giây để mở storage, mDNS, fabric và socket. Health probe có retry `ENOENT`/`ECONNREFUSED` trong 10 giây để tránh race sau restart.

## Persistence và security

- controller storage không nằm trong repository
- fabric credentials không được log hoặc MQTT publish
- service user không login
- StateDirectory/RuntimeDirectory do systemd quản lý
- socket mode 0660 và group matter-rpc
- gateway chỉ thấy socket, không đọc storage
- `ProtectHome=yes`, `PrivateDevices=yes`

## Version/migration warning

Matter.js controller API đang chuyển từ legacy `CommissioningController` sang ClientNode API. Service pin `0.17.9` và dùng full-featured CommissioningController. Không nâng major/minor tự động. Trước upgrade cần đọc migration guide, backup `/var/lib/matter-controller` và có kế hoạch recommission nếu storage format không tương thích.

## Chưa hoàn thành

- BLE transport package/adapter
- commission command qua RPC
- attribute/event forwarding về gateway
- reconnect/subscription restore HIL test
- custom vendor cluster
- Matter Controller certification assessment
