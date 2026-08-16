# Chương 2 — Shell, SSH, PATH và environment

## Mục tiêu

- hiểu shell parse command thế nào
- hiểu PATH và environment thuộc từng process
- phân biệt interactive shell với systemd service

## Shell không phải kernel

Bash đọc text, mở rộng variable và wildcard, xử lý pipe/redirection, rồi yêu cầu kernel tạo process bằng fork/exec.

```bash
command -v node              # QS
type -a node                 # QS
printf '%s\n' "$PATH"        # QS
```

## PATH

Khi gõ `node`, shell tìm từng thư mục trong PATH. Node 20 của BBB ở `/home/leslie/.local/node20/bin/node`. Nếu thư mục này không có trong PATH, shell có thể tìm `/usr/bin/node` v12 hoặc báo command not found.

Dùng absolute path bỏ qua PATH.

```bash
/home/leslie/.local/node20/bin/node --version  # QS
```

## Environment variable

Environment là cặp key/value được process cha truyền cho process con.

```bash
export MQTT_URL=mqtt://127.0.0.1:1883  # TĐ, chỉ ảnh hưởng shell và process con
printenv MQTT_URL                       # QS
```

Hoàn tác trong shell hiện tại.

```bash
unset MQTT_URL                          # TĐ
```

Gateway đọc environment tại `packages/gateway/src/config.ts`. `.env.example` chỉ là mẫu, Node không tự đọc file này.

## Quote và expansion

- single quote giữ nguyên gần như mọi ký tự
- double quote vẫn mở rộng `$VARIABLE`
- không quote có thể bị tách word hoặc mở rộng wildcard

Luôn quote path có khoảng trắng và variable có thể rỗng.

## Pipe và redirect

```bash
journalctl -u otbr-agent | grep error   # QS
command >output.log 2>&1                # TĐ, tạo/ghi đè file
```

Pipe nối stdout process trái vào stdin process phải. Redirect thay đích file descriptor.

## SSH session và systemd

SSH interactive có thể đọc `.profile` hoặc `.bashrc`. Systemd không đọc chúng. Vì vậy `node` chạy trong terminal không chứng minh `ExecStart=/usr/bin/node` dùng đúng Node.

Unit hiện tại trỏ `/usr/bin/node`, trong khi Node 20 nằm trong home. `ProtectHome=yes` còn làm `/home` vô hình với service. Cách production tốt là cài runtime vào `/opt/node20` hoặc `/usr/local`, không giảm hardening chỉ để đọc home.

## Bài thực hành

1. Dùng `type -a node` tìm mọi Node.
2. Chạy Node bằng absolute path.
3. Tạo biến `COURSE=test`, mở SSH session khác và quan sát biến không tự xuất hiện.

## Tự kiểm tra

1. Ai mở rộng `$PATH`?
2. Environment có phải global toàn máy không?
3. Vì sao systemd không thấy cấu hình `.bashrc`?
4. Absolute path giải quyết vấn đề nào?
