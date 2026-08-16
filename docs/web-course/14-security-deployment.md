# Chương 14 — Bảo mật và triển khai

## Mục tiêu

- nhận biết trust boundary của ứng dụng Web
- hiểu authentication, authorization, TLS và validation
- đọc cấu hình Mosquitto và systemd

## Browser không giữ được secret

JavaScript, request và biến `VITE_*` đều đến máy người dùng. WebUI production nhập MQTT credential lúc runtime và chỉ giữ trong tab memory. Nó vẫn là credential client quyền hẹp, không phải secret quản trị.

Credential browser phải được broker ACL giới hạn đúng topic.

## Authentication và authorization

- authentication trả lời bạn là ai
- authorization trả lời bạn được làm gì

`deploy/mosquitto/aclfile` cho gateway đọc TX và ghi RX, còn WebUI ghi TX và đọc RX. Không cấp wildcard `#` nếu không cần.

## TLS

MQTT TCP nội bộ có thể dùng loopback. WebSocket qua mạng nên dùng WSS để mã hóa credential và payload. TLS không thay thế authorization.

## Input validation

Mọi ranh giới ngoài hệ thống cần validation

- kích thước message
- JSON syntax
- envelope schema
- cluster và command hợp lệ
- payload range
- node có tồn tại

Validation không chỉ chống tấn công. Nó còn ngăn bug lan sâu vào hệ thống.

## Logging an toàn

Không log password, token hoặc dữ liệu nhạy cảm. Pino được cấu hình redact. Client chỉ nhận error public; stack trace ở log nội bộ.

## Build và serve frontend

Production flow

```bat
npm run build
```

Sau build, server tĩnh phục vụ `apps/webui/dist`. Không dùng Vite dev server làm production server.

## systemd cho gateway

Production có `matter-gateway`, `matter-webui`, `matter-controller`, Mosquitto và OTBR units. Gateway unit cung cấp

- user không đặc quyền
- environment file riêng
- restart khi lỗi
- phụ thuộc network và broker
- memory limit
- filesystem protection
- `PrivateDevices=yes`

`PrivateDevices` củng cố kiến trúc OTBR sở hữu RCP, gateway không mở serial.

## Availability và observability

Một dịch vụ production cần biết

- process còn chạy không
- broker kết nối không
- gateway online không
- request latency bao nhiêu
- error rate thế nào
- disk và memory còn đủ không

Retained status và structured log là bước đầu. Hệ lớn hơn có metrics và alert.

## Demo khác production

Production hiện dùng Mosquitto authentication/ACL và năm systemd services, đã kiểm tra full reboot. Aedes chỉ còn trong test. WebUI vẫn phục vụ HTTP và MQTT WebSocket chưa có TLS, nên chỉ dùng trusted LAN; HTTPS/WSS là bước hardening còn lại.

## Bài thực hành

1. Giải thích từng dòng ACL.
2. Tìm các hardening option trong systemd unit.
3. Thử thêm field lạ vào command và quan sát validation.
4. Viết checklist trước khi mở cổng 9001 ra Internet.

## Tự kiểm tra

1. Tại sao VITE password không phải secret?
2. Authentication khác authorization thế nào?
3. TLS có thay ACL không?
4. Vì sao service gateway không nên chạy bằng root?
