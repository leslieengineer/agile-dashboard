# Hướng dẫn hiểu toàn bộ hệ thống Smart Home hiện tại

Tài liệu này dành cho người mới, chưa biết Web, Linux, MQTT, Thread hoặc Matter. Mục tiêu là sau khi đọc xong, bạn có thể trả lời được:

- trong hệ thống đang có những phần nào
- mỗi phần chạy ở đâu
- khi bấm một nút trên Web thì dữ liệu đi qua đâu
- phần nào đang chạy thật, phần nào còn mô phỏng
- ESP32-C6 RCP khác ESP32-C6 thiết bị Smart Home thế nào
- dữ liệu nào được lưu lâu dài
- khi có lỗi thì kiểm tra ở tầng nào
- cần làm gì tiếp theo để điều khiển thiết bị thật

---

## 1. Tóm tắt trong một phút

Hệ thống hiện có một BeagleBone Black làm Linux Gateway. BBB chạy WebUI, MQTT broker, Gateway application, OpenThread Border Router và Matter Controller.

Một ESP32-C6 đang làm radio Thread cho BBB. ESP32-C6 này là **RCP**, không phải ổ cắm hoặc công tắc Smart Home.

```text
Máy tính/điện thoại
        │ mở trang Web
        ▼
WebUI trên BBB
        │ MQTT WebSocket
        ▼
Mosquitto MQTT Broker
        │ chuyển command
        ▼
Node.js Gateway
        │ hiện tại gọi Mock Controller
        ▼
Trạng thái thiết bị mô phỏng
```

Phần Thread/Matter thật cũng đã được chuẩn bị:

```text
Matter.js Controller
        │ IPv6/Matter
        ▼
OTBR trên BBB
        │ Spinel qua USB
        ▼
ESP32-C6 RCP
        │ Thread radio
        ▼
ESP32-C6 application node trong tương lai
```

Hiện tại:

- WebUI chạy thật
- MQTT chạy thật
- authentication và ACL chạy thật
- Gateway chạy thật
- OTBR và Thread network chạy thật
- Matter Controller service chạy thật
- thiết bị được điều khiển trên Dashboard vẫn là mô phỏng
- chưa có ESP32-C6 Matter application node
- chưa có Bluetooth adapter để commission node Thread factory-new

---

## 2. Các khái niệm cần biết trước

### WebUI

Trang Web người dùng nhìn thấy. WebUI hiển thị công tắc, slider, rèm, bếp và lịch sử hoạt động.

### MQTT Broker

Có thể hình dung như bưu điện. Chương trình gửi message vào một topic. Broker chuyển message cho những chương trình đã đăng ký topic đó.

### Gateway

Là bộ kiểm tra và phiên dịch. Gateway nhận JSON từ MQTT, kiểm tra dữ liệu rồi chuyển nó thành lời gọi tới controller phù hợp.

### Matter Controller

Là bên quản lý Matter fabric và điều khiển Matter nodes. Nó tạo secure session, gửi command, đọc attributes và nhận subscriptions.

### OTBR

OpenThread Border Router. Nó nối mạng Ethernet/IP của BBB với mạng Thread radio.

### RCP

Radio Co-Processor. ESP32-C6 RCP chỉ xử lý radio IEEE 802.15.4. Nó không có Smart Home endpoint và không nhận JSON MQTT.

### Application node

Thiết bị Smart Home thật, ví dụ ổ cắm, đèn hoặc rèm. Nó chạy ESP-Matter firmware và có endpoint/cluster/attribute.

### Mock Controller

Bộ mô phỏng thiết bị trong RAM. Nó giúp xây WebUI và Gateway trước khi có node phần cứng thật.

---

## 3. Phần cứng hiện có

### BeagleBone Black

BBB là máy Linux trung tâm. Nó có nhiệm vụ:

- phục vụ trang Web
- chạy MQTT broker
- chạy Node.js Gateway
- chạy Matter.js Controller
- chạy OpenThread Border Router
- quản lý mạng Thread

