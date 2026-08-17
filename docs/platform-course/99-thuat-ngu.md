# Thuật ngữ Production Platform

| Thuật ngữ | Ý nghĩa |
|---|---|
| BFF | Backend for Frontend, giữ auth và MQTT credential thay cho browser/mobile |
| Reverse tunnel | Kết nối outbound từ BBB tạo public ingress mà không mở inbound port trực tiếp |
| CSRF | Tấn công ép browser có cookie gửi request ngoài ý muốn; chống bằng token và Origin |
| CORS | Chính sách browser kiểm soát cross-origin request |
| Bearer token | Credential ai sở hữu token thì có quyền dùng session |
| Digest | Giá trị hash dùng đối chiếu token mà không lưu raw token |
| SSE | Server-Sent Events, stream một chiều HTTP từ server tới client |
| Correlation ID | ID nối command request với response/event |
| Scrypt | Password hashing function có cost CPU/memory |
| X25519 | Elliptic-curve key agreement dùng tạo shared secret |
| HKDF | Key derivation function tạo key theo context |
| AEAD | Encryption đồng thời bảo mật và kiểm tra toàn vẹn |
| PASE | Matter password-authenticated session establishment |
| CASE | Matter certificate-authenticated operational session |
| Multi-Admin | Thêm thiết bị Matter vào fabric/controller khác |
| RCP | Radio Co-Processor, chỉ cung cấp radio OpenThread cho host |
| Migration gate | Bộ acceptance bắt buộc trước khi xóa đường rollback cũ |
| Blast radius | Phạm vi thành phần bị ảnh hưởng khi một service lỗi |
