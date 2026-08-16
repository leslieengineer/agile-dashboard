# Chương 0 — Cách học và chuẩn bị môi trường

## Mục tiêu

- biết cách chạy dự án bằng ba tiến trình
- biết dùng VS Code, terminal và DevTools
- thiết lập nhịp học đọc, sửa, chạy, quan sát

## Công cụ cần có

- VS Code
- Node.js từ 20.11 trở lên
- npm
- trình duyệt Chrome, Edge hoặc Firefox
- extension Vue - Official cho VS Code

Kiểm tra môi trường trên Windows bằng `cmd`.

```bat
node --version
npm --version
npm install
npm run typecheck
npm test
npm run build
```

Kết quả chuẩn của repository hiện tại là typecheck thành công, 10 test đạt và ba package build được.

## Ba tiến trình khi phát triển

Một ứng dụng realtime không chỉ có một chương trình. Mở ba terminal riêng.

Terminal 1 chạy broker học tập.

```bat
node deploy\demo\broker.cjs
```

Terminal 2 chạy backend gateway.

```bat
set MQTT_USERNAME=demo
set MQTT_PASSWORD=demo
npm run dev:gateway
```

Terminal 3 chạy frontend.

```bat
npm run dev:webui
```

Sau đó mở `http://localhost:5173`.

## Ba công cụ quan sát

- tab **Elements** cho biết HTML/DOM cuối cùng
- tab **Console** hiển thị lỗi JavaScript
- tab **Network** hiển thị HTTP, WebSocket và frame MQTT

Mở DevTools bằng `F12`. Trong tab Network, lọc `WS`, chọn kết nối đến cổng `9001` rồi xem Messages.

## Quy tắc thực hành

- chỉ thay đổi một ý tại một thời điểm
- đọc thông báo lỗi từ dòng đầu tiên liên quan đến file của mình
- chạy `npm run typecheck` trước khi nghĩ rằng code đã đúng
- chạy test sau khi sửa logic
- không đưa password thật vào source code

## Bài thực hành

1. Chạy `npm test` và tìm tên năm file test.
2. Chạy WebUI rồi đổi tiêu đề trong `apps/webui/index.html`.
3. Mở DevTools và tìm file JavaScript được Vite tải.

## Tự kiểm tra

1. Vì sao cần ba terminal?
2. Typecheck khác test ở điểm nào?
3. DevTools Network giúp quan sát điều gì?
4. Vì sao không nên sửa nhiều vấn đề cùng lúc?

## Checkpoint

Bạn hoàn thành chương khi `npm run typecheck`, `npm test` và `npm run build` đều thành công.