BBB đang chạy Debian 11 trên CPU ARMv7.

### ESP32-C6 RCP

ESP32-C6 đã được flash firmware `ot_rcp` với USB Serial/JTAG transport.

BBB nhìn thấy RCP qua một đường dẫn USB ổn định:

```text
/dev/serial/by-id/usb-Espressif_USB_JTAG_serial_debug_unit_98:A3:16:AA:96:9C-if00
```

OTBR nói chuyện với RCP bằng Spinel/HDLC ở 460800 baud.

### Phần cứng chưa có

- ESP32-C6 chạy firmware Matter application node
- Bluetooth USB adapter trên BBB
- powered USB hub để dùng RCP và Bluetooth adapter cùng lúc
- relay/motor/sensor thực tế của từng sản phẩm

---

## 4. Những chương trình đang chạy trên BBB

Có năm service chính. Systemd khởi động và giám sát chúng.

```text
mosquitto.service
otbr-agent.service
matter-controller.service
matter-gateway.service
matter-webui.service
```

Tất cả hiện đang `active` và `enabled`, nghĩa là:

- process đang chạy
- tự chạy lại sau reboot

### Mosquitto

Mosquitto là MQTT broker.

Nó nghe ở hai cổng:

```text
127.0.0.1:1883   MQTT TCP nội bộ cho Gateway
0.0.0.0:9001     MQTT WebSocket cho trình duyệt trong LAN
```

Mosquitto không cho anonymous. Nó có hai user:

- `webui`
- `gateway`

Mỗi user chỉ có quyền trên những topic cần thiết.

### Matter WebUI

Service này phục vụ các file HTML, CSS và JavaScript tại:

```text
http://192.168.1.192:8080/
```

Trình duyệt tải các file về rồi chạy Vue application trên máy người dùng.

### Matter Gateway

Đây là chương trình Node.js nhận MQTT command.

Nó chịu trách nhiệm:

- đọc message từ `home/control/tx`
- kiểm tra kích thước message
- parse JSON
- validate schema
- chuẩn hóa node/endpoint/cluster/command
- tìm command handler
- gọi controller
- publish kết quả vào `home/control/rx`

### Matter Controller

Matter.js Controller là service riêng.

Nó chịu trách nhiệm:

- giữ Matter fabric credentials
- quản lý commissioned nodes
- tạo Matter sessions
- gửi Matter command
- sau này nhận attributes/events từ nodes

Gateway giao tiếp với Controller qua Unix socket:

```text
/run/matter-controller/controller.sock
```

### OTBR

OTBR quản lý mạng Thread và radio RCP.

Nó tạo interface:

```text
wpan0
```

Thread network hiện tại:

```text
Network name: OpenThread-0a76
Channel:      14
PAN ID:       0x0a76
Role:         leader
```

---

## 5. Điều gì xảy ra khi mở WebUI

### Bước 1 — Trình duyệt yêu cầu trang Web

Browser gửi HTTP request tới:

```text
http://192.168.1.192:8080/
```

BBB trả về:

- `index.html`
- CSS
- JavaScript bundle

### Bước 2 — Vue application khởi động

JavaScript chạy trong trình duyệt.

Vue tạo các component:

- Smart Switch
- Light Level
- Window Covering
- Cooktop Panel
- Activity Log

Pinia tạo shared state cho:

- MQTT connection
- device attributes
- activity history

### Bước 3 — Người dùng nhập MQTT login

Dashboard hiển thị form:

- WebSocket URL
- username
- password

Credential chỉ nằm trong memory của tab. Nó không được lưu vào localStorage.

### Bước 4 — mqtt.js kết nối Mosquitto

WebUI mở kết nối:

```text
ws://192.168.1.192:9001
```

Mosquitto kiểm tra username/password và ACL.

Nếu đúng, WebUI subscribe:

