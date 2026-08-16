# Chương 10 — Mock-to-real cutover và debugging

## Mục tiêu

- biết khi nào chuyển controller mode
- hiểu độ phủ command hiện tại
- debug theo từng boundary

## Hai modes

```text
CONTROLLER_MODE=mock
CONTROLLER_MODE=matterjs
```

Production vẫn mock vì chưa có node. Chuyển sớm làm UI command trả node-not-commissioned mà không kiểm thử actuator.

## Độ phủ adapter

| Cluster | Commands |
|---|---|
| OnOff | Off, On, Toggle |
| LevelControl | MoveToLevel, Stop, MoveToLevelWithOnOff |
| WindowCovering | Open, Close, Stop, GoToLift%, GoToTilt% |
| VendorCooktop | chưa implement |

Move/Step của LevelControl chưa implement trong Matter.js adapter dù contract đã có.

## Cutover gate `HW`

1. application node commission thành công
2. listNodes có operational Node ID
3. endpoint discovery khớp contract
4. invoke/read test đạt
5. local change tạo subscription report
6. RPC event forwarding hoàn thành
7. gateway integration tests đạt
8. rollback về mock đã kiểm tra

## Debug order

```text
WebUI login
→ Mosquitto ACL
→ Gateway validation
→ Unix RPC health
→ Matter.js node/session
→ OTBR/Thread
→ ESP-Matter endpoint/hardware
```

Không sửa RCP nếu Gateway chưa gửi RPC. Không sửa WebUI nếu Matter node trả status rõ.

## Known symptoms

- `ENOENT controller.sock` ngay restart: readiness race, health retry
- `commissioned_nodes: []`: chưa commission node
- `Node ... not commissioned`: Node ID không có trong fabric
- `Unsupported ... command`: adapter mapping chưa có
- `TIMEOUT`: phân biệt RPC timeout, CASE/session timeout và node offline qua logs

## Bài thực hành

Trên dev environment, đặt matterjs mode và gửi command node giả. Quan sát typed error rồi rollback mock. Không đổi BBB production.

## Tự kiểm tra

1. Vì sao controller health chưa đủ cutover?
2. Cluster nào chưa có real adapter?
3. Attribute event gap ảnh hưởng UI thế nào?
4. Rollback mode dùng khi nào?
