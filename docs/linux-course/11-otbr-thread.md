# Chương 11 — ESP32-C6 RCP, Spinel và OTBR

## Mục tiêu

- hiểu ranh giới radio/host
- biết otbr-agent tạo Thread interface thế nào
- kiểm tra dataset, state và IPv6 routing

## Kiến trúc RCP

ESP32-C6 chạy `ot_rcp` và xử lý radio IEEE 802.15.4. BBB chạy OpenThread host stack trong `otbr-agent`.

```text
Linux apps → IPv6 → wpan0 → otbr-agent → Spinel/HDLC USB → ESP32-C6 radio
```

RCP không phải application JSON bridge. Node gateway không gửi command Matter trực tiếp xuống USB.

## Spinel và radio URL

OTBR mở serial bằng radio URL.

```text
spinel+hdlc+uart:///dev/serial/by-id/usb-Espressif_USB_JTAG_serial_debug_unit_98:A3:16:AA:96:9C-if00?uart-baudrate=460800
```

- `spinel` là host/RCP protocol
- `hdlc` framing byte stream
- `uart` transport abstraction
- path chọn device
- query đặt baud

Pyspinel đã trả version, chứng minh firmware USB RCP và transport hoạt động.

## otbr-agent

Agent mở RCP, chạy OpenThread stack và tạo `wpan0`. Nó còn phối hợp routing giữa Thread và `eth0`.

```bash
systemctl status otbr-agent   # QS
journalctl -u otbr-agent -b --no-pager  # QS
sudo ot-ctl version           # QS
sudo ot-ctl state             # QS
```

## Dataset và state

Operational Dataset chứa network key, PAN ID, channel, mesh-local prefix và tên mạng. `dataset init new` tạo dataset mới; `dataset commit active` áp dụng nó.

```bash
sudo ot-ctl dataset active -x # QS
```

Các lệnh tạo/commit/start thay đổi Thread network và chỉ chạy khi bạn chủ ý tạo mạng.

```bash
sudo ot-ctl dataset init new  # TĐ
sudo ot-ctl dataset commit active  # TĐ
sudo ot-ctl ifconfig up       # TĐ
sudo ot-ctl thread start      # TĐ
```

Hoàn tác việc tham gia mạng bằng `thread stop` và `ifconfig down`, nhưng dataset vẫn được lưu cho tới khi xóa.

## wpan0 và IPv6

```bash
ip -br link show wpan0        # QS
ip -6 addr show wpan0         # QS
ip -6 route                   # QS
sysctl net.ipv6.conf.all.forwarding  # QS
```

OTBR cần IPv6 forwarding để route giữa backbone và Thread. Setup script thay sysctl và firewall, đó là thay đổi hệ thống.

## State

- `disabled` interface chưa up
- `detached` chưa gắn network
- `child`, `router`, `leader` là các role hợp lệ

Mạng mới chỉ có một router thường trở thành leader. Leader không có nghĩa là server ứng dụng; đó là role quản lý partition Thread.

## Trạng thái quan sát được

BBB hiện chạy mạng `OpenThread-0a76`, channel 14, PAN `0x0a76`, role leader. Active dataset sống qua `systemctl restart otbr-agent` và full reboot.

Không chạy lại `dataset init new` hoặc `commit active`. Việc đó thay credential network và sẽ làm các future node cũ bị orphan/recommission.

## Bài thực hành

1. Giải thích radio URL từng phần.
2. Xác nhận chỉ otbr-agent mở RCP.
3. Đọc active dataset ở dạng hex.
4. Tìm địa chỉ IPv6 của wpan0.

## Tự kiểm tra

1. OpenThread stack chính chạy ở đâu trong RCP architecture?
2. wpan0 do ai tạo?
3. Dataset chứa loại thông tin gì?
4. Thread leader khác application gateway thế nào?
