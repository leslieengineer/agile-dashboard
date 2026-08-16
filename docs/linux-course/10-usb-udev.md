# Chương 10 — USB serial, udev và dialout

## Mục tiêu

- theo luồng USB từ enumeration tới device node
- phân biệt ttyACM và ttyUSB
- dùng persistent path và kiểm tra owner process

## Enumeration

Khi cắm ESP32-C6, USB host controller báo device cho kernel. Driver chọn theo USB class/interface.

```bash
lsusb                         # QS
udevadm info -q property -n /dev/ttyACM0  # QS
```

ESP32-C6 hiện là `303a:1001`, driver `cdc_acm`, tạo `/dev/ttyACM0`.

## ttyACM và ttyUSB

- `/dev/ttyACM*` thường là USB CDC ACM do firmware/device cung cấp
- `/dev/ttyUSB*` thường là USB-to-UART bridge như CP210x/FTDI

Tên số phụ thuộc thứ tự enumerate, không ổn định sau reboot hoặc cắm thêm thiết bị.

## Persistent symlink

Udev tạo path ổn định.

```text
/dev/serial/by-id/usb-Espressif_USB_JTAG_serial_debug_unit_98:A3:16:AA:96:9C-if00
```

```bash
readlink -f /dev/serial/by-id/usb-Espressif_*  # QS
```

Cấu hình OTBR nên dùng by-id thay vì `/dev/ttyACM0`.

## Permission

```bash
ls -l /dev/ttyACM0            # QS
groups                        # QS
```

Device thường owner root, group dialout, mode `660`. User phải thuộc dialout và đăng nhập lại sau khi được thêm group.

```bash
sudo usermod -aG dialout USER # TĐ
```

Hoàn tác.

```bash
sudo gpasswd -d USER dialout  # TĐ
```

Gateway application production không cần dialout. Chỉ OTBR cần sở hữu RCP.

## Exclusive owner

Hai process cùng mở serial có thể phá frame Spinel.

```bash
sudo fuser -v /dev/ttyACM0    # QS
lsof /dev/ttyACM0             # QS
```

Kết quả production mong đợi chỉ có `otbr-agent`.

## Baud và framing

RCP USB trả lời Spinel ở 460800 theo config. Với USB CDC, baud là line coding nhưng vẫn phải cấu hình nhất quán cho tool/URL.

```bash
stty -F /dev/ttyACM0 -a       # QS
```

Không gửi ASCII ngẫu nhiên vào RCP. Spinel là frame nhị phân HDLC.

## Bài thực hành

1. Theo device từ `lsusb` tới `/sys` rồi `/dev`.
2. Rút/cắm lại và kiểm tra by-id vẫn giữ ý nghĩa.
3. Dùng fuser xác nhận owner trước khi chạy probe.

## Tự kiểm tra

1. Ai tạo `/dev/ttyACM0`?
2. Vì sao by-id tốt hơn ttyACM0?
3. Group dialout cấp quyền gì?
4. Vì sao hai process không nên cùng mở RCP?
