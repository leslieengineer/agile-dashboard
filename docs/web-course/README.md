# Lập trình Web qua dự án Smart Home Dashboard

Đây là giáo trình nhập môn đến full-stack dành cho người chưa từng học Web. Ta không học bằng các ví dụ rời rạc. Mỗi khái niệm được đối chiếu với một file thật trong dự án này và kết thúc bằng bài thực hành.

## Bạn sẽ đạt được gì

Sau khóa học, bạn có thể

- giải thích một website gồm những lớp nào và dữ liệu đi qua chúng ra sao
- đọc và viết HTML, CSS, JavaScript và TypeScript cơ bản
- xây giao diện bằng Vue 3 và chia giao diện thành component
- quản lý state bằng Pinia
- xây ứng dụng realtime bằng MQTT qua WebSocket
- thiết kế hợp đồng dữ liệu dùng chung với Zod
- hiểu kiến trúc backend Node.js, validation, logging và error handling
- viết unit test và integration test
- hiểu các yêu cầu bảo mật và triển khai một dịch vụ web
- tự thêm một loại thiết bị mới xuyên suốt frontend và backend

## Bản đồ chương

### Phần I — Bức tranh tổng thể và nền tảng

1. [Cách học và chuẩn bị môi trường](00-huong-dan-hoc.md)
2. [Một ứng dụng Web có những gì](01-buc-tranh-tong-the.md)
3. [Trình duyệt, mạng và giao thức](02-trinh-duyet-va-mang.md)
4. [HTML, DOM và khả năng truy cập](03-html-va-dom.md)
5. [CSS, responsive và TailwindCSS](04-css-va-tailwind.md)
6. [JavaScript và TypeScript](05-javascript-typescript.md)
7. [Node.js, npm, workspace và Vite](06-tooling-node-npm-vite.md)

### Phần II — Frontend Vue realtime

8. [Vue 3 và Single File Component](07-vue-co-ban.md)
9. [Component, props, event và lifecycle](08-vue-component.md)
10. [State management với Pinia](09-pinia-state.md)
11. [Bất đồng bộ và MQTT realtime](10-mqtt-realtime.md)

### Phần III — Full-stack và vận hành

12. [Data model Matter, contract và Zod](11-contracts-matter-zod.md)
13. [Backend Node.js, registry và controller](12-backend-gateway.md)
14. [Kiểm thử và gỡ lỗi](13-testing-debugging.md)
15. [Bảo mật và triển khai](14-security-deployment.md)
16. [Đồ án cuối khóa và hướng phát triển](15-capstone.md)

### Phụ lục

- [Từ điển thuật ngữ](99-thuat-ngu.md)
- [Lệnh thường dùng](phu-luc-lenh.md)
- [Đáp án tự kiểm tra](phu-luc-dap-an.md)

## Cách dùng giáo trình

Mỗi chương nên được học theo bốn vòng

1. Đọc mô hình khái niệm.
2. Mở các file được dẫn chiếu và tự tìm đoạn code.
3. Chạy checkpoint để quan sát hành vi.
4. Làm bài thực hành mà không sao chép đáp án.

Không cần nhớ mọi API. Mục tiêu đầu tiên là biết mỗi thành phần tồn tại để giải quyết vấn đề gì, nằm ở đâu và phối hợp với thành phần khác như thế nào.

## Ranh giới quan trọng của dự án

Production platform hiện có Mosquitto auth/ACL, WebUI runtime login, Gateway, OTBR và Matter.js 0.17.9 Controller chạy systemd và tự phục hồi sau reboot. Gateway vẫn chọn `MockMatterController` vì chưa có node commissioned/BLE adapter. Matter.js adapter đã tồn tại nhưng chưa cutover hardware.

## Khóa liên quan

- [Linux trên BBB](../linux-course/README.md)
- [Matter và Thread](../matter-thread-course/README.md)
