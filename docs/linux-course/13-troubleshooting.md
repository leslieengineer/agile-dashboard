# Chương 13 — Gỡ lỗi và phục hồi

## Mục tiêu

- debug từ quan sát rẻ tới thay đổi mạnh
- phân loại lỗi process, port, permission, path và tài nguyên
- xây runbook có rollback

## Trình tự triage

1. service có chạy không
2. log nói gì
3. dependency có chạy không
4. port/device có tồn tại không
5. identity có quyền không
6. path/version có đúng không
7. CPU, RAM, disk có đủ không
8. chỉ sau đó mới restart hoặc sửa config

## Bộ lệnh QS

```bash
systemctl --failed                         # QS
systemctl status SERVICE                   # QS
journalctl -u SERVICE -b --no-pager        # QS
ss -ltnp                                   # QS
ps -ef                                     # QS
free -h                                    # QS
df -h                                      # QS
ls -l /dev/serial/by-id/                   # QS
sudo fuser -v /dev/ttyACM0                 # QS
```

## Case 1 — 203/EXEC

Triệu chứng service fail ngay. Giả thuyết ExecStart không tồn tại, không executable hoặc bị sandbox chặn.

```bash
systemctl cat matter-gateway               # QS
ls -l /usr/bin/node                        # QS
systemctl show -p ExecStart,ProtectHome matter-gateway  # QS
```

Sửa bằng runtime system prefix và absolute path. Không vội giảm ProtectHome.

## Case 2 — Serial đổi tên

Triệu chứng OTBR báo không mở `/dev/ttyACM0`. Kiểm tra `lsusb`, `/dev/serial/by-id` và journal. Sửa config dùng by-id hoặc udev symlink.

## Case 3 — Port đã bị dùng

Triệu chứng `EADDRINUSE` hoặc bind failed.

```bash
sudo fuser -v 1883/tcp                    # QS
ss -ltnp | grep 1883                      # QS
```

Xác định process demo hay production trước khi stop. Không kill theo PID mà chưa đọc command/user.

## Case 4 — Build bị Killed

Có thể là OOM. Kiểm tra kernel log và memory.

```bash
free -h                                   # QS
journalctl -k -b | grep -i -E 'oom|killed process'  # QS
df -h /                                  # QS
```

Giảm parallel job, dừng workload không cần, hoặc tạo swap có chủ đích. Swap trên eMMC có tradeoff hiệu năng và wear.

## Case 5 — Permission denied

Xác định identity process, mode file và từng directory.

```bash
systemctl show -p User,Group SERVICE       # QS
namei -l /path/to/file                     # QS
sudo -u matter-gateway test -r /path/to/file  # QS
```

Sửa ownership chính xác, không chmod 777.

## Restart không phải chẩn đoán

Restart có thể che race và xóa trạng thái hữu ích. Thu log trước, mô tả giả thuyết, rồi mới restart nếu nó là probe có mục tiêu.

## Runbook tối thiểu

- symptom và thời điểm
- phiên bản đang chạy
- command quan sát
- kết quả thực tế
- thay đổi đã làm
- rollback
- điều kiện xác nhận phục hồi

## Bài thực hành

1. Cố ý dùng ExecStart sai trong unit thử và tìm 203/EXEC.
2. Chạy broker demo khi Mosquitto đã giữ 1883 và tìm owner port.
3. Mô phỏng path serial sai rồi sửa bằng by-id.

## Tự kiểm tra

1. Vì sao log nên đọc trước restart?
2. Permission denied cần kiểm tra những tầng nào?
3. `Killed` khác compile error ra sao?
4. Một runbook tốt cần rollback vì sao?
