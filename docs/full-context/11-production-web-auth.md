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

## Đã implement và deploy

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

## Đã cutover public ingress

- BFF artifact đã deploy trên BBB
- Cloudflare named Tunnel/DNS route phục vụ `dashboard.rhophi.uk`
- public HTTPS, CORS Mobile, login/session restore và authenticated SSE đã smoke-test
- old WebUI 8080 và MQTT WS 9001 vẫn giữ làm rollback

## Còn lại trước khi đóng migration

- Cloudflare Access MFA
- xác nhận REST command tới application node thật sau real-controller cutover
- full reboot acceptance cho web và mobile session paths
- xóa listener 9001 và `webui-login.txt` theo security review

## Migration gate

Không xóa listener 9001 cho tới khi login, session persistence, REST command, SSE hai tab và full reboot đều pass qua `https://dashboard.rhophi.uk`.

## Học chi tiết

- [BFF session và auth](../platform-course/02-bff-session-auth.md)
- [REST/SSE realtime](../platform-course/03-rest-sse-realtime.md)
- [Mobile bearer/CORS](../platform-course/04-mobile-bearer-cors.md)
- [Vận hành và rollback](../platform-course/06-van-hanh-su-co.md)
