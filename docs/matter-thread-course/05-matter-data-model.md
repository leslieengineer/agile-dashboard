# Chương 5 — Matter data model

## Mục tiêu

- hiểu fabric, node, endpoint và cluster
- phân biệt command, attribute và event
- đọc ID hiện tại trong project

## Hierarchy

```text
Fabric
  └─ Node
      ├─ Endpoint 0 root
      └─ Application endpoint
          └─ Cluster
              ├─ Attributes
              ├─ Commands
              └─ Events
```

Node ID là identity vận hành trong fabric, không phải MAC/IP. Endpoint 0 chứa root management clusters. Endpoint application biểu diễn chức năng thiết bị.

## Project clusters

`packages/contracts/src/ids.ts` định nghĩa

- OnOff `0x0006`
- LevelControl `0x0008`
- WindowCovering `0x0102`
- VendorCooktop `0xfc01`

Numeric ID là canonical. Alias như `OnOff` chỉ giúp Web dễ đọc.

## Command và attribute

Command yêu cầu hành động, ví dụ On. Attribute mô tả state, ví dụ OnOff=true. Một command thành công phải dẫn tới state/report phù hợp, nhưng response command và attribute report là hai message khác nhau.

## Vendor cluster

Cooktop hiện là prototype contract-only. Matter.js adapter chưa implement và test vendor ID không dùng production. Standard cluster luôn được ưu tiên khi semantic phù hợp.

## Bài thực hành

1. Lập endpoint table cho smart switch.
2. Phân loại `Toggle`, `CurrentLevel`, `PanelLocked`.
3. Giải thích endpoint 0 không dùng làm relay endpoint.

## Tự kiểm tra

1. Node ID khác IPv6 address thế nào?
2. Attribute khác event thế nào?
3. Vì sao numeric ID canonical?
4. Khi nào dùng vendor cluster?
