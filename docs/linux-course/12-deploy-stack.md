# Chương 12 — Triển khai MQTT, gateway và WebUI

## Mục tiêu

- triển khai ba loại workload Linux
- hiểu config path và lifecycle production
- phân biệt demo với production

## Các workload production

1. Mosquitto là authenticated broker
2. OTBR quản lý Thread/RCP
3. Matter.js Controller giữ fabric và Unix RPC
4. Node gateway xử lý MQTT/translation
5. WebUI là static files do systemd-managed server phục vụ

Aedes và Vite chỉ còn dùng test/development. Python static server hiện phù hợp trusted LAN; HTTPS/WSS server vẫn là bước hardening tiếp theo.

## Mosquitto

Config repository ở `deploy/mosquitto/matter.conf`.

- anonymous tắt
- password và ACL nằm dưới `/etc/mosquitto`
- 1883 chỉ bind loopback
- 9001 dùng WebSocket cho LAN
- persistence ở `/var/lib/mosquitto`

```bash
sudo mosquitto_passwd -c /etc/mosquitto/passwd gateway  # TĐ
sudo mosquitto_passwd /etc/mosquitto/passwd webui       # TĐ
sudo systemctl restart mosquitto                         # TĐ
systemctl status mosquitto                               # QS
ss -ltnp | grep -E '1883|9001'                           # QS
```

Không đưa password thật vào `-b`, vì nó xuất hiện trong shell history/process list.

## Gateway

Artifact đặt dưới `/opt/matter-gateway`. Config ở `/etc/matter-gateway/gateway.env`, mode 640 và owner root:service-group.

Systemd chạy gateway bằng user không login. `EnvironmentFile` cung cấp MQTT URL và credential.

Installer hiện đặt Node 20 tại `/opt/node20`; unit dùng absolute path. Gateway chạy user `matter-gateway`, không đọc home hoặc RCP.

## Matter Controller

`matter-controller.service` chạy user riêng, state ở `/var/lib/matter-controller`, socket ở `/run/matter-controller`. Group `matter-rpc` cho gateway connect socket nhưng không đọc fabric storage. Health probe retry startup race trong 10 giây.

Chi tiết nằm trong [khóa Matter/Thread](../matter-thread-course/08-matterjs-controller.md).

## WebUI

`npm run build` tạo `apps/webui/dist`. Static server chỉ cần đọc các file đó. Browser tự kết nối MQTT WebSocket dựa trên hostname.

Production thường dùng Nginx, Caddy hoặc một server tĩnh được quản lý bởi systemd. HTTPS/WSS cần certificate và hostname phù hợp.

## Luồng khởi động

```text
network-online
  → mosquitto
  → otbr-agent
  → matter-controller
  → matter-gateway
  → matter-webui
```

`After` sắp thứ tự nhưng readiness thật có thể cần retry. mqtt.js và gateway đều có reconnect behavior.

## Verification

```bash
systemctl --failed             # QS
systemctl status mosquitto otbr-agent matter-controller matter-gateway matter-webui  # QS
ss -ltnp                       # QS
journalctl -u matter-gateway -b --no-pager  # QS
```

Từ Windows.

```bat
node deploy\demo\verify.mjs 192.168.1.192
curl.exe -I http://192.168.1.192:8080/
```

## Demo và production

| Demo | Production |
|---|---|
| foreground qua SSH | systemd |
| anonymous Aedes | Mosquitto auth + ACL |
| Python foreground trong SSH | `matter-webui.service` trên trusted LAN |
| runtime trong home | `/opt/node20` system prefix |
| dừng khi session đóng | active/enabled, đã kiểm tra full reboot |
| không Matter Controller | Matter.js service + persistent state + Unix RPC |

## Bài thực hành

1. Vẽ dependency graph service.
2. Giải thích từng ACL topic.
3. Tìm config nào thuộc `/etc`, artifact nào thuộc `/opt`.
4. Viết checklist deploy phiên bản mới có rollback.

## Tự kiểm tra

1. Vì sao WebUI không cần Node runtime trên server sau build?
2. Tại sao 1883 chỉ bind loopback?
3. Environment file nên có mode gì?
4. After có bảo đảm service kia ready hoàn toàn không?
