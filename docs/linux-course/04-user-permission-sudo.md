# Chương 4 — User, group, permission và sudo

## Mục tiêu

- đọc UID, GID và mode rwx
- hiểu group `dialout`
- dùng sudo theo nguyên tắc quyền tối thiểu

## Identity

```bash
id                            # QS
getent passwd leslie          # QS
getent group dialout          # QS
```

Kernel dùng UID/GID số. Tên user/group do userspace map qua database như `/etc/passwd` và `/etc/group`.

User `leslie` thuộc `dialout`, nên có thể mở serial device nếu mode cấp group read/write.

## Permission

```text
-rw-r----- 1 root matter-gateway gateway.env
```

Ba nhóm bit lần lượt cho owner, group và other. Directory cần bit execute để đi xuyên qua.

Octal thường gặp

- `600` owner đọc/ghi
- `640` owner đọc/ghi, group đọc
- `755` owner ghi, mọi người đọc/chạy

Secret environment nên là `0600` hoặc `0640` với group service phù hợp.

## sudo

Sudo chạy một command dưới identity khác, thường là root. Root có thể sửa hệ thống, firewall và service.

```bash
sudo -v                       # TĐ, refresh credential cache
sudo systemctl status otbr-agent  # QS về trạng thái, nhưng cần quyền
```

Không dùng `echo password | sudo -S`. Password có thể xuất hiện trong history, log hoặc process inspection.

## Delegation giới hạn cho automation

Thay vì `NOPASSWD: ALL`, sudoers có thể cho đúng absolute command và service cần quản lý. Hệ thống hiện dùng rule giới hạn cho `ot-ctl`, các systemctl action và journal của Smart Home services.

Nguyên tắc

- dùng absolute executable path
- liệt kê service/argument cụ thể
- validate bằng `visudo -cf`
- file mode 0440
- thu hồi khi hoàn tất
- không cho NOPASSWD chạy script nằm trong home vì user có thể sửa script thành root escalation

Đây là khác biệt giữa delegation có kiểm soát và chia sẻ root password.

## Service user

Production gateway nên chạy user `matter-gateway`, không chạy root và không thuộc `dialout`. Gateway không cần USB RCP. `otbr-agent` là process duy nhất sở hữu RCP.

```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin matter-gateway  # TĐ
```

Hậu quả là tạo account hệ thống. Hoàn tác chỉ khi chưa có file/service phụ thuộc.

```bash
sudo userdel matter-gateway   # TĐ
```

## Ownership

```bash
sudo chown root:matter-gateway /etc/matter-gateway/gateway.env  # TĐ
sudo chmod 640 /etc/matter-gateway/gateway.env                   # TĐ
```

Không dùng `chmod 777` để chữa permission. Nó thường mở quyền quá mức và che sai thiết kế ownership.

## Bài thực hành

1. Đọc owner/mode của `/dev/ttyACM0`.
2. Giải thích vì sao `leslie` mở được RCP.
3. Dùng `namei -l` kiểm tra từng directory trong một path.

## Tự kiểm tra

1. User name hay UID được kernel dùng trực tiếp?
2. Execute bit trên directory có nghĩa gì?
3. Vì sao gateway service không vào dialout?
4. Sudo khác đăng nhập root lâu dài thế nào?
