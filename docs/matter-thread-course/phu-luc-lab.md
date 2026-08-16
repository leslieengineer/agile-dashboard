# Phụ lục — Bài lab

## Lab 1 — Bản đồ tầng `QS`

Theo một click On từ component tới MQTT, gateway, controller mode, OTBR và node. Đánh dấu chính xác boundary hiện vẫn mock.

## Lab 2 — Controller health `QS`

```bash
sudo -u matter-gateway /opt/node20/bin/node \
  /home/leslie/agile-dashboard/matter-rpc-health.mjs
```

Giải thích ready, version và commissioned_nodes.

## Lab 3 — Thread inventory `QS`

Đọc state, networkname, channel, panid và IPv6 wpan0. Không đọc/dán full dataset.

## Lab 4 — Readiness race `TĐ có kiểm soát`

Restart matter-controller rồi chạy health ngay. Quan sát probe retry khi socket chưa tồn tại. Không xóa storage.

## Lab 5 — Adapter coverage `QS`

Đọc `MatterRuntime.invoke()` và lập bảng cluster/command/payload. So sánh với `packages/contracts/src/ids.ts` để tìm gap.

## Lab 6 — Error path trên máy dev `TĐ`

Chạy gateway matterjs mode với node ID không commission, quan sát error, sau đó rollback mock. Không áp dụng BBB production.

## Lab 7 — Commissioning readiness `HW`

Viết runbook gồm powered USB hub, Linux BlueZ BLE adapter, ESP32-C6 application node, QR/setup code, Thread credential provisioning, PASE/CASE, endpoint discovery và pass/fail từng bước.

## Capstone

Nhóm firmware giao một OnOff node. Hoàn thành commissioning, invoke thật, local button report, reboot recovery và chuyển gateway sang matterjs. Evidence phải có firmware commit, endpoint descriptor, controller logs, MQTT correlation và rollback plan.

## Safety

Không init dataset mới, không factory-reset controller, không xóa fabric storage, không in secrets và không mở RCP ngoài otbr-agent.
