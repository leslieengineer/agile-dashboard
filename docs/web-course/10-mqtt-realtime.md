# Chương 10 — Bất đồng bộ và MQTT realtime

## Mục tiêu

- hiểu publish, subscribe, topic, QoS và retained message
- đọc luồng mqtt.js trong browser
- hiểu correlation, reconnect và timeout

## Publish và subscribe

Publisher gửi message tới topic. Subscriber đăng ký topic và nhận message. Hai phía không cần biết địa chỉ trực tiếp của nhau, chỉ cần cùng broker và topic.

Dự án dùng

- `home/control/tx` cho command
- `home/control/rx` cho response và event
- `home/control/status` cho availability

## QoS

- QoS 0 giao tối đa một lần
- QoS 1 giao ít nhất một lần, có thể trùng
- QoS 2 giao chính xác một lần với chi phí cao hơn

Command dùng QoS 1. Vì message có thể trùng, hệ thống production cần idempotency hoặc deduplication bằng `request_id`.

## Retained và Last Will

Retained message lưu giá trị cuối tại broker để subscriber mới nhận ngay. Gateway status phù hợp retained, command điều khiển không nên retained.

Last Will được broker publish nếu client mất kết nối bất thường. Xem `packages/gateway/src/mqtt/client.ts`.

## mqttClient trong WebUI

`apps/webui/src/services/mqttClient.ts` đảm nhiệm

1. connect WebSocket
2. subscribe RX khi kết nối
3. tạo UUID cho command
4. lưu Promise pending theo request ID
5. publish TX
6. parse response/event
7. resolve đúng Promise
8. timeout nếu không có response

## Runtime login

`MqttLogin.vue` nhận WebSocket URL, username và password khi chạy. Password chỉ ở memory của tab, không cần bundle vào JavaScript hoặc localStorage. `VITE_*` chỉ là default cho development.

Mosquitto production tắt anonymous và ACL tách user `webui` với `gateway`. Sai credential tạo connection error; user có thể nhập lại mà không rebuild WebUI.

## Correlation

Nhiều command có thể đang chờ cùng lúc. Không thể đơn giản resolve request gần nhất. `Map<request_id, pending>` bảo đảm response quay về đúng caller.

## Reconnect

mqtt.js tự reconnect sau 2000 ms. Sau reconnect, event `connect` chạy lại và subscribe lại topic. UI phải phân biệt socket MQTT đang connected với gateway đang online. Phiên bản hiện tại badge chỉ phản ánh socket, chưa subscribe status topic.

## Message không đáng tin

Dữ liệu MQTT phải được coi là input ngoài hệ thống. WebUI dùng Zod parse response. Gateway kiểm tra kích thước, JSON, envelope, ID và payload trước khi invoke.

## Bài thực hành

1. Dùng DevTools xem frame TX và RX.
2. Đặt timeout thành 1 ms và quan sát Promise reject.
3. Subscribe `home/control/status` trong WebUI.
4. Hiển thị riêng `brokerConnected` và `gatewayOnline`.
5. Thử credential sai rồi đăng nhập lại; giải thích Mosquitto ACL tách user webui/gateway.

## Tự kiểm tra

1. Topic khác URL thế nào?
2. Tại sao command không nên retained?
3. QoS 1 có thể gây vấn đề gì?
4. Correlation ID giải quyết trường hợp nào?
