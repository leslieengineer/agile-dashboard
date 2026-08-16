# Phụ lục — Lệnh thường dùng

## Cài đặt và kiểm tra

```bat
npm install
npm run typecheck
npm test
npm run build
```

## Chạy local trên Windows

Broker học tập.

```bat
node deploy\demo\broker.cjs
```

Gateway.

```bat
set MQTT_USERNAME=demo
set MQTT_PASSWORD=demo
npm run dev:gateway
```

WebUI.

```bat
npm run dev:webui
```

Kiểm tra MQTT end-to-end.

```bat
node deploy\demo\verify.mjs 127.0.0.1
```

## Chạy riêng workspace

```bat
npm run build -w @agile/contracts
npm run typecheck -w @agile/gateway
npm run test -w @agile/webui
```

## Kiểm tra port Windows

```bat
netstat -ano | findstr :1883
netstat -ano | findstr :9001
netstat -ano | findstr :5173
```

## HTTP và BBB

```bat
curl.exe -I http://192.168.1.192:8080/
ssh leslie@BeagleBone
scp file.txt leslie@BeagleBone:/home/leslie/
```

## Linux service

```bash
systemctl status mosquitto
systemctl status otbr-agent
journalctl -u otbr-agent -n 100 --no-pager
sudo ot-ctl state
```

## Quy tắc trước khi chạy command

- biết command đang chạy trên Windows hay BBB
- không dán password vào command line
- không commit `.env`
- đọc working directory hiện tại
- không chạy hai server trên cùng port
