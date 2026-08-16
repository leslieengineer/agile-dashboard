# Chương 4 — Operational Dataset và bảo mật

## Mục tiêu

- hiểu dataset chứa gì
- phân biệt metadata công khai với secret
- biết persistence và hậu quả reset dataset

## Dataset

Active Operational Dataset định nghĩa một Thread network. Nó có network name, channel, PAN ID, Extended PAN ID, Mesh-Local Prefix, Network Key, PSKc, security policy và timestamp.

Channel/PAN/name hữu ích chẩn đoán. Network Key và PSKc là secret.

## Trạng thái hệ thống

- network name `OpenThread-0a76`
- channel 14
- PAN ID `0x0a76`
- active dataset đã commit và sống qua restart/reboot

Không lưu full dataset trong docs hoặc Git.

## Các lệnh nguy hiểm

```bash
sudo ot-ctl dataset init new       # TĐ, không chạy trên BBB này
sudo ot-ctl dataset commit active  # TĐ, không chạy trên BBB này
```

Tạo dataset mới sẽ tách mọi future node đang dùng credential cũ. Các node có thể phải factory reset/recommission.

## Backup

Backup dataset/fabric cần kho secret riêng, encryption và access control. Không dùng chat, issue tracker hoặc MQTT topic.

## Bài thực hành

Viết bảng phân loại mỗi field dataset thành public metadata, sensitive operational metadata hoặc secret.

## Tự kiểm tra

1. Network Key dùng để làm gì?
2. PAN ID có phải credential không?
3. Vì sao reboot không mất dataset?
4. Dataset mới ảnh hưởng node cũ thế nào?
