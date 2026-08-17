# Phụ lục — Bài lab tích hợp Production Platform

## Lab 1 — Vẽ và kiểm chứng process chain

Mục tiêu là đối chiếu sơ đồ với port/process thật.

1. Chạy `ss -ltnp` trên BBB.
2. Gắn 8082, 1883, 9001 vào đúng process.
3. Kiểm tra Controller socket và RCP owner.
4. Pass khi không gán RCP cho Gateway hoặc Matter endpoint cho RCP.

## Lab 2 — Auth negative matrix

Chạy trên local test BFF, không brute-force production.

| Case | Expected |
|---|---|
| Không session | 401 |
| Origin sai | 403 `FORBIDDEN_ORIGIN` |
| Web POST thiếu CSRF | 403 `CSRF_INVALID` |
| Payload sai schema | 400 typed error |
| Nhiều login sai | 429 rate limit |

## Lab 3 — SSE lifecycle

1. Login bằng test account.
2. Mở hai SSE clients.
3. Gửi một command mock.
4. Xác nhận cả hai client nhận normalized event.
5. Logout và xác nhận session không dùng lại được.

## Lab 4 — Mobile CORS

1. Gửi preflight từ `https://localhost`.
2. Kiểm tra status 204.
3. Kiểm tra Allow-Origin, methods và headers.
4. Đổi Origin thành domain lạ và xác nhận bị từ chối.

## Lab 5 — Commissioning state ownership

Vẽ bảng gồm state, owner và cleanup action cho claim, PASE, Thread attach, temp fabric, permanent fabric và subscription. Pass khi không state nào được gán cho MQTT.

## Lab 6 — BFF update/rollback drill

1. Hash artifact đang chạy.
2. Backup artifact và env.
3. Deploy artifact mới bằng script chuẩn.
4. Verify local health, CORS, public health, web session và mobile session.
5. Rollback nếu bất kỳ gate nào fail.

## Lab 7 — Full reboot evidence

Sau reboot, thu bằng chứng theo thứ tự systemd → BFF → MQTT → Controller RPC → OTBR role → public HTTPS → Mobile session. Không đánh dấu Matter HIL pass nếu commissioned node list vẫn rỗng.
