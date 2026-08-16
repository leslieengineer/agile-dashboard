# Linux Gateway As-Built — Những gì hiện đã có

Cập nhật ngày 2026-08-16. Đây là tài liệu mô tả hệ thống thực tế đang chạy trên BeagleBone Black, không phải kiến trúc mong muốn trong tương lai.

## 1. Tóm tắt một trang

Linux Gateway hiện đã có năm service production chạy bằng systemd và tự khởi động lại sau reboot.

```text
matter-webui
    │ MQTT over authenticated WebSocket :9001
    ▼
mosquitto
    │ MQTT TCP loopback :1883
    ▼
matter-gateway ── Unix RPC ── matter-controller
                                  │ IPv6/Matter
                                  ▼
                              otbr-agent
                                  │ Spinel/HDLC USB
                                  ▼
                              ESP32-C6 RCP
                                  │ Thread 802.15.4
                                  ▼
                        application node chưa có
```

WebUI và MQTT command path đã chạy end-to-end với `MockMatterController`. Matter.js Controller service đã sẵn sàng nhưng chưa có node commissioned và gateway chưa chuyển sang `matterjs` mode.

## 2. Phần cứng và hệ điều hành

| Hạng mục | Giá trị hiện tại |
|---|---|
| Gateway | BeagleBone Black |
| CPU architecture | ARMv7 32-bit `armv7l` |
| OS | Debian GNU/Linux 11 Bullseye |
| RAM | khoảng 482 MiB, không có swap |
| Disk root | 3.5 GiB eMMC |
| Disk available quan sát gần nhất | khoảng 548 MiB |
| Backbone interface | `eth0` |
| Dashboard IP đang dùng | `192.168.1.192`, DHCP nên không coi là cố định |
| Thread radio | ESP32-C6 USB RCP |
| RCP transport | Spinel/HDLC qua USB Serial/JTAG, 460800 baud |

RCP dùng persistent by-id path, không phụ thuộc tên `/dev/ttyACM0` có thể đổi sau re-enumeration.

```text
/dev/serial/by-id/usb-Espressif_USB_JTAG_serial_debug_unit_98:A3:16:AA:96:9C-if00
```

## 3. Thread network hiện tại

| Field | Trạng thái |
|---|---|
| OTBR service | active, enabled |
| Interface | `wpan0` UP/LOWER_UP |
| Network name | `OpenThread-0a76` |
| Channel | 14 |
| PAN ID | `0x0a76` |
| BBB Thread role | leader |
| Dataset persistence | đạt qua service restart và full reboot |
| Application children | chưa có node ứng dụng |

Active Operational Dataset đã được tạo và commit. Network Key và PSKc không được ghi vào repository hoặc tài liệu này.

`otbr-agent` là process duy nhất được phép mở RCP serial. Gateway và Matter Controller có `PrivateDevices=yes`.

## 4. Service inventory

### 4.1 Mosquitto

```text
Unit:       mosquitto.service
User:       mosquitto
Binary:     /usr/sbin/mosquitto
Config:     /etc/mosquitto/mosquitto.conf
App config: /etc/mosquitto/conf.d/matter.conf
Password:   /etc/mosquitto/passwd
ACL:        /etc/mosquitto/aclfile
State:      /var/lib/mosquitto
Status:     active, enabled
```

Mosquitto có hai identities tách biệt.

- `gateway` đọc TX, ghi RX/status
- `webui` ghi TX, đọc RX/status

Anonymous access bị tắt. Command không retained; gateway availability có thể retained.

### 4.2 OpenThread Border Router

```text
Unit:       otbr-agent.service
User:       service-defined by OTBR package
Binary:     /usr/sbin/otbr-agent
CLI:        /usr/sbin/ot-ctl
Config:     /etc/default/otbr-agent
Thread IF:  wpan0
REST:       127.0.0.1:8081
Status:     active, enabled, leader
```

Responsibilities

- điều khiển ESP32-C6 RCP bằng Spinel
- chạy OpenThread host stack
- tạo `wpan0`
- quản lý active Thread dataset
- border routing Thread ↔ Ethernet
- mDNS/MeshCoP/TREL/DNS/NAT64 theo build configuration

OTBR không hiểu MQTT JSON, OnOff widget hoặc Pinia state.

### 4.3 Matter.js Controller

```text
Unit:       matter-controller.service
User:       matter-controller
Group:      matter-rpc
Runtime:    /opt/node20/bin/node
Bundle:     /opt/matter-controller/matter-controller.cjs
State:      /var/lib/matter-controller
RPC socket: /run/matter-controller/controller.sock
Status:     active, enabled
Version:    Matter.js 0.17.9
MemoryMax:  160 MiB
```

Health đã kiểm tra.

```json
{
  "ready": true,
  "controller": "matter.js",
  "version": "0.17.9",
  "commissioned_nodes": []
}
```

