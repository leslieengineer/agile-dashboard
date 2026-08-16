# Chương 7 — Vue 3 và Single File Component

## Mục tiêu

- hiểu cách Vue mount vào DOM
- đọc được cấu trúc một file `.vue`
- sử dụng interpolation, directive và reactive state

## Khởi động Vue

`apps/webui/src/main.ts` tạo application, cài Pinia rồi mount vào `#app`.

```ts
createApp(App).use(createPinia()).mount('#app')
```

`App.vue` là component gốc. Nó chứa các component nhỏ hơn và tạo thành cây component.

## Single File Component

Một file `.vue` thường có ba phần

- `<script setup>` chứa logic
- `<template>` mô tả giao diện
- `<style>` chứa CSS cục bộ nếu cần

Dự án dùng Tailwind nên phần style thường nằm ở class hoặc `style.css` chung.

## Template syntax

- `{{ value }}` hiển thị text
- `:attribute="expression"` bind attribute
- `@click="handler"` lắng nghe event
- `v-if` render có điều kiện
- `v-for` render danh sách

Xem `ActivityLog.vue` để thấy `v-if`, `v-else` và `v-for` trong một ví dụ ngắn.

## Reactivity

`ref` bọc một giá trị reactive. Trong script dùng `.value`; template tự unwrap. `computed` tạo giá trị dẫn xuất và chỉ cập nhật khi dependency thay đổi.

```ts
const busy = ref(false)
const on = computed(() => Boolean(attributes.OnOff))
```

Không nên lưu cả `level` và `levelPercent` thành hai nguồn state độc lập nếu một giá trị có thể tính từ giá trị kia.

## Render khai báo

Bạn mô tả giao diện nên trông thế nào với state hiện tại. Vue chịu trách nhiệm cập nhật DOM. Đây là declarative UI, khác cách tự tìm element rồi thay `innerHTML`.

## Bài thực hành

1. Thêm `ref` đếm số lần bấm vào một card.
2. Dùng `v-if` hiển thị cảnh báo khi MQTT offline.
3. Dùng `computed` đổi level 0–254 thành phần trăm.

## Tự kiểm tra

1. `App.vue` liên hệ với `index.html` thế nào?
2. `ref` khác biến thường ở điểm nào?
3. Khi nào dùng `computed`?
4. Directive `v-for` cần `key` để làm gì?
