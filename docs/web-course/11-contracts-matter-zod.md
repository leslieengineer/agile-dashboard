# Chương 11 — Data model Matter, contract và Zod

## Mục tiêu

- hiểu node, endpoint, cluster, command và attribute
- biết vì sao frontend và backend cần contract chung
- dùng Zod để validate dữ liệu runtime

## Matter model vừa đủ cho Web developer

- **Node** là một thiết bị logic trên fabric Matter
- **Endpoint** là một chức năng trong node
- **Cluster** gom attribute và command của một chức năng chuẩn
- **Command** yêu cầu thiết bị thực hiện hành động
- **Attribute** mô tả trạng thái

Ví dụ node `0x1`, endpoint 1 có cluster OnOff. Command `On` thay đổi attribute `OnOff` thành true.

## Envelope của dự án

```json
{
  "request_id": "11111111-1111-4111-8111-111111111111",
  "node_id": "0x0000000000000001",
  "endpoint": 1,
  "cluster": "OnOff",
  "command": "On",
  "payload": {}
}
```

Tên symbolic dễ đọc ở biên hệ thống. Gateway resolve thành ID số chuẩn trước khi dispatch.

## Tại sao node ID là chuỗi

Matter Node ID rộng 64 bit. JavaScript `number` chỉ biểu diễn chính xác integer tới `2^53 - 1`. Dự án truyền node ID bằng chuỗi hex và dùng `BigInt` khi normalize.

Xem `normalizeNodeId` trong `packages/contracts/src/envelope.ts`.

## Contract dùng chung

Nếu frontend nghĩ `level` từ 0–100 nhưng backend nghĩ 0–254, bug xảy ra dù TypeScript hai bên đều xanh. Shared contract cung cấp cùng schema, type, topic và ID cho cả hai.

## Zod

TypeScript type biến mất sau compile. Zod tạo validator chạy thật.

```ts
const MoveToLevelPayloadSchema = z.object({
  level: z.number().int().min(0).max(254),
}).strict()
```

- `parse` trả dữ liệu hoặc throw
- `safeParse` trả union success/error
- `.strict()` từ chối field lạ
- `z.infer` tạo TypeScript type từ schema

## Discriminated union

Response có `status: 'ok'` hoặc `status: 'error'`. Sau khi kiểm tra status, TypeScript biết branch thành công có `result`, branch lỗi có `error`.

## Vendor cluster

Cooktop dùng cluster vendor-specific `0xfc01` và bắt buộc `vendor_id`. Không nên tự gán một tính năng riêng vào cluster chuẩn có ý nghĩa khác.

## Ranh giới mock

Contract hiện có real consumer là MatterJsController/Matter.js service. Tuy nhiên production vẫn chọn mock vì chưa có node commission. Real adapter đã map OnOff, LevelControl cơ bản và WindowCovering; VendorCooktop vẫn contract-only. CASE/invoke thật sẽ được kiểm thử khi có BLE adapter và application node.

Xem [khóa Matter/Thread](../matter-thread-course/10-cutover-debugging.md).

## Bài thực hành

1. Gửi level 255 và đọc lỗi `INVALID_PAYLOAD`.
2. Thêm field lạ vào envelope và quan sát `.strict()`.
3. Thêm command alias mới rồi viết test resolve ID.
4. Giải thích vì sao không truyền Node ID lớn bằng JSON number.

## Tự kiểm tra

1. Endpoint khác node thế nào?
2. Command khác attribute thế nào?
3. TypeScript không thay Zod được vì sao?
4. Khi nào cần vendor-specific cluster?
