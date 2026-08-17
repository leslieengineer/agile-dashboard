# Chương 0 — Cách học và môi trường quan sát

## Mục tiêu

- phân biệt Windows development, BBB runtime và public edge
- dùng bằng chứng thay vì suy luận deployed status
- biết lệnh nào chỉ quan sát và lệnh nào thay đổi production

## Ký hiệu an toàn

- `QS` là quan sát, không chủ ý thay đổi hệ thống
- `TĐ` là thay đổi artifact, config, credential, service hoặc network

Không đưa password, token, Thread dataset, fabric key hoặc claim secret vào command line, tài liệu hay log.

## Ba môi trường

| Môi trường | Dùng để làm gì | Công cụ chính |
|---|---|---|
| Windows | source, test, build, HTTP probe | VS Code, npm, curl, adb |
| BBB | service, process, port, persistent state | SSH, systemctl, journalctl |
| Public edge | TLS, Cloudflare, Origin/CORS | curl/DevTools/Android app |

## Baseline quan sát

```bat
npm run typecheck
npm test
curl.exe -i https://dashboard.rhophi.uk/api/health
curl.exe -i https://dashboard.rhophi.uk/api/session -H Origin:https://localhost
```

Trên BBB.

```bash
systemctl is-active mosquitto matter-gateway matter-controller matter-web-auth otbr-agent  # QS
ss -ltnp                                                                            # QS
journalctl -u matter-web-auth -b --no-pager                                           # QS
```

`active` chỉ chứng minh process đang chạy, không chứng minh command đã tới node thật.

## Bài thực hành

1. Vẽ ba cột Windows, Public edge và BBB.
2. Gắn mỗi lệnh quan sát vào đúng cột.
3. Giải thích vì sao source có `/api/mobile/login` chưa đủ chứng minh production hỗ trợ nó.

## Checkpoint

Hoàn thành khi bạn chỉ ra được bằng chứng cho BFF public, MQTT connection và Controller health mà không sửa production.
