# Chương 4 — CSS, responsive và TailwindCSS

## Mục tiêu

- hiểu cascade, selector, box model và layout
- đọc được các utility class Tailwind
- hiểu responsive và state-dependent styling

## CSS cơ bản

CSS chọn phần tử rồi áp property.

```css
body {
  min-width: 320px;
  min-height: 100vh;
  margin: 0;
}
```

Box model gồm content, padding, border và margin. Khi một card có `p-5`, nội dung cách biên card một khoảng padding. `border` nằm quanh padding, còn `mt-8` tạo margin bên ngoài.

## Cascade và specificity

Nhiều rule có thể tác động cùng phần tử. Trình duyệt xét nguồn, độ ưu tiên selector và thứ tự. Tailwind giảm nhu cầu viết selector phức tạp bằng các class nhỏ, mỗi class làm một việc.

## Đọc Tailwind như một câu

Ví dụ trong `OnOffCard.vue`.

```html
<article class="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-xl backdrop-blur">
```

- `rounded-2xl` bo góc
- `border` bật đường viền
- `border-white/10` dùng trắng với opacity thấp
- `bg-white/5` tạo nền kính mờ
- `p-5` thêm padding
- `shadow-xl` tạo bóng
- `backdrop-blur` làm mờ nội dung phía sau

## Layout Flexbox và Grid

`flex` phù hợp sắp xếp một chiều. `grid` phù hợp bố cục hàng và cột. `App.vue` dùng `grid gap-5 md:grid-cols-2`, nghĩa là một cột ở màn hình nhỏ và hai cột từ breakpoint `md`.

## Style theo state

Vue có thể tạo class động.

```html
:class="connected ? 'bg-emerald-400' : 'bg-rose-400'"
```

State quyết định style, nhưng state không nên được suy ra ngược từ màu. Nguồn sự thật vẫn là biến `connected`.

## Tailwind v4 trong dự án

- plugin được đăng ký tại `apps/webui/vite.config.ts`
- `apps/webui/src/style.css` import `tailwindcss`
- Vite quét source và tạo CSS chỉ cho class được dùng

## Bài thực hành

1. Đổi card OnOff sang tông xanh lá khi bật.
2. Thêm breakpoint `lg:grid-cols-3` và quan sát layout.
3. Dùng DevTools tắt từng class để hiểu tác dụng.

## Tự kiểm tra

1. Padding khác margin thế nào?
2. Khi nào dùng flex, khi nào dùng grid?
3. `md:` có nghĩa gì?
4. Vì sao không nên dùng màu làm nguồn state?
