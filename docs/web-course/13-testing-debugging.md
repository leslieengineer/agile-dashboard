# Chương 13 — Kiểm thử và gỡ lỗi

## Mục tiêu

- phân biệt unit test và integration test
- đọc test Vitest hiện có
- gỡ lỗi theo quan sát và giả thuyết thay vì đoán

## Kim tự tháp kiểm thử

### Unit test

Kiểm tra một hàm, store hoặc module cô lập. Unit test nhanh và chỉ ra lỗi gần nguồn.

Ví dụ

- `packages/contracts/test/contracts.test.ts`
- `packages/gateway/test/unit/gateway.test.ts`
- `apps/webui/test/devices.test.ts`

### Integration test

Kiểm tra nhiều phần phối hợp. `mqtt.e2e.test.ts` chạy broker Aedes thật trong process, kết nối hai MQTT client, publish TX và chờ RX.

Integration test bắt lỗi wiring mà unit test không thấy.

### End-to-end

E2E qua browser thật sẽ kiểm tra UI, network và backend như người dùng. Dự án chưa có Playwright hoặc Cypress. Đây là hướng mở rộng.

## Cấu trúc test Vitest

```ts
describe('device store', () => {
  it('applies realtime attributes', () => {
    expect(actual).toEqual(expected)
  })
})
```

Test tốt có Arrange, Act, Assert và tên mô tả behavior.

## Test async

Luôn `await` Promise cần kiểm tra. Nếu quên await, test có thể kết thúc trước khi assertion chạy. Với timeout, dùng fake timer khi phù hợp hoặc đặt giới hạn ngắn nhưng ổn định.

## Gỡ lỗi theo tầng

Khi nút không hoạt động, kiểm tra theo thứ tự

1. click handler có chạy không
2. WebUI có publish frame không
3. broker có chuyển message không
4. gateway có log request không
5. dispatcher trả error code nào
6. controller có emit event không
7. WebUI có nhận RX không
8. Pinia có cập nhật không
9. DOM có render state mới không

Không nên sửa backend nếu Network cho thấy frontend chưa gửi message.

## Công cụ

- `npm run typecheck` cho lỗi kiểu
- `npm test` cho regression
- browser Console cho runtime error
- Network/WS cho frame realtime
- Pino JSON log cho backend
- `node deploy/demo/verify.mjs <host>` cho MQTT flow
- `journalctl -u matter-gateway` cho service production

## Debug có chủ đích

Tạo một giả thuyết có thể bác bỏ. Ví dụ “Gateway không nhận command vì sai topic”. Probe bằng cách xem topic trong WS frame và gateway log. Nếu topic đúng, bác bỏ giả thuyết rồi chuyển tầng tiếp theo.

## Bài thực hành

1. Làm sai topic TX và xác định tầng hỏng.
2. Gửi payload level 300 và theo dõi error từ gateway tới UI.
3. Thêm test cho vendor ID không hỗ trợ.
4. Thêm test hai request đồng thời có request ID khác nhau.

## Tự kiểm tra

1. Unit test khác integration test thế nào?
2. Vì sao test async cần await?
3. Nên bắt đầu debug từ UI hay database?
4. Một giả thuyết tốt cần đặc điểm gì?
