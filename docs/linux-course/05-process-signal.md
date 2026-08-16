# Chương 5 — Process, signal và tài nguyên

## Mục tiêu

- quan sát process và quan hệ cha con
- hiểu foreground, background và SSH lifecycle
- dùng signal đúng mức

## Process

Mỗi chương trình đang chạy có PID, parent PID, user, memory và file descriptor.

```bash
ps -ef                        # QS
ps -o pid,ppid,user,stat,rss,cmd -C node  # QS
pstree -p                     # QS
```

Kernel scheduler chia CPU giữa process. Virtual memory tạo không gian địa chỉ riêng, nhưng tổng RAM vẫn hữu hạn.

## Foreground và terminal

Process foreground nhận input và signal từ terminal. `Ctrl-C` gửi SIGINT. Khi SSH đóng, process gắn terminal có thể nhận SIGHUP và dừng.

Demo Aedes, gateway Node và Python HTTP trước đây chạy foreground qua SSH. Đó là cách thử nhanh, không phải vận hành production.

## Signal

```bash
kill -TERM PID                # TĐ, yêu cầu process dừng sạch
kill -KILL PID                # TĐ, kernel dừng ngay, không cleanup
```

Ưu tiên SIGTERM. SIGKILL chỉ dùng khi process không phản hồi và bạn hiểu rủi ro mất dữ liệu.

Gateway bắt SIGINT/SIGTERM trong `packages/gateway/src/main.ts`, publish offline rồi đóng MQTT/controller.

## Exit và zombie

Process kết thúc để lại exit status cho parent. Zombie là process đã kết thúc nhưng parent chưa thu status. Orphan được PID 1 nhận nuôi.

## RAM và OOM

BBB có khoảng 512 MiB RAM và không có swap trong lần khảo sát.

```bash
free -h                       # QS
top                           # QS
cat /proc/meminfo             # QS
```

Nếu toàn hệ thống cạn memory, OOM killer có thể chọn process để kill. Build C++ song song dùng nhiều RAM, nên giảm job count và dừng service demo trong lúc build.

```bash
ninja -j1                     # TĐ, chạy build một job
```

## File descriptor

Socket, file và device đều được process mở bằng descriptor.

```bash
ls -l /proc/PID/fd            # QS
lsof -p PID                   # QS, nếu lsof đã cài
```

## Bài thực hành

1. Tìm PID của SSH session hiện tại.
2. Chạy `sleep 60`, nhấn Ctrl-C và kiểm tra exit code.
3. Quan sát RSS của Node gateway.

## Tự kiểm tra

1. SIGTERM khác SIGKILL thế nào?
2. Vì sao process foreground không phù hợp production?
3. OOM killer làm gì?
4. Socket có xuất hiện trong file descriptor không?
