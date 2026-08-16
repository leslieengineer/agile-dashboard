# Chương 15 — Đồ án cuối khóa và hướng phát triển

## Mục tiêu

- thêm một tính năng full-stack mà không phá kiến trúc
- áp dụng contract-first, test và quan sát runtime
- tự đánh giá khả năng Web sau khóa học

## Đồ án Thermostat

Bạn sẽ thêm cluster Thermostat `0x0201` cho endpoint 4. UI hiển thị nhiệt độ phòng và setpoint, cho phép tăng giảm setpoint rồi nhận attribute cập nhật từ mock controller.

Không làm toàn bộ trong một lần. Hoàn thành từng milestone và commit riêng nếu repository dùng Git.

## Milestone 1 — Contract

1. Thêm `Thermostat` vào `CLUSTERS` trong `packages/contracts/src/ids.ts`.
2. Thêm command `SetOccupiedHeatingSetpoint`.
3. Tạo `packages/contracts/src/clusters/thermostat.ts`.
4. Schema payload có `setpointCentiDegrees` là integer trong giới hạn hợp lý.
5. Export schema từ cluster index.
6. Thêm test payload đúng và sai.

Checkpoint

```bat
npm run build -w @agile/contracts
npm test
```

## Milestone 2 — Gateway module

1. Tạo `packages/gateway/src/clusters/thermostat.ts` theo mẫu `windowCovering.ts`.
2. Đăng ký module trong `clusters/index.ts`.
3. Không sửa dispatcher hoặc CommandRegistry.

Nếu phải thêm một nhánh vào dispatcher cho Thermostat, thiết kế của bạn chưa tận dụng registry.

## Milestone 3 — Mock controller

1. Thêm `localTemperature` và `heatingSetpoint` vào `MockState`.
2. Xử lý command Thermostat trong `applyCommand`.
3. Trả attributes theo cùng convention các cluster khác.
4. Emit event để WebUI nhận state mới.
5. Thêm unit test.

Nhắc lại rằng đây là mô phỏng, chưa phải Matter Controller thật.

## Milestone 4 — Vue widget

Tạo `ThermostatCard.vue` có

- props `nodeId` và `endpoint`
- computed đọc attribute từ device store
- nút tăng giảm
- trạng thái busy
- error hiển thị được
- keyboard focus rõ

Gắn component vào `App.vue` tại endpoint 4.

## Milestone 5 — Test end-to-end

Thêm test bảo đảm

- schema từ chối setpoint ngoài range
- registry tìm đúng command
- dispatcher trả `INVALID_PAYLOAD` khi sai
- mock controller cập nhật attribute
- device store merge attribute mới
- MQTT response giữ đúng request ID

Chạy toàn bộ quality gate.

```bat
npm run typecheck
npm test
npm run build
```

## Tiêu chí tự chấm

| Tiêu chí | Đạt |
|---|---|
| Typecheck, test và build xanh | [ ] |
| Contract là nguồn schema duy nhất | [ ] |
| Không sửa dispatcher để thêm cluster | [ ] |
| UI cập nhật từ response/event | [ ] |
| Có loading và error state | [ ] |
| Có test invalid payload | [ ] |
| Không log secret | [ ] |
| README được cập nhật | [ ] |

## Ba bài mở rộng

### Quản lý nhiều node

Đọc node list từ config thay vì hard-code Map trong mock controller. Thêm selector node trên WebUI.

### Gateway online status

Subscribe `home/control/status`, tách `brokerConnected` khỏi `gatewayOnline`, hiển thị thời điểm heartbeat cuối.

### Matter Controller thật

Tạo implementation mới của `MatterController`. Implementation này phải dùng Matter SDK/controller service qua network interface OTBR. Nó không gửi application JSON xuống RCP.

Các chủ đề tiếp theo nên học

- Vue Router và Single Page Application
- REST, GraphQL và database
- session, OAuth2 và OpenID Connect
- Docker và CI/CD
- browser E2E test với Playwright
- observability với metrics và tracing
- accessibility theo WCAG
- threat modeling cho IoT

## Khi nào bạn có thể nói mình biết Web

Bạn không cần nhớ mọi API. Bạn đã có nền tảng khi có thể

- chia một yêu cầu thành UI, state, contract, backend và deployment
- tìm file đúng trước khi sửa
- giải thích dữ liệu đi qua đâu
- đọc lỗi và thiết kế probe
- thêm tính năng có test
- nhận ra input không đáng tin và secret không thuộc browser
- tự đọc documentation để tiếp tục
