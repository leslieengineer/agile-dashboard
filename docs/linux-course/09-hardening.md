# Chương 9 — Hardening và secrets

## Mục tiêu

- áp dụng least privilege
- hiểu sandbox systemd
- quản lý credential và SSH key an toàn

## Least privilege

Mỗi process chỉ có quyền cần thiết. Gateway cần network nhưng không cần kernel module, home user hoặc serial device.

Unit dùng

- `NoNewPrivileges=yes`
- `PrivateDevices=yes`
- `ProtectSystem=strict`
- `ProtectHome=yes`
- `ProtectKernelTunables=yes`
- `ProtectKernelModules=yes`
- `RestrictAddressFamilies=AF_INET AF_INET6 AF_UNIX`
- `MemoryMax=256M`

## Linux đang làm gì bên dưới

Systemd tạo namespace, mount restriction, cgroup và security flags trước khi exec application. Đây là phòng thủ kiến trúc, không phụ thuộc code Node tự giác.

`PrivateDevices=yes` ngăn gateway thấy RCP. Vì vậy dù code bị lỗi hoặc bị khai thác, nó khó tranh serial với OTBR.

Matter Controller và Gateway dùng hai user riêng. Unix socket mode 0660 thuộc group `matter-rpc`; gateway chỉ nhận supplementary group này, không được đọc `/var/lib/matter-controller`. Đây là capability sharing hẹp hơn chạy cả hai process cùng user.

## Secret

Secret không thuộc source repository hoặc frontend bundle.

```bash
sudo install -d -m 750 -o root -g matter-gateway /etc/matter-gateway  # TĐ
sudo install -m 640 -o root -g matter-gateway gateway.env /etc/matter-gateway/gateway.env  # TĐ
```

Hoàn tác bằng cách dừng service, sao lưu rồi xóa file nếu chắc chắn không còn dùng.

Environment vẫn có thể được process có quyền phù hợp đọc qua `/proc`. Không log secret và giới hạn quyền đọc journal.

## SSH key

Private key ở máy client, public key trong `~/.ssh/authorized_keys`.

```bash
chmod 700 ~/.ssh              # TĐ
chmod 600 ~/.ssh/authorized_keys  # TĐ
```

Không gửi private key. Sau khi xác nhận key login hoạt động, có thể cân nhắc tắt password login trong sshd, nhưng phải giữ một session mở và có đường phục hồi.

## Security không phải một checkbox

- TLS bảo vệ đường truyền
- ACL giới hạn topic
- user/group giới hạn filesystem
- systemd sandbox giới hạn kernel surface
- validation giới hạn input
- logging và update giúp phát hiện/khắc phục

## Sai lầm thường gặp

- chạy mọi service bằng root
- `chmod 777` để chữa lỗi
- bind service ra `0.0.0.0` mà không cần
- để password trong command history
- giảm `ProtectHome` chỉ để dùng Node trong home
- mở firewall trước khi có authentication/TLS
- `chmod 666` controller socket để chữa permission
- chạy Matter Controller bằng root cho nhanh

## Bài thực hành

1. Chạy `systemd-analyze security matter-gateway.service` khi unit được cài.
2. Kiểm tra mode authorized_keys.
3. Lập threat model cho cổng MQTT WebSocket.

## Tự kiểm tra

1. PrivateDevices bảo vệ ranh giới nào?
2. Vì sao environment chưa phải secret vault hoàn hảo?
3. TLS và ACL khác nhau thế nào?
4. Tại sao không nên sửa ProtectHome để chạy Node trong home?
