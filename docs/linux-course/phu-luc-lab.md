# Phụ lục — Bài lab thực hành

## Lab 1 — Inventory BBB chỉ đọc

Mục tiêu là tạo báo cáo gồm OS, architecture, CPU, RAM, disk, interfaces, routes, listening ports và failed units. Chỉ dùng lệnh QS. Lưu kết quả và giải thích mỗi trường.

Tiêu chí hoàn thành là chỉ ra được vì sao Node x64 không dùng được và resource nào giới hạn OTBR build.

## Lab 2 — Theo một process

Chạy `sleep 300`, tìm PID/PPID, xem `/proc/PID/status`, file descriptor và memory. Gửi SIGTERM rồi đọc exit status.

Không dùng SIGKILL trừ khi lab yêu cầu so sánh và không có dữ liệu cần cleanup.

## Lab 3 — Permission sandbox

Tạo file trong home với mode 600. Tạo group lab, đổi group/mode để một user thử có thể đọc mà other không đọc. Dùng `namei -l` giải thích toàn path.

Hoàn tác bằng xóa file thử và group lab nếu không còn dùng.

## Lab 4 — Unit systemd tối giản

Viết unit chạy `/bin/sleep 30`, start, xem journal và stop. Sau đó cố ý đổi ExecStart sang path không tồn tại để quan sát `203/EXEC`.

Không thử trực tiếp trên unit production.

## Lab 5 — USB RCP inventory

Dùng `lsusb`, `udevadm`, `readlink`, `ls -l`, `groups` và `fuser` để viết một báo cáo từ USB ID tới process owner. Không gửi byte ngẫu nhiên vào RCP.

## Lab 6 — Network và port

Chạy Python HTTP server foreground trên port 8081. Dùng `ss`, `curl` và `fuser` xác nhận. Dừng bằng Ctrl-C và xác nhận port biến mất.

## Lab 7 — MQTT stack

Chạy broker demo, gateway và WebUI. Theo port 1883/9001, process owner và frame MQTT. Sau đó dừng một tầng và dự đoán triệu chứng ở các tầng còn lại.

## Lab 8 — OTBR health check

Khi setup xong, thu thập

```bash
systemctl status otbr-agent  # QS
journalctl -u otbr-agent -b --no-pager  # QS
sudo ot-ctl version          # QS
sudo ot-ctl state            # QS
ip -6 addr show wpan0        # QS
ip -6 route                  # QS
```

Giải thích kết quả mà không chỉ chép output.

## Capstone — Runbook Gateway

Viết một runbook một trang có

- sơ đồ process và dependency
- path config/artifact/data
- user/group mỗi service
- port và bind address
- lệnh health check
- cách deploy phiên bản mới
- rollback
- bốn lỗi thường gặp
- boundary OTBR sở hữu RCP, Node gateway không sở hữu USB

Bạn hoàn thành khóa khi một người khác có thể dùng runbook để xác định tầng lỗi mà không hỏi tác giả.
