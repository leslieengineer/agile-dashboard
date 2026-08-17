# Nền tảng Production: Auth, API và Vận hành

Khóa này nối ba khóa Linux, Web và Matter/Thread thành một đường production end-to-end. Nội dung tập trung vào Cloudflare, BFF, REST/SSE, Mobile bearer/CORS, process boundary, deployment và incident response.

## Quy ước trạng thái

| Nhãn | Ý nghĩa |
|---|---|
| **DEPLOYED** | Đã có live probe, artifact hash hoặc runtime evidence trên BBB |
| **AS-BUILT** | Source/test tồn tại trong codebase được chỉ rõ |
| **SOURCE-ONLY** | Có implementation nhưng chưa xác nhận deploy |
| **MOCK** | Đường chạy phục vụ integration nhưng không điều khiển node thật |
| **PLANNED** | Chỉ có design/roadmap hoặc implementation chưa hoàn chỉnh |
| **LEGACY** | Đường cũ còn giữ để rollback hoặc đối chiếu |

Không suy luận trạng thái production từ source commit.

## Điều kiện đầu vào

- [Linux course](../linux-course/README.md), tối thiểu network, systemd và deployment
- [Web course](../web-course/README.md), tối thiểu HTTP, Vue/Pinia, MQTT và contracts
- [Matter/Thread course](../matter-thread-course/README.md), tối thiểu OTBR, Controller và RPC

## Bản đồ chương

1. [Cách học và môi trường quan sát](00-huong-dan-hoc.md)
2. [Biên giới process, protocol và secret](01-bien-gioi-tien-trinh.md)
3. [BFF, session và authentication](02-bff-session-auth.md)
4. [REST, SSE và realtime state](03-rest-sse-realtime.md)
5. [Mobile bearer, CORS và Android security](04-mobile-bearer-cors.md)
6. [Commissioning, claim và Controller API](05-provisioning-claim-api.md)
7. [Vận hành, sự cố và rollback](06-van-hanh-su-co.md)
8. [Bài lab tích hợp](phu-luc-lab.md)
9. [Thuật ngữ](99-thuat-ngu.md)

## Trạng thái hệ thống được dạy

- **DEPLOYED** Cloudflare → BFF `127.0.0.1:8082` → Mosquitto `127.0.0.1:1883`
- **DEPLOYED** web cookie/CSRF và Mobile bearer/CORS/SSE
- **DEPLOYED** Controller service, persistent fabric và Unix RPC
- **MOCK** Gateway vẫn chưa cutover sang node Matter thật
- **PLANNED** native Mobile BLE/Matter commissioning và Multi-Admin HIL

Nguồn canonical là [kiến trúc toàn hệ thống](../../../docs/architecture/system-overview.md). Mobile status nằm tại [Mobile implementation context](../../../mobileapp-reference/mobile-app/context.md).