```text
home/control/rx
```

---

## 6. Điều gì xảy ra khi bấm nút Turn On

Đây là luồng quan trọng nhất.

### Bước 1 — Component tạo command

OnOffCard tạo một object:

```json
{
  "node_id": "0x0000000000000001",
  "endpoint": 1,
  "cluster": "OnOff",
  "command": "On",
  "payload": {}
}
```

MQTT client thêm `request_id` UUID.

### Bước 2 — Object được chuyển thành JSON

JavaScript object không thể gửi trực tiếp qua mạng. `JSON.stringify` chuyển nó thành chuỗi.

### Bước 3 — WebUI publish MQTT

WebUI gửi chuỗi JSON vào:

```text
home/control/tx
```

### Bước 4 — Mosquitto kiểm tra ACL

User `webui` được phép ghi TX nhưng không được giả làm gateway ghi mọi topic.

### Bước 5 — Gateway nhận message

Gateway đã subscribe TX. Nó nhận bytes và thực hiện pipeline:

```text
byte limit
→ JSON parse
→ envelope validation
→ ID resolution
→ handler lookup
→ payload validation
→ controller invoke
```

Nếu sai, Gateway không gọi controller. Nó trả một typed error.

### Bước 6 — Registry chọn handler

Ví dụ:

```text
cluster 0x0006 + command 0x01
→ OnOff.On handler
```

Registry giúp thêm cluster mới mà không viết một switch khổng lồ trong dispatcher.

### Bước 7 — Controller xử lý

Hiện Gateway dùng:

```text
CONTROLLER_MODE=mock
```

Mock Controller đổi state trong RAM:

```text
OnOff = true
```

### Bước 8 — Gateway tạo response

```json
{
  "request_id": "uuid",
  "node_id": "0x0000000000000001",
  "endpoint": 1,
  "cluster": 6,
  "command": 1,
  "status": "ok",
  "result": {
    "attributes": {
      "OnOff": true
    }
  }
}
```

### Bước 9 — Gateway publish RX

Gateway gửi response vào:

```text
home/control/rx
```

### Bước 10 — WebUI cập nhật state

mqtt.js nhận response và dùng `request_id` tìm đúng Promise đang chờ.

Pinia Device Store merge:

```text
node → endpoint → cluster → attributes
```

Vue thấy state đổi và tự render nút thành ON.

---

## 7. Response và Event khác nhau thế nào

### Response

Trả lời một request cụ thể. Nó có `request_id`.

### Event

Mô tả state thay đổi, có thể không bắt nguồn từ WebUI.

Ví dụ người dùng bấm nút vật lý trên ESP32. Node cập nhật Matter attribute. Controller subscription nhận report. Gateway publish event. WebUI tự cập nhật.

Event path từ Matter.js tới Gateway hiện chưa hoàn thiện. Đây là một blocker trước khi điều khiển node thật hai chiều.

---

## 8. Dữ liệu được kiểm tra như thế nào

Frontend và Gateway dùng chung package contracts.

Request bắt buộc có:

- request ID
- node ID
- endpoint
- cluster
- command
- payload

Zod kiểm tra lúc runtime.

Ví dụ LevelControl chỉ chấp nhận:

```text
level từ 0 đến 254
```

Nếu gửi 255, Gateway trả:

```text
INVALID_PAYLOAD
```

Validation bảo vệ cả bug và input không tin cậy.

---

## 9. Mock node hiện có những gì

Mock dùng một node tổng hợp:

```text
Node 0x0000000000000001
```

### Endpoint 1

- OnOff
- LevelControl

### Endpoint 2

- WindowCovering

### Endpoint 3

- VendorCooktop prototype

Mock state nằm trong RAM. Khi Gateway restart, mock state trở về giá trị khởi tạo.

Mock node không phải ESP32-C6 application node và không tồn tại trong Thread child table.

---

## 10. Phần Matter thật hiện đã có gì

