# Chương 8 — Matter.js Controller service

## Mục tiêu

- hiểu long-lived controller process
- biết persistent storage và readiness
- biết giới hạn version/API

## Service hiện tại

- Matter.js `0.17.9` pin chính xác
- Node.js 20.20.2
- system user `matter-controller`
- state `/var/lib/matter-controller`
- socket `/run/matter-controller/controller.sock`
- memory limit 160 MiB
- active/enabled sau reboot

`packages/matter-controller/src/MatterRuntime.ts` tạo `CommissioningController`, filesystem storage và fabric.

## Persistent state

Storage giữ CA/fabric/session/node metadata. Không xóa directory để chữa lỗi. Backup trước upgrade hoặc factory reset controller.

## Readiness race

`Type=simple` active ngay khi process spawn. Matter.js cần vài giây mở storage, mDNS và socket. Health probe retry ENOENT/ECONNREFUSED trong 10 giây.

RPC health hiện trả ready true, version 0.17.9 và node list rỗng.

## Version policy

Controller API đang chuyển sang ClientNode. Không tự nâng version. Đọc migration guide và test storage migration; upgrade sai có thể yêu cầu recommission.

## BLE

Base service không import `@matter/nodejs-ble` vì chưa có adapter. Đây là deliberate configuration, không phải lỗi runtime.

## Bài thực hành

1. Restart controller rồi chạy health probe.
2. Quan sát transient ENOENT và retry.
3. Giải thích StateDirectory khác RuntimeDirectory.

## Tự kiểm tra

1. Vì sao controller phải long-lived?
2. Socket thuộc runtime hay persistent state?
3. Tại sao không auto-upgrade Matter.js?
4. Node list rỗng cho biết gì?
