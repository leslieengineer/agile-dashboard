# Chương 1 — Matter, Thread và các lớp giao thức

## Mục tiêu

- phân biệt radio, network và application
- biết MQTT nằm ngoài Matter node
- lần theo packet theo tầng

## Stack

```text
Matter application
IPv6 + UDP
Thread mesh + 6LoWPAN
IEEE 802.15.4 MAC/PHY
2.4 GHz radio
```

IEEE 802.15.4 định nghĩa radio/MAC công suất thấp. Thread xây mesh IPv6 trên đó. Matter định nghĩa device model, security và Interaction Model chạy trên IP.

Matter không thay thế Thread. Thread cũng không biết OnOff là gì.

## MQTT nằm ở đâu

```text
Vue WebUI ↔ MQTT broker ↔ Node Gateway ↔ Matter Controller ↔ Matter node
```

MQTT là API nội bộ của Gateway/Web. ESP32-C6 application node không nhận JSON topic `home/control/tx`.

Gateway dịch envelope thành Matter Invoke. Response/subscription từ Matter được normalize thành MQTT RX.

## Một command On

1. UI publish MQTT JSON.
2. Gateway validate và chọn handler.
3. Matter adapter gọi OnOff command endpoint.
4. Matter.js tạo secure interaction qua CASE.
5. IPv6 packet đi qua OTBR/Thread.
6. Node đổi output và report attribute.
7. Gateway phát event về WebUI.

## Bài thực hành

Với mỗi item sau, đặt nó vào tầng đúng: channel 14, Node ID, topic MQTT, cluster 0x0006, USB Spinel, IPv6 address, GPIO relay.

## Tự kiểm tra

1. Thread có định nghĩa cluster không?
2. Matter có bắt buộc dùng Thread không?
3. MQTT JSON có đi xuống RCP không?
4. 6LoWPAN giải quyết điều gì?
