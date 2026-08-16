# Tài liệu Smart Home Gateway

## Bắt đầu tại đây

Nếu chưa biết hệ thống gồm những gì và dữ liệu chạy ra sao, đọc trước:

**[Hướng dẫn hiểu toàn bộ hệ thống hiện tại](00-huong-dan-he-thong-hien-tai.md)**

## Lộ trình học đề xuất

1. [Khóa Linux trên BeagleBone Black](linux-course/README.md)
2. [Khóa lập trình Web qua Dashboard](web-course/README.md)
3. [Khóa Matter over Thread với BBB và ESP32-C6](matter-thread-course/README.md)
4. [Linux Gateway as-built hiện tại](full-context/10-linux-gateway-as-built.md)
5. [Full Context bàn giao kỹ thuật](full-context/README.md)

## Mỗi bộ tài liệu dùng để làm gì

### Linux course

Dạy kernel/userspace, shell, filesystem, quyền, sudo delegation, process, network, systemd, USB/udev, OTBR và production deployment.

### Web course

Dạy HTML/CSS/TypeScript/Vue/Pinia/MQTT, contracts, Node gateway, test, security và runtime login.

### Matter/Thread course

Dạy 802.15.4, Thread topology, RCP/Spinel/OTBR, dataset, Matter data model, commissioning, Matter.js Controller, Unix RPC và cutover mock-to-real.

### Full Context

Là specification và gói bàn giao giữa Gateway/Web, Hardware và nhóm ESP32-C6 application node. Nó ghi trạng thái, decisions, contracts, test gates, roadmap và checklist sign-off.

## Trạng thái hiện tại

Hạ tầng BBB/Thread/MQTT/Web/Matter Controller services đã chạy và sống qua reboot. Matter.js health ready nhưng chưa có node commissioned vì chưa có BLE adapter và ESP32-C6 application node. Gateway production vẫn chạy mock theo chủ đích.
