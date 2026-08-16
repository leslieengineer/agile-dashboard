# Chương 5 — JavaScript và TypeScript

## Mục tiêu

- đọc được biến, hàm, object, array và module
- hiểu Promise, async/await và event loop ở mức thực dụng
- hiểu TypeScript thêm kiểm tra gì lên JavaScript

## JavaScript là ngôn ngữ chạy chương trình Web

Các cấu trúc thường gặp trong repository

```ts
const TOPIC_TX = 'home/control/tx'
const zones = [0, 0, 0, 0]
const command = { endpoint: 1, cluster: 'OnOff' }
const key = `${command.endpoint}:${command.cluster}`
```

- `const` ngăn gán lại binding
- object gom các field có tên
- array lưu danh sách theo index
- template literal chèn biểu thức vào chuỗi

## Hàm và module

```ts
export function normalizeNodeId(value: string | number): string {
  // ...
}
```

`export` công khai symbol. File khác dùng `import`. Module giúp chia chương trình thành các phần có trách nhiệm rõ ràng.

## Bất đồng bộ

MQTT và timer không hoàn tất ngay. `Promise` đại diện một kết quả trong tương lai. `await` tạm dừng hàm async mà không khóa toàn bộ event loop.

Trong `mqttClient.ts`, `sendCommand` tạo Promise rồi lưu `resolve`, `reject` và timer vào một `Map`. Khi response có cùng `request_id` đến, client lấy đúng Promise và resolve nó.

## Event loop

JavaScript thường chạy một luồng chính. I/O mạng và timer được runtime theo dõi. Khi có kết quả, callback được đưa vào hàng đợi. Vì vậy không nên chạy vòng lặp CPU dài trong UI hoặc gateway.

## TypeScript bổ sung kiểu

```ts
interface CommandInput {
  node_id: string
  endpoint: number
  payload: Record<string, unknown>
}
```

TypeScript phát hiện nhiều sai sót trước khi chạy. Nó không thay thế validation runtime, vì dữ liệu MQTT vẫn có thể đến từ chương trình không dùng TypeScript.

## Các kiểu quan trọng

- union `string | number` cho phép một trong nhiều kiểu
- `unknown` buộc kiểm tra trước khi sử dụng
- generic như `Map<string, Pending>` mô tả kiểu key và value
- type guard như `isRecord` thu hẹp `unknown`
- optional property có dấu `?`

Dự án bật `strict`, `noUncheckedIndexedAccess` và `exactOptionalPropertyTypes` trong `tsconfig.base.json`.

## Lỗi và exception

`throw` dừng luồng hiện tại và chuyển sang `catch`. Chỉ catch khi bạn có thể thêm ngữ cảnh, chuyển lỗi thành model chuẩn hoặc phục hồi. Không nên catch rồi bỏ qua hoàn toàn.

## Bài thực hành

1. Viết hàm `percentToLevel(percent)` trả giá trị 0–254.
2. Khai báo interface `LightState` có `on` và `level`.
3. Truyền cố ý chuỗi vào field number rồi chạy typecheck.
4. Tìm ba vị trí dùng `async/await` trong `mqttClient.ts`.

## Tự kiểm tra

1. TypeScript có kiểm tra được JSON từ mạng không?
2. `unknown` an toàn hơn `any` thế nào?
3. Promise giải quyết vấn đề gì?
4. Tại sao cần `request_id` khi nhiều command chạy đồng thời?
