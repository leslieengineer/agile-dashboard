# Chương 6 — apt, package và build source

## Mục tiêu

- hiểu apt/dpkg và repository
- phân biệt cài package, unpack runtime và build source
- quản lý tài nguyên khi build OTBR

## Package manager

`apt` giải dependency và tải package. `dpkg` cài file `.deb` vào filesystem database.

```bash
apt-cache policy nodejs       # QS
dpkg -l | grep cmake          # QS
sudo apt update               # TĐ, cập nhật package index
sudo apt install PACKAGE      # TĐ, cài/thay package hệ thống
```

`apt update` không nâng package; nó cập nhật danh sách phiên bản. `apt upgrade` mới thay package đã cài.

## Vì sao Node apt quá cũ

Debian stable ưu tiên ổn định. Bullseye cung cấp Node v12, project yêu cầu từ 20.11. Ta tải tarball ARMv7 chính thức và unpack vào `/home/leslie/.local/node20`.

Đây là user-local runtime, không phải package hệ thống. Dpdk không biết file đó và systemd không tự biết PATH.

Production nên đặt Node dùng chung dưới `/opt/node20` hoặc `/usr/local` và cập nhật unit `ExecStart` chính xác.

## Build source

OTBR không có package Bullseye phù hợp nên dùng source.

- `git clone --recurse-submodules` lấy source và dependency source
- `script/bootstrap` cài compiler/library cần thiết
- `script/setup` configure, compile, install và cấu hình host

Build thường có ba pha.

```text
configure → compile → install
```

CMake tạo build graph. Ninja thực thi compiler. Install copy artifact vào system prefix và thường cần sudo.

## Dung lượng và RAM

```bash
df -h /                       # QS
du -sh ~/ot-br-posix         # QS
free -h                       # QS
```

Trên BBB, dùng một job nếu compiler bị OOM. Không xóa build directory khi chưa cần, vì build lại tốn tài nguyên. Không chạy `sudo make install` từ source không tin cậy.

## Version và reproducibility

Ghi lại commit/tag source, compiler version, CMake options và radio URL. Nếu chỉ clone `main`, build tháng sau có thể khác.

```bash
git -C ~/ot-br-posix rev-parse HEAD  # QS
cmake --version                       # QS
ninja --version                       # QS
```

## Hậu quả và hoàn tác

Bootstrap cài package hệ thống. Không tự động remove hàng loạt vì package có thể được service khác dùng. Kiểm tra apt history tại `/var/log/apt/history.log` rồi quyết định từng package.

## Bài thực hành

1. Tìm version Node từ apt và Node local.
2. Ghi commit OTBR hiện tại.
3. Giải thích khác nhau giữa build và install.

## Tự kiểm tra

1. `apt update` có nâng package không?
2. Dpkg có quản lý Node trong home không?
3. Vì sao pin source version?
4. Configure, compile và install làm gì?