Matter.js Controller service đã chạy và trả health:

```json
{
  "ready": true,
  "controller": "matter.js",
  "version": "0.17.9",
  "commissioned_nodes": []
}
```

Đã có:

- persistent Matter fabric
- persistent controller credentials
- mDNS/UDP networking
- Unix RPC
- list nodes
- invoke API
- Gateway Matter.js adapter
- mapping OnOff
- mapping LevelControl một phần
- mapping WindowCovering

Chưa có:

- commissioned application node
- BLE commissioning hardware
- commission RPC
- remove-node RPC
- read RPC
- subscription/event stream
- VendorCooktop Matter adapter

---

## 11. Nếu chuyển sang Matter thật, luồng sẽ thay đổi ở đâu

WebUI, MQTT, validation và Registry gần như giữ nguyên.

Chỉ controller implementation đổi:

```text
MockMatterController
```

thành:

```text
MatterJsController
```

Luồng mới:

```text
Gateway handler
→ Unix RPC
→ Matter.js Controller
→ secure Matter CASE session
→ IPv6
→ OTBR
→ Thread
→ ESP32-C6 application node
```

Kết quả và attribute reports quay ngược lại cùng đường.

Gateway chưa chuyển mode vì chưa có node để kiểm chứng HIL và subscription.

---

## 12. RCP khác application node như thế nào

### ESP32-C6 RCP hiện tại

- firmware `ot_rcp`
- chỉ làm radio
- nối USB với BBB
- không có OnOff endpoint
- không có relay hoặc button Smart Home logic
- do OTBR sở hữu

### ESP32-C6 application node tương lai

- firmware ESP-Matter
- join Thread network bằng credentials
- được commission vào Matter fabric
- có endpoint và clusters
- điều khiển relay/motor/sensor
- update attributes khi local state đổi

Cần hai vai trò riêng. Không coi RCP hiện tại là ổ cắm Matter.

---

## 13. Vì sao cần Bluetooth

Một Thread node factory-new chưa biết Thread Network Key nên chưa có IPv6 address trong mạng.

BLE thường dùng để tạo PASE session ban đầu. Controller gửi Thread credentials cho node. Node join Thread, sau đó nhận Matter operational credentials và dùng CASE.

BBB hiện không có Bluetooth adapter.

Hướng đề xuất:

```text
BBB USB host
  → powered USB hub
      → ESP32-C6 RCP
      → Linux-compatible Bluetooth 5.x adapter
```

Cũng có thể dùng commissioner khác rồi multi-admin, nhưng đó là flow phức tạp hơn.

---

## 14. Những gì được lưu lâu dài

### Mosquitto

```text
/var/lib/mosquitto
/etc/mosquitto/passwd
/etc/mosquitto/aclfile
```

### Matter Controller

```text
/var/lib/matter-controller
```

Chứa fabric/controller state. Không xóa khi chưa backup.

### Thread

OTBR/OpenThread lưu active dataset/settings dưới state path của OpenThread, hiện build dùng `/var/lib/thread`.

### Gateway config

```text
/etc/matter-gateway/gateway.env
```

### WebUI login cho operator

```text
/home/leslie/agile-dashboard/webui-login.txt
```

Không commit các file credential này.

---

## 15. Hệ thống tự khởi động như thế nào

Sau khi BBB boot:

1. Linux kernel khởi tạo hardware và network.
2. systemd chạy Mosquitto.
3. systemd chạy OTBR và mở RCP.
4. OTBR tạo wpan0 và attach Thread dataset.
5. Matter Controller mở persistent fabric và Unix socket.
6. Gateway kết nối MQTT.
7. WebUI static server mở port 8080.

Thread có thể tạm `detached` vài giây rồi trở lại `leader`.

Matter Controller có thể báo process active trước khi socket ready. Health probe retry trong 10 giây để xử lý startup race này.

---

## 16. Security hiện có

### MQTT

