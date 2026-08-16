# Matter over Thread qua BBB và ESP32-C6

Khóa học này giải thích toàn bộ đường đi từ radio IEEE 802.15.4 đến Matter command trên Dashboard. Mỗi khái niệm được gắn với hệ thống thật đang chạy trên BBB.

## Ký hiệu

- `QS` là quan sát, không chủ ý thay đổi hệ thống
- `TĐ` là thay đổi network, service hoặc credential
- `HW` cần phần cứng hiện chưa có

## Trạng thái quan sát được

- ESP32-C6 RCP giao tiếp USB Spinel ở 460800 baud
- `otbr-agent` active/enabled
- Thread network `OpenThread-0a76`, channel 14, PAN `0x0a76`
- BBB là Thread leader và tự phục hồi sau reboot
- Matter.js Controller `0.17.9` active với persistent fabric
- Unix RPC health `ready: true`
- `commissioned_nodes` đang rỗng
- chưa có BLE adapter và ESP32-C6 application node
- gateway vẫn `CONTROLLER_MODE=mock`

## Bản đồ chương

1. [Cách học và safety boundary](00-huong-dan-hoc.md)
2. [Matter, Thread và các lớp giao thức](01-matter-thread-layers.md)
3. [Topology, role và IPv6](02-thread-topology.md)
4. [RCP, Spinel và OTBR](03-rcp-spinel-otbr.md)
5. [Operational Dataset và bảo mật](04-dataset-security.md)
6. [Matter data model](05-matter-data-model.md)
7. [Interaction Model và state](06-interaction-model.md)
8. [Fabric, PASE, CASE và commissioning](07-commissioning.md)
9. [Matter.js Controller service](08-matterjs-controller.md)
10. [Unix RPC và Gateway adapter](09-rpc-gateway.md)
11. [Mock-to-real cutover và debugging](10-cutover-debugging.md)

## Phụ lục

- [Bài lab](phu-luc-lab.md)
- [Từ điển thuật ngữ](99-thuat-ngu.md)

## Safety boundary

- chỉ `otbr-agent` được mở RCP serial
- không chạy lại `dataset init new` trên BBB hiện tại
- không in/commit Thread Network Key hoặc Matter fabric credentials
- không xóa `/var/lib/matter-controller` khi chưa backup
- không nâng Matter.js khỏi `0.17.9` trong phạm vi khóa học
- không bật `CONTROLLER_MODE=matterjs` production khi chưa commission node

## Hệ thống thực tế

- [Linux Gateway as-built](../full-context/10-linux-gateway-as-built.md)

## Khóa liên quan

- [Lập trình Web](../web-course/README.md)
- [Linux trên BBB](../linux-course/README.md)
- [Full context bàn giao](../full-context/README.md)
