# Chương 2 — Trình duyệt, mạng và giao thức

## Mục tiêu

- hiểu client/server, IP, port và URL
- phân biệt HTTP, WebSocket và MQTT
- biết tại sao WebUI dùng cổng 9001 còn gateway dùng 1883

## IP và port

IP xác định máy. Port xác định dịch vụ trên máy đó. BBB có thể đồng thời chạy nhiều dịch vụ.

| Dịch vụ | Port ví dụ |
|---|---:|
| WebUI HTTP | 8080 |
| MQTT TCP | 1883 |
| MQTT WebSocket | 9001 |

URL `http://192.168.1.192:8080/` nghĩa là dùng HTTP đến máy `192.168.1.192`, port `8080`, đường dẫn `/`.

## HTTP

HTTP thường theo mô hình request/response. Trình duyệt yêu cầu HTML, CSS hoặc JavaScript và server trả file. Python `http.server` mà ta dùng trên BBB chỉ làm nhiệm vụ này.

## WebSocket

WebSocket giữ một kết nối hai chiều lâu dài. Server có thể đẩy dữ liệu về trình duyệt mà không cần đợi một request HTTP mới. Điều này phù hợp trạng thái Smart Home realtime.

## MQTT

MQTT là giao thức publish/subscribe. MQTT nguyên bản chạy trên TCP, nhưng trình duyệt bị sandbox và không được mở socket TCP tùy ý. Vì vậy mqtt.js trong browser dùng MQTT bọc trong WebSocket.

- WebUI kết nối `ws://host:9001`
- gateway Node.js kết nối `mqtt://127.0.0.1:1883`

Xem cấu hình tại `deploy/mosquitto/matter.conf` và code tại `apps/webui/src/services/mqttClient.ts`.

## JSON trên đường truyền

JavaScript object chỉ tồn tại trong tiến trình. Muốn gửi qua mạng, ta serialize bằng `JSON.stringify`. Khi nhận, ta deserialize bằng `JSON.parse`.

JSON không có kiểu `BigInt`, `Date`, `Map` hoặc method. Vì vậy contract phải chọn kiểu dữ liệu truyền được, chẳng hạn `node_id` là chuỗi hex.

## Các lỗi mạng thường gặp

- `connection refused` nghĩa là không có dịch vụ nghe tại IP/port
- timeout nghĩa là không nhận phản hồi trong thời gian cho phép
- CORS liên quan quyền request HTTP giữa origin, không phải mọi lỗi mạng đều là CORS
- mixed content xảy ra khi trang HTTPS cố mở WebSocket không mã hóa `ws://`
- firewall có thể chặn port dù tiến trình đang chạy

## Bài thực hành

1. Mở DevTools Network và tìm kết nối WebSocket.
2. Dừng broker rồi quan sát badge kết nối.
3. Chạy `curl.exe -I http://192.168.1.192:8080/` và đọc status code.

## Tự kiểm tra

1. IP và port khác nhau thế nào?
2. Vì sao browser không kết nối thẳng MQTT TCP 1883?
3. WebSocket có thay thế MQTT không?
4. `JSON.stringify` giải quyết vấn đề gì?
