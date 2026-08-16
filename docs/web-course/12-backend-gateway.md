# Chương 12 — Backend Node.js, registry và controller

## Mục tiêu

- hiểu composition root và dependency injection đơn giản
- đọc pipeline xử lý một message
- hiểu Registry và Controller abstraction giúp mở rộng ra sao

## Composition root

`packages/gateway/src/main.ts` là nơi lắp ứng dụng.

1. load config
2. tạo logger
3. tạo command registry
4. tạo controller
5. kết nối MQTT
6. nối event handler
7. subscribe command topic
8. cài graceful shutdown

Business logic không nên tự tạo dependency rải rác. Việc lắp ở một nơi giúp test thay controller hoặc publisher bằng fake.

## Config

`config.ts` đọc `process.env` qua Zod. Chương trình fail fast khi thiếu credential hoặc giá trị sai. Fail ngay lúc startup tốt hơn chạy nửa đúng rồi hỏng khi có command.

Config cũng từ chối biến serial trỏ `/dev/tty`. Đây là ranh giới kiến trúc. OTBR sở hữu RCP, gateway application không tranh UART.

## Dispatcher pipeline

`mqtt/dispatcher.ts` xử lý theo thứ tự

1. giới hạn byte
2. parse JSON
3. validate envelope
4. resolve cluster và command
5. normalize node ID
6. tìm handler
7. validate payload riêng
8. gọi controller với timeout
9. publish response

Mỗi lớp validation tạo error code cụ thể. Client có thể xử lý máy móc thay vì parse câu error.

## Registry pattern

`CommandRegistry` dùng key `cluster:command`. Mỗi cluster đăng ký danh sách handler. Khi thêm cluster mới, dispatcher không đổi.

Đây là nguyên tắc open/closed ở mức thực dụng. Module mở cho mở rộng nhưng code trung tâm hạn chế sửa đổi.

## Controller abstraction

`MatterController` định nghĩa lifecycle, `invoke` và event. Hiện có `MockMatterController` và `MatterJsController`.

MatterJsController không import SDK. Nó gọi long-lived Matter.js service qua JSON-lines Unix socket, kiểm tra health lúc startup và dùng UUID correlation/timeout. `CONTROLLER_MODE` chọn implementation; production vẫn mock khi node list rỗng.

Chi tiết nằm trong [khóa Matter/Thread](../matter-thread-course/09-rpc-gateway.md).

## EventEmitter

Mock controller phát attribute event. Main subscribe event rồi publish MQTT RX. Response trả lời một request, còn event mô tả thay đổi state có thể không bắt nguồn từ WebUI hiện tại.

## Error handling và logging

`GatewayError` chứa code và details. Unknown exception được đổi thành `INTERNAL` để không rò stack trace ra client. Pino log JSON với request context và redact field password.

## Graceful shutdown

SIGTERM từ systemd yêu cầu process dừng. Gateway publish offline, đóng MQTT và controller. Shutdown có trật tự tránh mất message hoặc giữ socket zombie.

## Bài thực hành

1. Vẽ pipeline dispatcher bằng flowchart.
2. Thêm command giả vào registry và xác nhận dispatcher không đổi.
3. Tạo node ID không tồn tại để nhận `NODE_UNKNOWN`.
4. Đặt mock latency lớn hơn timeout để nhận `TIMEOUT`.

## Tự kiểm tra

1. Composition root giải quyết vấn đề gì?
2. Vì sao validation có nhiều tầng?
3. Registry tốt hơn switch lớn trong trường hợp nào?
4. Tại sao không gửi stack trace về browser?
