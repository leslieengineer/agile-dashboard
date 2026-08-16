# Chương 2 — Thread topology, role và IPv6

## Mục tiêu

- hiểu partition và role
- đọc wpan0/IPv6
- hiểu leader không phải central server

## Roles

- leader quản lý router ID và network data trong một partition
- router chuyển packet và có thể nhận child
- REED có thể nâng thành router
- child/end device phụ thuộc parent

Leader được bầu, không phải điểm trung tâm chuyển mọi packet. Mesh vẫn phân tán.

## Trạng thái thật

```bash
sudo /usr/sbin/ot-ctl state       # QS
sudo /usr/sbin/ot-ctl networkname # QS
sudo /usr/sbin/ot-ctl channel     # QS
sudo /usr/sbin/ot-ctl panid       # QS
```

Hệ thống hiện trả leader, `OpenThread-0a76`, channel 14 và PAN `0x0a76`.

## wpan0

`wpan0` là interface IP do OpenThread host tạo, không phải raw USB serial.

```bash
ip link show wpan0                # QS
ip -6 addr show wpan0             # QS
ip -6 route                       # QS
```

Mesh-local, link-local và OMR address có scope khác nhau. Border Routing quảng bá OMR prefix ra backbone.

## Restart behavior

Sau restart otbr-agent, state có thể tạm `detached` trong lúc tìm partition. Khi chỉ có một router, nó có thể tạo lại partition từ active dataset và trở lại leader. Health probe không nên kết luận lỗi ngay khi service vừa spawn.

## Bài thực hành

1. Theo dõi state trước/sau restart trong lab, không tạo dataset mới.
2. Phân loại các IPv6 address theo scope.
3. Tìm route liên quan wpan0.

## Tự kiểm tra

1. Leader có chuyển mọi packet không?
2. Detached ngay sau restart có luôn là lỗi không?
3. wpan0 khác ttyACM0 thế nào?
4. OMR prefix phục vụ gì?
