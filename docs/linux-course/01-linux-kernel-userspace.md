# Chương 1 — Kernel, userspace và Debian

## Mục tiêu

- phân biệt kernel và userspace
- hiểu distribution và kiến trúc CPU
- biết `/proc`, `/sys` và `/dev` là giao diện runtime

## Kernel

Kernel quản lý CPU scheduling, memory, driver, filesystem, network và security boundary. Application không điều khiển USB trực tiếp. Nó gọi system call, kernel chuyển yêu cầu tới driver.

Trên BBB, kernel driver `cdc_acm` tạo `/dev/ttyACM0` khi ESP32-C6 USB Serial/JTAG được enumerate.

## Userspace

Bash, SSH server, Node.js, Python, Mosquitto và `otbr-agent` là process userspace. Chúng bị giới hạn bởi user, group, permission và capability.

Systemd là process PID 1 của userspace, chịu trách nhiệm khởi động và giám sát service.

```bash
ps -p 1 -o pid,comm,args    # QS
```

## Debian distribution

Distribution gồm kernel, thư viện, công cụ, package repository và policy. BBB dùng Debian 11 Bullseye. Repository ổn định có package cũ hơn upstream, vì vậy Node apt mặc định là v12 trong khi project yêu cầu Node từ 20.11.

## Kiến trúc CPU

```bash
uname -m                    # QS
getconf LONG_BIT            # QS
```

BBB trả `armv7l`, khác `x86_64` của PC. Binary Windows hoặc x64 không chạy trên ARM Linux. JavaScript source portable, nhưng native dependency phải đúng OS và architecture.

## Filesystem ảo

- `/proc` trình bày process và kernel state
- `/sys` trình bày device và driver topology
- `/dev` chứa device node

Chúng không phải file lưu trên eMMC theo nghĩa thông thường.

```bash
cat /proc/meminfo           # QS
cat /proc/cpuinfo           # QS
readlink -f /sys/class/tty/ttyACM0/device  # QS
```

## Linux đang làm gì bên dưới

Khi `cat /proc/meminfo` chạy, kernel tạo nội dung tại thời điểm đọc. Khi process mở `/dev/ttyACM0`, kernel kiểm tra permission rồi chuyển byte giữa process và USB CDC driver.

## Bài thực hành

1. Tìm PID 1.
2. So sánh `uname -m` trên Windows WSL nếu có và BBB.
3. Tìm driver của ttyACM0 bằng udev.

## Tự kiểm tra

1. Driver thuộc kernel hay userspace?
2. Vì sao binary x64 không chạy trên armv7l?
3. `/proc` có được lưu lâu dài không?
4. `otbr-agent` nằm ở phía nào của boundary?
