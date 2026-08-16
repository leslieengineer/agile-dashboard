# Chương 3 — RCP, Spinel và OTBR

## Mục tiêu

- hiểu host/radio split
- đọc radio URL
- giữ single-owner serial boundary

## RCP architecture

ESP32-C6 RCP xử lý IEEE 802.15.4 radio. OpenThread stack chính chạy trong `otbr-agent` trên BBB.

```text
otbr-agent → Spinel/HDLC USB → ESP32-C6 RCP → 802.15.4
```

## Radio URL

```text
spinel+hdlc+uart:///dev/serial/by-id/usb-Espressif_...?uart-baudrate=460800
```

- Spinel là host/RCP protocol
- HDLC đóng frame trên byte stream
- by-id ổn định qua re-enumeration
- 460800 khớp firmware USB RCP

## Ownership

Chỉ `otbr-agent` mở device. Gateway có `PrivateDevices=yes` và guard từ chối biến serial `/dev/tty`.

Không chạy Pyspinel cùng lúc OTBR. Không gửi ASCII vào RCP. Không dùng RCP như UART JSON bridge.

## OTBR responsibilities

- chạy OpenThread host
- tạo wpan0
- border routing Thread ↔ Ethernet
- mDNS/MeshCoP advertisement
- NAT64/DNS proxy theo build configuration
- quản lý active dataset

OTBR không thực thi OnOff command. Matter Controller làm phần application.

## Bài thực hành

1. Giải thích từng phần radio URL.
2. Dùng `systemctl status otbr-agent` và journal để tìm RCP version.
3. Giải thích tại sao `PrivateDevices` là kiến trúc, không chỉ permission.

## Tự kiểm tra

1. OpenThread stack chính ở RCP hay BBB?
2. Spinel là Matter protocol không?
3. Ai tạo wpan0?
4. Vì sao không dùng ttyACM0 cố định?
