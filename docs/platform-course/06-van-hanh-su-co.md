# Chương 6 — Vận hành, sự cố và rollback

## Mục tiêu

- kiểm tra hệ thống theo tầng
- phân biệt tunnel, BFF, MQTT, Controller và Thread failure
- rollback mà không xóa credential/state quan trọng

## Observability ladder

```bash
systemctl --failed                                                        # QS
systemctl is-active cloudflared matter-web-auth mosquitto matter-gateway matter-controller otbr-agent  # QS
journalctl -u matter-web-auth -b --no-pager                               # QS
journalctl -u matter-gateway -b --no-pager                                # QS
sudo -u matter-gateway /opt/node20/bin/node /home/leslie/agile-dashboard/matter-rpc-health.mjs  # QS
ot-ctl state                                                                  # QS
```

Từ Windows.

```bat
curl.exe -i https://dashboard.rhophi.uk/api/health
curl.exe -i https://dashboard.rhophi.uk/api/session -H Origin:https://localhost
```

## Triage matrix

| Triệu chứng | Tầng nghi ngờ | Kiểm tra đầu tiên |
|---|---|---|
| Domain không mở | Cloudflare/DNS | public curl, cloudflared journal |
| Local BFF mở nhưng public lỗi | Tunnel/Host routing | `127.0.0.1:8082` và tunnel config |
| `FORBIDDEN_ORIGIN` | BFF CORS/origin | request Origin và allowlist |
| `mqtt_connected:false` | BFF ↔ Mosquitto | broker/BFF journals và ACL |
| Command trả mock | Gateway mode | `CONTROLLER_MODE` |
| Controller socket missing | service ordering/runtime dir | Controller status và `/run` |
| OTBR detached | Thread/RCP | `ot-ctl state`, serial owner |
| Mobile restore 401 | session/token | expiry, revoke, Android secure store |

## Persistent state không được xóa tùy tiện

- `/var/lib/matter-controller`
- `/var/lib/thread`
- `/var/lib/matter-web-auth`
- `/var/lib/mosquitto`
- `/etc/matter-web-auth/*.env`
- cloudflared credentials

Xóa controller hoặc Thread state có thể buộc recommission toàn hệ thống.

## Rollback rules

- backup artifact/config trước update
- update một service mỗi lần
- verify local health trước public health
- giữ WebUI 8080 và MQTT WS 9001 cho tới khi migration gate chính thức đóng
- Gateway real-controller lỗi có thể rollback về mock, nhưng phải ghi rõ không còn hardware control
- không tạo Thread dataset mới để chữa một lỗi chưa chẩn đoán

## Checkpoint

Hoàn thành khi bạn viết được runbook gồm backup, deploy, health check, acceptance và rollback cho `matter-web-auth`.
