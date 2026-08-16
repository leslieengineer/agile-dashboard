# Chương 9 — State management với Pinia

## Mục tiêu

- phân biệt local state và shared state
- hiểu store, action và reactive reference
- đọc mô hình normalized device state

## State là gì

State là dữ liệu có thể thay đổi và ảnh hưởng hành vi hoặc giao diện. Ví dụ gồm trạng thái MQTT, attribute thiết bị, slider đang kéo và danh sách hoạt động.

## Local hay global

Local state chỉ một component cần, chẳng hạn `busy` của nút. Shared state được nhiều component dùng, chẳng hạn trạng thái thiết bị hoặc kết nối MQTT.

Đưa mọi thứ vào global store làm luồng dữ liệu khó hiểu. Giữ state gần nơi dùng nhất có thể.

## Ba store trong dự án

### Connection store

`stores/connection.ts` giữ `connected` và `error`.

### Activity store

`stores/activity.ts` giữ 20 message gần nhất. `unshift` thêm đầu danh sách, `slice` giới hạn kích thước.

### Device store

`stores/devices.ts` nhóm dữ liệu theo khóa `node_id:endpoint`, rồi theo cluster ID.

```text
node:endpoint
  └─ cluster
      └─ attributes
```

Cấu trúc normalized tránh một object lồng theo giao diện cụ thể. Nhiều widget có thể đọc cùng nguồn state.

## Actions

Action là hàm thay đổi state. Việc gom mutation vào action giúp đặt tên ý nghĩa và kiểm thử dễ hơn.

`apply(message)` nhận response hoặc event, tìm attributes rồi merge vào cluster hiện tại. Spread syntax giữ attribute cũ không có trong message mới.

## storeToRefs

Destructure trực tiếp property từ store có thể làm mất reactivity. `ConnectionBadge.vue` dùng `storeToRefs` để lấy ref reactive.

## State từ server là nguồn sự thật

UI gửi command nhưng không nên luôn giả định command thành công. Dự án cập nhật device store từ response/event gateway. Cách này là pessimistic update. Optimistic update nhanh hơn nhưng cần rollback nếu backend từ chối.

## Bài thực hành

1. Thêm action `clear()` cho activity store.
2. Thêm nút Clear history vào `ActivityLog.vue`.
3. Viết getter trả tất cả endpoint của một node.
4. Quan sát test `apps/webui/test/devices.test.ts` rồi thêm test merge hai attribute.

## Tự kiểm tra

1. Khi nào state nên ở component?
2. Vì sao device state dùng khóa node và endpoint?
3. `storeToRefs` giải quyết vấn đề gì?
4. Optimistic update có rủi ro gì?
