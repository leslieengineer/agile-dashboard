# Chương 0 — Cách học và safety boundary

## Mục tiêu

- biết tầng nào đã chạy thật
- dùng lệnh quan sát mà không lộ credential
- phân biệt RCP với application node

## Hai ESP32-C6 khác vai trò

RCP chạy `ot_rcp`, cung cấp radio cho BBB và không có endpoint Smart Home. Application node chạy ESP-Matter, có endpoint/cluster và được commission vào fabric.

Một board không được giả định vừa là RCP vừa là application node trong kiến trúc này.

## Checkpoint chỉ đọc

```bash
systemctl is-active otbr-agent matter-controller  # QS
sudo /usr/sbin/ot-ctl state                       # QS
ip -6 addr show wpan0                             # QS
```

Kết quả mong đợi là hai service active, state leader và wpan0 có IPv6.

Health Matter Controller chạy bằng identity gateway.

```bash
sudo -u matter-gateway /opt/node20/bin/node \
  /home/leslie/agile-dashboard/matter-rpc-health.mjs  # QS
```

`commissioned_nodes: []` không phải lỗi. Nó nói controller chưa pair node nào.

## Không dùng full dataset làm bài tập

`dataset active -x` chứa credential. Không dán output vào chat, issue hoặc repository. Chỉ đọc các field công khai riêng như state, network name, channel và PAN ID.

## Phân biệt observed và planned

Observed là output đã kiểm chứng trên BBB. Planned là BLE commissioning và application node. Mọi bước planned trong khóa có nhãn `HW`.

## Bài thực hành

1. Vẽ ba process `otbr-agent`, `matter-controller`, `matter-gateway`.
2. Ghi owner của USB, fabric storage và MQTT topic.
3. Giải thích vì sao node list rỗng vẫn là health pass.

## Tự kiểm tra

1. RCP có endpoint OnOff không?
2. Ai giữ fabric credential?
3. Leader có nghĩa là Matter Controller không?
4. Vì sao không chạy lại dataset init?
