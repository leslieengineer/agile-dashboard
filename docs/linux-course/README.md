# Linux qua dự án BeagleBone Smart Home Gateway

Khóa học này giải thích Linux từ góc nhìn thực hành trên chính BeagleBone Black đang chạy OTBR, MQTT, Node.js gateway và WebUI. Mỗi chương trả lời hai câu hỏi: cần chạy lệnh gì và Linux làm gì bên dưới khi lệnh đó chạy.

## Ký hiệu an toàn

- `QS` là quan sát, không chủ ý thay đổi hệ thống
- `TĐ` là thay đổi package, file, service, network hoặc quyền

Luôn đọc và hiểu lệnh TĐ trước khi nhập sudo. Password chỉ nhập tại prompt, không đưa vào command line hoặc file lịch sử.

## Bản đồ chương

### Phần I — Nền tảng

1. [Cách học và hai máy](00-huong-dan-hoc.md)
2. [Kernel, userspace và Debian](01-linux-kernel-userspace.md)
3. [Shell, SSH, PATH và environment](02-shell-ssh-env.md)
4. [Filesystem và lưu trữ](03-filesystem.md)
5. [User, group, permission và sudo](04-user-permission-sudo.md)
6. [Process, signal và tài nguyên](05-process-signal.md)

### Phần II — Quản trị hệ thống

7. [apt, package và build source](06-package-build.md)
8. [Network, interface, route và port](07-network.md)
9. [systemd, service và journald](08-systemd-journal.md)
10. [Hardening và secrets](09-hardening.md)

### Phần III — Linux cho IoT Gateway

11. [USB serial, udev và dialout](10-usb-udev.md)
12. [ESP32-C6 RCP, Spinel và OTBR](11-otbr-thread.md)
13. [Triển khai MQTT, gateway và WebUI](12-deploy-stack.md)
14. [Gỡ lỗi và phục hồi](13-troubleshooting.md)

### Phụ lục

- [Lệnh Linux thường dùng](phu-luc-lenh.md)
- [Bài lab thực hành](phu-luc-lab.md)
- [Từ điển thuật ngữ](99-thuat-ngu.md)

## Trạng thái thật của hệ thống

- BBB là Debian 11 `armv7l`, Node 20 production ở `/opt/node20`
- ESP32-C6 USB RCP trả lời Spinel ở 460800 baud
- OTBR active/enabled; mạng `OpenThread-0a76` channel 14 PAN `0x0a76` ở role leader
- Thread tự phục hồi sau restart và full reboot
- Mosquitto auth/ACL, gateway và WebUI chạy systemd
- Matter.js 0.17.9 Controller active với persistent storage và Unix RPC
- chưa có BLE adapter/application node; commissioned node list rỗng
- gateway vẫn `CONTROLLER_MODE=mock` đến khi real-node HIL đạt

## Hệ thống thực tế

- [Linux Gateway as-built](../full-context/10-linux-gateway-as-built.md)

## Khóa liên quan

- [Lập trình Web](../web-course/README.md)
- [Matter và Thread](../matter-thread-course/README.md)
- [Production Platform: Auth, API và Vận hành](../platform-course/README.md)
