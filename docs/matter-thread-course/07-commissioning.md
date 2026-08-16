# Chương 7 — Fabric, PASE, CASE và commissioning

## Mục tiêu

- hiểu secure onboarding flow
- biết BLE thiếu ở đâu
- phân biệt commissioning với normal operation

## Fabric

Fabric là miền tin cậy Matter có root CA, Fabric ID, operational credentials và ACL. Controller service đã tạo persistent fabric, nhưng chưa có peer node.

## Flow

```text
QR/manual pairing code
→ discovery
→ PASE bằng setup passcode
→ device attestation
→ cấp Thread credentials
→ node attach Thread
→ cấp operational certificate/fabric
→ CASE session
→ endpoint discovery/subscription
```

PASE dùng passcode lúc commissioning. CASE dùng certificates cho operation lâu dài.

## BLE requirement hiện tại

Thread node factory-new chưa ở IP network nên BLE thường dùng để bootstrap. BBB hiện không có BLE adapter. `commissioned_nodes: []` là đúng.

### Hướng khuyến nghị `HW`

- powered USB hub
- ESP32-C6 RCP tiếp tục ở một port
- Linux BlueZ-compatible Bluetooth 5.x USB adapter ở port khác
- thêm `@matter/nodejs-ble`
- cấu hình HCI và Thread dataset trong commissioning service

Không dùng RCP hiện tại đồng thời làm BLE HCI.

## Alternatives

- commissioner khác pair trước, sau đó multi-admin on-network
- development node pre-provision dataset rồi on-network commission

Alternative cần threat model và không thay flow production mặc định.

## Bài thực hành

Viết commissioning readiness checklist mà không ghi Network Key/passcode thật.

## Tự kiểm tra

1. PASE và CASE khác nhau thế nào?
2. Vì sao Thread node cần BLE ban đầu?
3. Fabric credential nằm ở đâu?
4. Node ID được cấp khi nào?
