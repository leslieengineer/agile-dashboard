# Chương 6 — Interaction Model và state

## Mục tiêu

- hiểu invoke/read/write/subscribe
- nối Matter reports với MQTT events
- tránh UI tự đoán state

## Operations

- Invoke gửi command
- Read đọc attribute/event theo path
- Write ghi writable attribute
- Subscribe tạo quan hệ report lâu dài

Path thường gồm node, endpoint, cluster và attribute/command/event.

## Luồng hiện tại

Gateway envelope có `node_id`, `endpoint`, `cluster`, `command`, `payload`. Matter adapter chuyển nó thành Invoke.

Matter node update attribute. Controller subscription nhận report. Gateway normalize report thành `MatterEvent` và WebUI merge vào Pinia.

Phần forwarding subscription từ Matter.js sang gateway còn chưa hoàn thành; mock hiện emit event trực tiếp.

## Response không phải state duy nhất

Command có thể accepted nhưng actuator sau đó fault. Local button có thể thay state không qua WebUI. Vì vậy UI phải tin read/subscription report, không chỉ optimistic toggle.

## QoS và idempotency

MQTT QoS1 có thể giao command trùng. Matter command cũng có semantic riêng. Gateway cần deduplicate request ID hoặc command phải idempotent/safety protected.

## Bài thực hành

Theo một On command và đánh dấu invoke response, attribute update, subscription report và MQTT event.

## Tự kiểm tra

1. Invoke response có thay thế subscription không?
2. Local button đi vào WebUI bằng đường nào?
3. Read khác Subscribe thế nào?
4. QoS1 tạo rủi ro gì?
