# Chương 0 — Cách học và hai máy

## Mục tiêu

- phân biệt máy Windows phát triển và BBB chạy dịch vụ
- đọc prompt, working directory và exit code
- áp dụng quy tắc quan sát trước, thay đổi sau

## Hai máy trong một workflow

Windows chứa source, VS Code, npm và công cụ build frontend. BBB là Linux gateway chạy service và giao tiếp USB với ESP32-C6.

```text
Windows --SSH/SCP--> BBB --USB Spinel--> ESP32-C6 RCP
```

Lệnh `ssh` mở một process shell từ xa. Lệnh bạn gõ sau prompt `leslie@BeagleBone` chạy trên BBB, không chạy trên Windows.

## Prompt

```text
leslie@BeagleBone:~$
```

- `leslie` là user hiện tại
- `BeagleBone` là hostname
- `~` là home `/home/leslie`
- `$` là shell không phải root; root thường có `#`

## Lệnh khảo sát đầu tiên

Trên BBB.

```bash
pwd                         # QS
whoami                      # QS
hostname                    # QS
uname -m                    # QS
cat /etc/os-release         # QS
id                          # QS
```

`pwd` hỏi shell về working directory. `uname` hỏi kernel. `/etc/os-release` là file userspace mô tả distribution. `id` in UID, GID và group.

## SSH và SCP

Trên Windows.

```bat
ssh leslie@BeagleBone
scp file.txt leslie@BeagleBone:/home/leslie/
```

SSH tạo kênh mã hóa cho terminal. SCP truyền file qua cùng nền SSH. Public key cho phép đăng nhập mà không gửi password mỗi lần.

## Exit code

Process kết thúc với số nguyên. `0` thường là thành công, khác `0` là lỗi hoặc trạng thái không đạt.

```bash
false                       # QS
printf '%s\n' "$?"         # QS
```

`$?` chỉ lưu exit code của command ngay trước đó.

## Quy tắc an toàn

1. xác định command chạy trên máy nào
2. đọc command từ trái sang phải
3. chạy lệnh QS để xác nhận trạng thái
4. mô tả hậu quả trước lệnh TĐ
5. sao lưu config trước khi sửa
6. không dùng sudo nếu quyền thường đủ

## Bài thực hành

1. SSH vào BBB và giải thích từng phần prompt.
2. Chạy sáu lệnh khảo sát.
3. Dùng SCP chép một file text rồi kiểm tra bằng `ls -l`.

## Tự kiểm tra

1. `uname -m` và `/etc/os-release` trả thông tin khác nhau thế nào?
2. `~` được shell mở rộng thành gì?
3. Exit code 127 thường gợi ý điều gì?
4. Vì sao public key tốt hơn đưa password vào script?
