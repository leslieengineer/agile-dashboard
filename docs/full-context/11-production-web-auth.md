# Production Web Authentication

## Mục tiêu

Browser không còn biết MQTT URL/username/password. Người dùng đăng nhập tại `https://dashboard.rhophi.uk`; BFF giữ MQTT credential trên BBB.

```text
Browser HTTPS + HttpOnly cookie
→ Cloudflare Tunnel
→ webui-bff 127.0.0.1:8082
→ Mosquitto 127.0.0.1:1883
→ Matter Gateway
```

## Đã implement và staged

- package `@agile/webui-bff`
- scrypt admin password hashing
- persistent 7-day session, idle 24-hour, HttpOnly Secure SameSite cookie
- Origin/Host/CSRF validation
- REST `/api/login`, `/api/logout`, `/api/session`, `/api/command`, `/api/health`
- authenticated SSE `/api/events`
- server-side MQTT correlation/cache/fanout
- Vue LoginForm, session bootstrap, REST commands, SSE realtime
- systemd unit `matter-web-auth.service`
- Cloudflare Tunnel config example cho `dashboard.rhophi.uk`
- old WebUI 8080 và MQTT WS 9001 vẫn giữ làm rollback

## Chưa cutover

- chạy installer BFF trên BBB và tạo admin password
- tạo Cloudflare named Tunnel/DNS route trong account
- public HTTPS acceptance
- Cloudflare Access MFA
- xóa public Mosquitto WebSocket 9001
- xóa `webui-login.txt`

## Migration gate

Không xóa listener 9001 cho tới khi login, session persistence, REST command, SSE hai tab và full reboot đều pass qua `https://dashboard.rhophi.uk`.