Controller đã tạo persistent fabric credentials, mở UDP/mDNS và sống qua restart. Node list rỗng vì chưa có BLE adapter và ESP32-C6 Matter application node.

RPC hiện expose

- `health`
- `listNodes`
- `invoke`

RPC chưa expose

- `commission`
- `removeNode`
- `read`
- long-lived attribute/event subscription stream
- commissioning window/multi-admin

### 4.4 Matter Gateway

```text
Unit:       matter-gateway.service
User:       matter-gateway
Main group: matter-gateway
Extra group:matter-rpc
Runtime:    /opt/node20/bin/node
Bundle:     /opt/matter-gateway/gateway.cjs
Config:     /etc/matter-gateway/gateway.env
Status:     active, enabled
MemoryMax:  256 MiB
Mode:       mock
```

Responsibilities

- subscribe `home/control/tx`
- giới hạn message 8 KiB
- parse JSON và validate Zod envelope
- normalize Node ID/cluster/command
- chọn handler qua CommandRegistry
- validate command payload
- gọi controller implementation với timeout
- publish response/event lên `home/control/rx`
- structured JSON logging

Gateway có hai implementations.

- `MockMatterController`, đang được chọn
- `MatterJsController`, đã có Unix RPC adapter nhưng chưa cutover

Gateway không mở RCP serial và không chứa Thread dataset.

### 4.5 WebUI

```text
Unit:       matter-webui.service
User:       matter-webui
Files:      /opt/matter-webui
Server:     /usr/bin/python3 -m http.server
HTTP:       0.0.0.0:8080
Status:     active, enabled
MemoryMax:  64 MiB
```

Dashboard hiện truy cập tại:

```text
http://192.168.1.192:8080/
```

WebUI có runtime MQTT login. URL, username và password chỉ giữ trong memory của tab, không lưu localStorage và không cần bundle password.

Login file dành cho owner BBB nằm tại:

```text
/home/leslie/agile-dashboard/webui-login.txt
```

File có mode 0600. Không commit hoặc gửi nội dung file vào issue/chat.

Static server hiện dùng plain HTTP cho trusted LAN. HTTPS/WSS và hardened static server vẫn là việc còn lại trước external exposure.

## 5. Network ports

| Port | Bind | Owner/vai trò |
|---:|---|---|
| 22 | `0.0.0.0` | SSH |
| 1883 | `127.0.0.1` | Mosquitto TCP, chỉ Gateway local |
| 9001 | mọi interface | authenticated MQTT WebSocket cho WebUI LAN |
| 8080 | mọi interface | Matter WebUI HTTP |
| 8081 | `127.0.0.1` | OTBR REST API |
| 5353 | multicast UDP | mDNS, OTBR và Matter discovery |
| 53 | nhiều interfaces | DNS proxy/resolution của BBB/OTBR stack |
| 80 | mọi interface | service có sẵn của BBB, không thuộc stack này |

Không mở port 1883 ra LAN. Port 9001 hiện không TLS nên chỉ dùng trusted LAN.

## 6. Filesystem layout

```text
/opt/node20/bin/node
/opt/matter-gateway/gateway.cjs
/opt/matter-controller/matter-controller.cjs
/opt/matter-webui/*

/etc/matter-gateway/gateway.env
/etc/mosquitto/conf.d/matter.conf
/etc/mosquitto/passwd
/etc/mosquitto/aclfile
/etc/default/otbr-agent
/etc/systemd/system/matter-gateway.service
/etc/systemd/system/matter-controller.service
/etc/systemd/system/matter-webui.service

/var/lib/matter-controller
/var/lib/mosquitto
/var/lib/thread

/run/matter-controller/controller.sock
```

`/run` mất sau reboot và được systemd tạo lại. `/var/lib` là persistent state và phải backup trước migration/reset.

## 7. Users, groups và trust boundary

| Identity | Quyền chính |
|---|---|
| `mosquitto` | broker config/state/password/ACL |
| `matter-webui` | chỉ đọc static files và bind 8080 |
| `matter-gateway` | đọc gateway env, network MQTT, connect matter-rpc socket |
| `matter-controller` | persistent fabric storage, UDP/mDNS, tạo RPC socket |
| `matter-rpc` | shared group chỉ cho Unix socket RPC |
| OTBR service identity | RCP serial và Thread routing |
| `leslie` | operator qua SSH/sudo policy |

Matter Gateway không đọc fabric storage. Matter Controller không đọc MQTT password. WebUI không đọc server-side gateway secret.

Limited sudo delegation được đặt dưới `/etc/sudoers.d/embedder-smart-home`. Nó chỉ nên cho các command/service cần thiết, không dùng `NOPASSWD: ALL`. Script user-writable trong home không được cấp NOPASSWD root execution.

## 8. Luồng boot