- anonymous bị tắt
- username/password riêng
- ACL theo topic
- TCP 1883 chỉ loopback

### Linux process

- mỗi service có user riêng
- không chạy Gateway/Matter Controller bằng root
- filesystem protection
- home protection
- device isolation
- memory limits

### Unix RPC

- socket mode 0660
- group `matter-rpc`
- Gateway được connect socket
- Gateway không được đọc fabric storage

### Còn thiếu

- HTTPS cho WebUI
- WSS cho MQTT browser
- Bluetooth commissioning adapter
- production Matter certificates/VID/PID
- node secure boot, flash encryption và OTA signing

---

## 17. Hiện người dùng có thể làm gì

Có thể:

- mở Dashboard
- đăng nhập MQTT
- bật/tắt smart switch mô phỏng
- đổi light level mô phỏng
- điều khiển rèm mô phỏng
- thử cooktop prototype
- xem activity realtime
- reboot BBB mà services tự trở lại
- kiểm tra Thread network leader
- kiểm tra Matter Controller health

Chưa thể:

- commission ESP32-C6 Matter node
- điều khiển relay thật qua Matter
- nhận local button report từ node thật
- chuyển production Gateway sang Matter.js mode
- dùng Cooktop vendor cluster thật

---

## 18. Cách kiểm tra hệ thống còn khỏe

```bash
systemctl is-active mosquitto otbr-agent matter-controller matter-gateway matter-webui
sudo /usr/sbin/ot-ctl state
free -h
df -h /
```

Kết quả mong đợi:

```text
active
active
active
active
active
leader
```

Kiểm tra Matter Controller:

```bash
sudo -u matter-gateway /opt/node20/bin/node \
  /home/leslie/agile-dashboard/matter-rpc-health.mjs
```

Kiểm tra MQTT command:

```bash
/home/leslie/agile-dashboard/verify-production.sh
```

---

## 19. Khi lỗi, nên tìm ở đâu

### Không mở được WebUI

Kiểm tra `matter-webui`, port 8080 và IP BBB.

### WebUI mở nhưng MQTT offline

Kiểm tra URL 9001, credential, Mosquitto và ACL.

### MQTT connected nhưng command lỗi

Đọc Gateway log và error code. Kiểm tra payload, node, endpoint, cluster và command.

### Matter.js health lỗi ENOENT

Controller vừa restart và socket chưa ready, hoặc service fail. Chạy health probe có retry và kiểm tra service log.

### Thread detached

Đợi attach process, kiểm tra RCP/OTBR log và wpan0. Không tạo dataset mới.

### Node not commissioned

Đây là trạng thái hiện tại. Cần application node, BLE/commissioner và commissioning API.

---

## 20. Công việc tiếp theo theo đúng thứ tự

1. Mở rộng Controller RPC với `commission`.
2. Thêm `removeNode` và `read`.
3. Thêm long-lived attribute/event subscriptions.
4. Chuẩn bị ESP32-C6 Matter OnOff node.
5. Có BLE adapter hoặc commissioner thay thế.
6. Commission node vào fabric.
7. Kiểm tra endpoint/cluster thật.
8. Invoke OnOff từ Gateway.
9. Bấm local button và nhận report về WebUI.
10. Chạy reboot/reconnect/HIL gates.
11. Chuyển Gateway sang `CONTROLLER_MODE=matterjs`.
12. Giữ rollback về mock cho tới khi hệ thống thật ổn định.

---

## 21. Nên đọc gì tiếp theo

- [Linux Gateway as-built kỹ thuật](full-context/10-linux-gateway-as-built.md)
- [Khóa Linux](linux-course/README.md)
- [Khóa Web](web-course/README.md)
- [Khóa Matter/Thread](matter-thread-course/README.md)
- [Full Context bàn giao](full-context/README.md)

Tài liệu này là điểm bắt đầu để hiểu toàn hệ thống. Các tài liệu còn lại đi sâu từng chuyên ngành.
