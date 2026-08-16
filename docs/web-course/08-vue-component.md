# Chương 8 — Component, props, event và lifecycle

## Mục tiêu

- thiết kế component có trách nhiệm rõ
- truyền dữ liệu bằng props
- xử lý DOM event và lifecycle

## Vì sao chia component

Dashboard có `OnOffCard`, `LevelSlider`, `WindowCoveringCard`, `CooktopPanel` và `ActivityLog`. Mỗi component gom giao diện và logic của một khái niệm.

Component tốt thường

- có input rõ qua props
- phát event hoặc gọi service qua interface rõ
- không biết quá nhiều về component khác
- đủ nhỏ để đọc và test

## Props

```ts
const props = defineProps<{ nodeId: string; endpoint: number }>()
```

Props đi từ cha xuống con. Component con không nên sửa trực tiếp props. `App.vue` truyền cùng `nodeId` nhưng endpoint khác nhau cho từng widget.

## Event

`@click`, `@change` và `@input` là event DOM. Handler có thể là hàm sync hoặc async. Với input, `v-model.number` đồng bộ giá trị và ép thành number.

`CooktopPanel.vue` đọc `event.target` và ép thành `HTMLInputElement`. TypeScript cần phép thu hẹp này vì EventTarget không đảm bảo có field `value`.

## watch

`LevelSlider.vue` có state cục bộ để người dùng kéo và state được báo về từ thiết bị. `watch(reported, ...)` đồng bộ slider khi attribute mới đến.

Hãy tránh watch nếu có thể dùng computed. Watch phù hợp khi cần side effect hoặc đồng bộ hai nguồn có vòng đời khác nhau.

## Lifecycle

`App.vue` dùng

- `onMounted` để đăng ký MQTT listener và connect
- `onBeforeUnmount` để bỏ listener và disconnect

Cleanup ngăn memory leak và callback chạy vào component không còn tồn tại.

## Xử lý lỗi UI

Một Promise từ `sendCommand` có thể reject. UI nên

- kết thúc trạng thái loading bằng `finally`
- hiển thị thông báo dễ hiểu
- không nuốt lỗi im lặng
- không để nút gửi lặp vô hạn

Một số component hiện chưa hiển thị lỗi đầy đủ. Đây là bài tập cải tiến thực tế.

## Bài thực hành

1. Thêm prop `title` cho `OnOffCard`.
2. Tạo component `ErrorBanner.vue` nhận message qua prop.
3. Bắt lỗi trong `LevelSlider.send()` và đưa vào connection store.
4. Thêm trạng thái busy cho rèm để chặn double click.

## Tự kiểm tra

1. Props đi theo hướng nào?
2. Vì sao cần cleanup listener?
3. Khi nào watch hợp lý hơn computed?
4. `finally` hữu ích thế nào trong UI async?
