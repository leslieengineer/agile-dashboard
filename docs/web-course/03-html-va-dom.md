# Chương 3 — HTML, DOM và khả năng truy cập

## Mục tiêu

- hiểu cấu trúc một tài liệu HTML
- phân biệt HTML source và DOM runtime
- biết semantic HTML và accessibility cơ bản

## HTML là cấu trúc

Mở `apps/webui/index.html`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Matter Smart Home</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- `doctype` chọn chuẩn HTML hiện đại
- `head` chứa metadata, không phải nội dung chính
- `viewport` giúp layout đúng trên mobile
- `#app` là điểm Vue mount ứng dụng
- `type="module"` cho phép dùng `import` và `export`

## DOM là cây object

Trình duyệt parse HTML thành Document Object Model. Vue tiếp tục tạo và cập nhật node bên trong `#app`. Khi state thay đổi, Vue cập nhật DOM cần thiết thay vì tải lại trang.

HTML bạn thấy trong tab Elements có thể khác file `index.html`, vì đó là DOM sau khi JavaScript chạy.

## Semantic HTML

Dự án sử dụng các thẻ như `main`, `header`, `section`, `article`, `button`, `label`. Chúng mô tả ý nghĩa tốt hơn việc dùng `div` cho mọi thứ.

Semantic HTML giúp

- screen reader hiểu cấu trúc
- bàn phím điều hướng tốt hơn
- code dễ đọc
- công cụ tìm kiếm hiểu nội dung

## Form và event

`LevelSlider.vue` sử dụng `input type="range"`. `CooktopPanel.vue` bọc input bằng `label`. `button` có trạng thái `disabled` khi thao tác không hợp lệ.

Không nên dùng một `div` có `@click` thay button nếu không tự bổ sung keyboard và ARIA behavior.

## Accessibility cần quan tâm

- độ tương phản màu
- focus hiển thị rõ khi dùng bàn phím
- label cho input
- không chỉ dùng màu để truyền đạt trạng thái
- text thay thế cho icon
- kích thước vùng bấm đủ lớn

CSS `:focus-visible` trong `apps/webui/src/style.css` cho thấy focus bằng viền cyan.

## Bài thực hành

1. Đổi `lang="en"` thành `lang="vi"`.
2. Dùng phím Tab để đi qua các control.
3. Thêm một đoạn mô tả ngắn bằng thẻ `p` vào header của `App.vue`.

## Tự kiểm tra

1. DOM khác HTML source thế nào?
2. Vì sao Vue cần `#app`?
3. `button` tốt hơn clickable `div` ở điểm nào?
4. `meta viewport` giải quyết vấn đề gì?
