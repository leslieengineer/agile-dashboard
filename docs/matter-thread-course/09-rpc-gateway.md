# Chương 9 — Unix RPC và Gateway adapter

## Mục tiêu

- hiểu process boundary
- đọc JSON-lines RPC
- hiểu permission socket và correlation

## Vì sao tách process

Matter Controller sở hữu fabric, mDNS, sessions và subscriptions. Gateway sở hữu MQTT, validation và business mapping. Tách process giảm coupling và cô lập crash/upgrade.

## Protocol

Mỗi request là một JSON line.

```json
{"id":"uuid","method":"health","params":null}
```

Response cùng ID, có `result` hoặc `error`.

Methods hiện có

- `health`
- `listNodes`
- `invoke`

## Server

`packages/matter-controller/src/rpc.ts` tạo Unix socket, parse line, validate id/method và map lỗi thành `INVALID_REQUEST` hoặc `CONTROLLER_ERROR`.

## Client

`MatterJsController.ts` tạo UUID, connect một socket mỗi call, kiểm tra correlation, timeout/abort và fail startup nếu health không đạt.

## Permission

Socket mode 0660, group `matter-rpc`. `matter-controller` tạo socket; `matter-gateway` được SupplementaryGroups. Không chmod 666 và không chạy hai service cùng user chỉ để né permission.

## Event gap

RPC hiện hỗ trợ request/response. Attribute/event streaming từ Matter.js sang gateway còn mở; đây là điều kiện trước khi cutover hardware.

## Bài thực hành

1. Chạy health bằng user matter-gateway.
2. Giải thích ENOENT sau restart.
3. Tìm nơi correlation mismatch bị từ chối.

## Tự kiểm tra

1. Vì sao dùng Unix socket thay TCP public?
2. Ai được quyền đọc fabric storage?
3. RPC timeout map tới lỗi nào?
4. Vì sao event streaming cần kết nối lâu dài?
