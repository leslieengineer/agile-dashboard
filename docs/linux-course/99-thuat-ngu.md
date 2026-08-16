# Từ điển thuật ngữ Linux

| Thuật ngữ | Giải thích |
|---|---|
| ACL | Danh sách quyền chi tiết cho tài nguyên hoặc MQTT topic |
| apt | Công cụ quản lý package cấp cao của Debian |
| armv7l | Kiến trúc ARM 32-bit của BBB |
| bash | Shell phổ biến trên Linux |
| bind | Gắn socket vào address và port |
| capability | Chia nhỏ một phần quyền root cho process |
| CDC ACM | USB class thường tạo `/dev/ttyACM*` |
| cgroup | Cơ chế kernel nhóm và giới hạn tài nguyên process |
| daemon | Process nền cung cấp dịch vụ lâu dài |
| dialout | Group thường được cấp quyền serial |
| dpkg | Công cụ/database package `.deb` cấp thấp |
| environment | Key/value process cha truyền cho process con |
| exit code | Số process trả khi kết thúc |
| file descriptor | Số đại diện file/socket/device đang mở trong process |
| filesystem | Cấu trúc lưu và đặt tên file |
| foreground | Process đang gắn với terminal và nhận input trực tiếp |
| group | Tập identity dùng để chia sẻ quyền |
| HDLC | Framing byte stream dùng với Spinel |
| inode | Metadata object của filesystem |
| interface | Điểm kernel nối packet với network |
| journal | Kho log do systemd-journald quản lý |
| kernel | Lõi quản lý hardware, process, memory, filesystem và network |
| mount | Gắn filesystem vào một điểm trong cây `/` |
| namespace | Cơ chế cô lập view process, mount, network hoặc device |
| OOM killer | Cơ chế kernel kill process khi cạn memory nghiêm trọng |
| OTBR | OpenThread Border Router chạy trên Linux host |
| PATH | Danh sách directory shell dùng tìm executable |
| PID | Process identifier |
| process | Một instance chương trình đang chạy |
| RCP | Radio Co-Processor, firmware radio giao tiếp host bằng Spinel |
| route | Quy tắc chọn next hop cho packet |
| service | Workload lâu dài được systemd quản lý |
| signal | Thông báo bất đồng bộ gửi tới process |
| socket | Endpoint giao tiếp network hoặc local IPC |
| Spinel | Protocol giữa OpenThread host và RCP |
| sudo | Chạy command với identity/quyền khác theo policy |
| symlink | File chứa đường dẫn tới file khác |
| systemd | Init và service manager, thường là PID 1 |
| target | Unit systemd nhóm trạng thái/dependency |
| tty | Abstraction terminal/serial trong Unix |
| udev | Userspace device manager tạo tên và symlink trong `/dev` |
| UID/GID | ID số của user/group |
| umask | Mask permission mặc định khi tạo file |
| unit | Đối tượng cấu hình systemd |
| userspace | Mọi process ngoài kernel |
| wpan0 | Interface network Thread do OpenThread host tạo |
