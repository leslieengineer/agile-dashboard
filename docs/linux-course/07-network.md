# Chương 7 — Network, interface, route và port

## Mục tiêu

- đọc interface, IP và route
- hiểu bind address và listening socket
- chẩn đoán một port từ process tới client

## Interface

```bash
ip -br addr                   # QS
ip link                       # QS
```

Interface là điểm kernel nối packet với một network. BBB dùng `eth0` làm backbone. OTBR tạo `wpan0` cho Thread.

## Route

```bash
ip route show default         # QS
ip -6 route                   # QS
```

Route quyết định next hop theo destination prefix. Default route dùng khi không có route cụ thể hơn. Kết quả của BBB cho thấy gateway LAN qua `eth0`.

## Loopback và bind

- `127.0.0.1` chỉ truy cập từ cùng máy
- `0.0.0.0` nghĩa là listen trên mọi IPv4 interface
- một IP LAN cụ thể chỉ listen interface tương ứng

Mosquitto production bind TCP 1883 vào loopback để chỉ gateway local truy cập. WebSocket 9001 bind LAN cho browser.

## Port và socket

```bash
ss -ltnp                     # QS
ss -lunp                     # QS
sudo fuser -v 1883/tcp       # QS
```

`LISTEN` nghĩa kernel có socket chờ connection. Port mở không chứng minh application hoạt động đúng; chỉ chứng minh có process bind.

Các port dự án

| Port | Dịch vụ |
|---:|---|
| 22 | SSH |
| 1883 | MQTT TCP |
| 9001 | MQTT WebSocket |
| 8080 | static WebUI demo |
| 5173 | Vite dev server |

## DNS và hostname

`BeagleBone` được resolve qua mDNS, DNS hoặc hosts tùy mạng.

```bash
getent hosts BeagleBone       # QS
cat /etc/resolv.conf          # QS
```

## Firewall

Firewall lọc packet. Trên Debian có thể dùng nftables hoặc iptables frontend. Trước khi sửa qua SSH, luôn bảo đảm port 22 không bị tự khóa.

```bash
sudo nft list ruleset         # QS
```

Lệnh thêm/xóa rule là TĐ và cần kế hoạch rollback hoặc console vật lý.

## Bài thực hành

1. Tìm process đang listen 22.
2. Giải thích vì sao 1883 production chỉ bind loopback.
3. Dùng `curl -I` kiểm tra HTTP WebUI.
4. Theo default route từ BBB tới router LAN.

## Tự kiểm tra

1. Interface khác route thế nào?
2. Bind `0.0.0.0` có hệ quả gì?
3. Port LISTEN có chứng minh nghiệp vụ đúng không?
4. Vì sao sửa firewall từ SSH cần thận trọng?
