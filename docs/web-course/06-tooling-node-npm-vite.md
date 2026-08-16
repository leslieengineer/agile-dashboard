# Chương 6 — Node.js, npm, workspace và Vite

## Mục tiêu

- hiểu Node.js khác trình duyệt thế nào
- đọc được package.json và npm script
- hiểu monorepo, dependency, build và dev server

## Node.js

Node.js chạy JavaScript ngoài trình duyệt. Gateway dùng Node vì cần kết nối MQTT TCP, đọc environment và chạy như Linux service. Vite và Vitest cũng là công cụ Node chạy trên máy phát triển.

Browser có DOM và `window`; Node có filesystem, process và network API. Không phải package Node nào cũng chạy được trong browser.

## package.json

File `package.json` gốc khai báo workspace và script tổng hợp. Mỗi package con có dependency riêng.

- `dependencies` cần khi chương trình chạy
- `devDependencies` chỉ phục vụ build, test hoặc phát triển
- version `^5.10.3` cho phép cập nhật tương thích trong cùng major version
- `private: true` ngăn publish nhầm monorepo

## npm workspace

Workspace cho phép quản lý nhiều package trong một repository.

```text
apps/webui                 @agile/webui
packages/contracts         @agile/contracts
packages/gateway           @agile/gateway
packages/matter-controller @agile/matter-controller
```

WebUI và gateway cùng import `@agile/contracts` mà không phải copy code.

## Script

```bat
npm run build
npm run typecheck
npm test
npm run dev -w @agile/webui
```

Script là giao diện ổn định cho nhóm. Người dùng không cần nhớ toàn bộ lệnh `tsc`, `vite` hoặc `vitest` phía dưới.

## Vite

Vite cung cấp

- dev server
- Hot Module Replacement
- compile Vue Single File Component
- bundle production
- xử lý biến `import.meta.env`

Biến muốn xuất hiện trong browser phải bắt đầu bằng `VITE_`. Điều đó không làm biến trở thành bí mật. Mọi dữ liệu gửi tới browser đều có thể bị người dùng xem.

## Build production

`npm run build` tạo file tối ưu trong `dist`. Production server chỉ cần phục vụ HTML, CSS và JavaScript đã build, không cần Vite dev server.

## Bài thực hành

1. Đọc script build gốc và giải thích thứ tự ba workspace.
2. Đổi `VITE_REQUEST_TIMEOUT_MS` rồi restart Vite.
3. So sánh source `App.vue` với file JavaScript trong `apps/webui/dist`.

## Tự kiểm tra

1. Node.js khác browser ở điểm nào?
2. Tại sao contracts là package riêng?
3. HMR giúp ích gì?
4. Vì sao `VITE_PASSWORD` không phải secret?
