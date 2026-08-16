# Chương 3 — Filesystem và lưu trữ

## Mục tiêu

- hiểu cây thư mục Linux
- phân biệt file, directory, link và mount
- theo dõi dung lượng eMMC khi build

## Cây bắt đầu từ root

Linux dùng một cây duy nhất bắt đầu bằng `/`.

| Path | Vai trò |
|---|---|
| `/home` | dữ liệu người dùng |
| `/etc` | cấu hình hệ thống |
| `/usr` | phần mềm do package quản lý |
| `/usr/local` | phần mềm cài thủ công toàn hệ thống |
| `/opt` | ứng dụng bên thứ ba độc lập |
| `/var` | log, cache, persistent service data |
| `/run` | runtime state sau boot |
| `/dev`, `/proc`, `/sys` | giao diện kernel |

Project production dự kiến nằm ở `/opt/matter-gateway`, config secret ở `/etc/matter-gateway`, dữ liệu broker ở `/var/lib/mosquitto`.

## Path tuyệt đối và tương đối

`/home/leslie/file` là absolute. `file` phụ thuộc working directory. `.` là hiện tại, `..` là cha, `~` được shell mở rộng thành home.

```bash
pwd                           # QS
realpath ~/ot-br-posix        # QS
```

## Metadata và inode

Directory ánh xạ tên tới inode. Inode giữ owner, permission, timestamps và vị trí dữ liệu.

```bash
ls -li file                   # QS
stat file                     # QS
```

Symlink chứa một path tới file khác. `/dev/serial/by-id/...` là symlink ổn định trỏ tới ttyACM hiện tại.

## Mount và dung lượng

```bash
df -h /                       # QS
du -sh ~/ot-br-posix          # QS
lsblk -f                      # QS
```

`df` hỏi filesystem còn bao nhiêu block. `du` cộng dung lượng file trong cây. Source build tạo object file trong build directory, nên cần kiểm tra cả disk và RAM.

BBB đã từng còn khoảng 502 MiB trước OTBR build. `No space left on device` có thể làm build hoặc database hỏng giữa chừng.

## Ghi file an toàn

Trước khi sửa config production.

```bash
sudo cp /etc/example.conf /etc/example.conf.bak  # TĐ
sudoedit /etc/example.conf                        # TĐ
```

Hoàn tác.

```bash
sudo cp /etc/example.conf.bak /etc/example.conf  # TĐ
```

`sudoedit` mở bản tạm bằng editor user rồi copy an toàn dưới quyền root.

## Bài thực hành

1. Dùng `du` so sánh source OTBR và web bundle.
2. Theo symlink RCP bằng `readlink -f`.
3. Tìm filesystem chứa `/home/leslie`.

## Tự kiểm tra

1. `/etc` và `/var/lib` khác vai trò thế nào?
2. `df` khác `du` thế nào?
3. Symlink by-id giúp gì khi USB re-enumerate?
4. Vì sao không chỉnh config root bằng editor chạy toàn bộ dưới sudo nếu không cần?
