# Chương 8 — systemd, service và journald

## Mục tiêu

- hiểu unit, dependency, enable và start
- đọc service file của gateway
- dùng journal để tìm nguyên nhân lỗi

## PID 1 và unit

Systemd PID 1 quản lý lifecycle service. Unit file khai báo điều kiện, command, identity, restart và sandbox.

Mở `deploy/systemd/matter-gateway.service`.

### Unit section

`After=` chỉ định thứ tự. `Wants=` kéo unit khác vào transaction nhưng không yêu cầu nó phải thành công. `Requires=` mạnh hơn.

### Service section

- `Type=simple` xem process ExecStart là service chính
- `User` và `Group` hạ quyền
- `WorkingDirectory` đặt cwd
- `EnvironmentFile` nạp config
- `Restart=on-failure` tự chạy lại khi exit lỗi

### Install section

`WantedBy=multi-user.target` cho biết enable tạo symlink vào target boot thông thường.

## Các thao tác

```bash
systemctl status matter-gateway             # QS
systemctl cat matter-gateway                # QS
systemctl show matter-gateway               # QS
sudo systemctl daemon-reload                # TĐ
sudo systemctl start matter-gateway         # TĐ
sudo systemctl enable matter-gateway        # TĐ
sudo systemctl restart matter-gateway       # TĐ
```

`enable` không nhất thiết start ngay. `start` không nhất thiết enable sau reboot.

Hoàn tác enable/start.

```bash
sudo systemctl disable --now matter-gateway # TĐ
```

## Journald

Stdout/stderr của service được journald thu thập.

```bash
journalctl -u matter-gateway -b --no-pager  # QS
journalctl -u otbr-agent -f                 # QS, theo log mới
journalctl -p err -b                        # QS
```

`-b` giới hạn boot hiện tại. `-f` theo dõi realtime.

## Trạng thái deployment hiện tại

Deployment gap đã được sửa. Node 20 nằm ở `/opt/node20/bin/node`; gateway và Matter Controller dùng absolute ExecStart, vẫn giữ `ProtectHome=yes`.

Matter Controller minh họa hai directive hữu ích

- `StateDirectory=matter-controller` tạo persistent `/var/lib/matter-controller`
- `RuntimeDirectory=matter-controller` tạo `/run/matter-controller` mỗi boot

Socket mode/group cho phép gateway RPC mà không chia sẻ user hoặc fabric storage.

```bash
systemctl status mosquitto otbr-agent matter-controller matter-gateway matter-webui  # QS
systemd-analyze verify deploy/systemd/matter-gateway.service                         # QS
ls -l /opt/node20/bin/node                                                           # QS
```

`203/EXEC` vẫn là bài học khi path executable sai; `200/CHDIR` khi working directory sai.

## Bài thực hành

1. Giải thích từng directive trong gateway unit.
2. Phân biệt After và Wants.
3. Tạo một unit thử chạy `/bin/sleep 30`.
4. Cố ý đặt ExecStart sai và tìm 203/EXEC trong journal.

## Tự kiểm tra

1. Enable khác start thế nào?
2. Systemd lấy environment từ đâu?
3. Vì sao Node trong `.bashrc` không đủ?
4. Journald thu log bằng cách nào?
