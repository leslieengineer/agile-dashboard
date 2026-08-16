# Phụ lục — Lệnh Linux thường dùng

## Quan sát hệ thống

```bash
uname -a                     # QS
cat /etc/os-release          # QS
id                           # QS
free -h                      # QS
df -h                        # QS
ps -ef                       # QS
```

## Filesystem

```bash
pwd                          # QS
ls -la                       # QS
stat PATH                    # QS
namei -l PATH                # QS
readlink -f PATH             # QS
du -sh PATH                  # QS
```

## Process và service

```bash
systemctl status SERVICE     # QS
systemctl cat SERVICE        # QS
systemctl --failed           # QS
journalctl -u SERVICE -b --no-pager  # QS
sudo systemctl restart SERVICE       # TĐ
sudo systemctl enable SERVICE        # TĐ
sudo systemctl disable --now SERVICE # TĐ
```

## Network

```bash
ip -br addr                  # QS
ip route                     # QS
ip -6 route                  # QS
ss -ltnp                     # QS
getent hosts HOST            # QS
curl -I URL                  # QS
```

## USB và Thread

```bash
lsusb                        # QS
udevadm info -q property -n /dev/ttyACM0  # QS
ls -l /dev/serial/by-id/     # QS
sudo fuser -v /dev/ttyACM0   # QS
systemctl status otbr-agent matter-controller  # QS
sudo ot-ctl state            # QS
sudo -u matter-gateway /opt/node20/bin/node /home/leslie/agile-dashboard/matter-rpc-health.mjs  # QS
# Không in full active dataset vào log/chat vì chứa credential
```

## Package và build

```bash
apt-cache policy PACKAGE     # QS
dpkg -l                      # QS
git rev-parse HEAD           # QS
sudo apt update              # TĐ
sudo apt install PACKAGE     # TĐ
ninja -j1                    # TĐ, tạo/cập nhật build artifact
```

## Quyền

```bash
ls -l PATH                   # QS
groups                       # QS
sudo chown OWNER:GROUP PATH  # TĐ
sudo chmod 640 PATH          # TĐ
sudo usermod -aG GROUP USER  # TĐ
```

## Trước lệnh TĐ

- xác định file, process hoặc network bị ảnh hưởng
- sao lưu config
- biết cách rollback
- giữ SSH session dự phòng khi sửa network/sshd
- không đặt password trong command
- đọc output và exit code trước bước tiếp theo
