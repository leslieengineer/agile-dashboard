# Phụ lục — Gợi ý đáp án tự kiểm tra

Đây là gợi ý ngắn. Hãy tự trả lời trước khi đọc.

## Chương 0

1. Broker, gateway và WebUI là ba process độc lập.
2. Typecheck kiểm tra tính nhất quán kiểu; test kiểm tra behavior bằng ví dụ chạy.
3. Network cho thấy request, connection và frame truyền qua mạng.
4. Thay đổi nhỏ giúp biết nguyên nhân nào tạo ra kết quả.

## Chương 1

1. Broker là hạ tầng truyền message, không phải backend nghiệp vụ của dự án.
2. Contracts giữ frontend và backend thống nhất hình dạng dữ liệu.
3. Shared UI state nằm trong Pinia stores.
4. Mock chỉ đổi object trong RAM; thiết bị thật cần Matter Controller và Thread.

## Chương 2

1. IP chọn máy, port chọn dịch vụ trên máy.
2. Browser sandbox không cho socket TCP tùy ý nên dùng MQTT qua WebSocket.
3. WebSocket là transport hai chiều, MQTT là protocol messaging với topic/QoS.
4. Nó serialize object thành text JSON truyền qua mạng.

## Chương 3

1. Source là file ban đầu; DOM là cây runtime sau khi parse và JavaScript cập nhật.
2. Đây là node để Vue mount cây component.
3. Button có sẵn keyboard, focus và semantics.
4. Nó làm layout mobile dùng đúng viewport thiết bị.

## Chương 4

1. Padding ở trong border, margin ở ngoài border.
2. Flex cho bố cục một chiều, grid cho hàng và cột.
3. Utility chỉ áp dụng từ breakpoint medium.
4. State phải là dữ liệu, màu chỉ là cách trình bày.

## Chương 5

1. Không, type biến mất runtime; input mạng cần validator như Zod.
2. Unknown buộc kiểm tra trước khi dùng, any bỏ kiểm tra.
3. Promise biểu diễn kết quả bất đồng bộ.
4. Nó nối response về đúng request khi có nhiều request đồng thời.

## Chương 6

1. Browser có DOM và sandbox; Node có process, filesystem và server network API.
2. Hai phía dùng cùng schema/type và tránh duplicate.
3. HMR cập nhật module khi phát triển mà không reload toàn bộ state.
4. Biến đó được bundle hoặc gửi đến browser nên người dùng xem được.

## Chương 7

1. Vue mount App vào div `#app` của index.html.
2. Ref được Vue theo dõi và kích hoạt render khi đổi.
3. Dùng cho giá trị dẫn xuất từ reactive dependencies.
4. Key giúp Vue nhận dạng item ổn định khi danh sách đổi.

## Chương 8

1. Từ component cha xuống component con.
2. Tránh leak và callback vào component đã unmount.
3. Khi cần side effect hoặc đồng bộ nguồn state có vòng đời khác.
4. Nó bảo đảm dọn trạng thái loading dù thành công hay lỗi.

## Chương 9

1. Khi chỉ một component cần và lifecycle gắn với component đó.
2. Vì attribute thuộc một chức năng cụ thể của một node/endpoint.
3. Nó giữ reactivity khi destructure property store.
4. Backend có thể từ chối nên UI phải rollback.

## Chương 10

1. Topic là kênh logic MQTT; URL xác định địa chỉ kết nối broker.
2. Subscriber mới có thể nhận lại command cũ và kích hoạt hành động nguy hiểm.
3. Message có thể được giao trùng.
4. Nhiều request đồng thời và response về không theo thứ tự.

## Chương 11

1. Node là thiết bị logic; endpoint là chức năng bên trong node.
2. Command yêu cầu hành động; attribute mô tả trạng thái.
3. TypeScript không tồn tại lúc runtime và không kiểm soát sender ngoài hệ thống.
4. Khi tính năng không có semantic cluster chuẩn phù hợp.

## Chương 12

1. Nó gom nơi tạo và nối dependency, giúp wiring rõ và dễ thay fake.
2. Mỗi tầng kiểm tra một loại lỗi và tạo error chính xác.
3. Khi handler tăng theo cluster/command và cần module mở rộng độc lập.
4. Stack có chi tiết nội bộ và có thể rò thông tin.

## Chương 13

1. Unit cô lập một đơn vị; integration kiểm tra nhiều phần phối hợp.
2. Nếu không await, test có thể kết thúc trước assertion.
3. Bắt đầu từ triệu chứng và theo data flow từng tầng, không mặc định tầng nào.
4. Cụ thể, kiểm chứng được và có thể bị bác bỏ.

## Chương 14

1. Mọi dữ liệu đến browser đều có thể bị xem.
2. Authentication xác minh danh tính; authorization kiểm tra quyền.
3. Không, TLS bảo vệ đường truyền còn ACL bảo vệ quyền.
4. Giảm tác hại nếu process bị khai thác.

## Chương 15

Đồ án không có một đáp án duy nhất. Thiết kế đạt khi contract là nguồn sự thật, dispatcher không phải sửa, UI phản ánh event/response và quality gate đều xanh.