```text
Linux kernel + systemd
  ├─ network-online
  ├─ mosquitto
  ├─ otbr-agent → RCP → wpan0 → Thread leader
  ├─ matter-controller → storage → mDNS/UDP → Unix socket
  ├─ matter-gateway → MQTT + controller selection
  └─ matter-webui → static HTTP 8080
```

`matter-controller` cần vài giây sau process spawn để mở storage/mDNS và tạo socket. `Type=simple` có thể báo active trước khi socket ready. Health probe retry `ENOENT`/`ECONNREFUSED` trong 10 giây.

## 9. Luồng Web/MQTT hiện đang chạy

```text
Browser widget
→ mqtt.js WebSocket 9001
→ Mosquitto ACL
→ home/control/tx
→ Gateway validation/registry
→ MockMatterController
→ home/control/rx
→ mqtt.js
→ Pinia device store
→ Vue re-render
```

Luồng này đã kiểm tra có authentication và trả OnOff response thành công sau full reboot.

## 10. Luồng Matter thật đã chuẩn bị nhưng chưa cutover

```text
Gateway
→ MatterJsController adapter
→ /run/matter-controller/controller.sock
→ Matter.js Controller
→ CASE/Interaction Model
→ IPv6
→ OTBR/wpan0
→ Thread
→ ESP32-C6 application node
```

Đã có

- Matter.js service
- persistent fabric
- health/list/invoke RPC
- OnOff mapping
- LevelControl mapping một phần
- WindowCovering mapping
- gateway mode `matterjs`

Còn thiếu trước cutover

- BLE adapter hoặc commissioner thay thế
- ESP32-C6 Matter application node
- commission/remove/read RPC
- attribute/event streaming về gateway
- node inventory metadata
- HIL invoke và local-button subscription tests
- VendorCooktop mapping

Vì vậy production gateway giữ `CONTROLLER_MODE=mock` theo chủ đích.

## 11. Security state

Đã có

- Mosquitto authentication và per-user ACL
- no anonymous MQTT
- loopback-only TCP MQTT
- runtime WebUI login
- systemd service users
- `NoNewPrivileges`
- `PrivateDevices`
- `ProtectSystem=strict`
- `ProtectHome=yes`
- memory cgroup limits
- root-only/service-group secrets
- Unix socket mode 0660
- persistent paths tách khỏi repository

Còn thiếu

- HTTPS cho WebUI
- WSS cho MQTT browser
- Bluetooth commissioning hardware
- secure secret backup/rotation workflow
- production Matter VID/PID/DAC strategy
- OTA signing/release gate cho node firmware

## 12. Tài nguyên quan sát gần nhất

```text
RAM total:      khoảng 482 MiB
RAM available:  khoảng 334 MiB
Swap:           0
Disk available: khoảng 548 MiB
Gateway RSS:    khoảng 49 MiB
Controller RSS: khoảng 82 MiB
```

BBB có ít RAM và eMMC. Tránh build C++ lớn song song trên production gateway; nên build artifacts trên máy phát triển/CI rồi deploy.

## 13. Health check hằng ngày

```bash
systemctl is-active mosquitto otbr-agent matter-controller matter-gateway matter-webui
systemctl --failed
sudo /usr/sbin/ot-ctl state
ip -6 addr show wpan0
ss -ltnp
free -h
df -h /
```

Matter Controller health:

```bash
sudo -u matter-gateway /opt/node20/bin/node \
  /home/lesli/agile-dashboard/matter-rpc-health.mjs
```

Authenticated MQTT end-to-end:

```bash
/home/lesli/agile-dashboard/verify-production.sh
```

Không chạy `dataset init new`, không xóa `/var/lib/matter-controller`, không in full Thread dataset và không chmod 666 controller socket.

## 14. Khi một command không hoạt động

Kiểm tra theo thứ tự rẻ nhất

1. WebUI HTTP có mở được không
2. WebUI MQTT badge/login có connected không
3. Mosquitto active và port 9001 listen không
4. Gateway có log request không
5. Zod/registry trả error code nào
6. Controller mode là mock hay matterjs
7. Matter RPC health có ready không
8. Node ID có trong commissioned_nodes không
9. OTBR state có leader/router không
10. wpan0/IPv6 có đúng không
11. application node có online/endpoint đúng không

Không debug RCP khi message chưa rời WebUI hoặc đang bị Mosquitto ACL từ chối.

## 15. Mốc tiếp theo

Ưu tiên kỹ thuật tiếp theo

1. expose `commission`, `removeNode`, `read`, subscription API trong Matter Controller
2. chuẩn bị ESP32-C6 Matter OnOff application node
3. chọn BLE adapter/powered hub hoặc temporary commissioner
4. commission node và verify endpoint discovery
5. forward attribute reports qua RPC/MQTT
6. chạy HIL two-way state synchronization
7. chuyển gateway sang `CONTROLLER_MODE=matterjs`
8. giữ rollback về mock cho tới khi real-node gate đạt
