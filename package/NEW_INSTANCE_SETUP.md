# 🚀 Hướng Dẫn Setup EC2 Instance Mới

## Thông tin Instance mới:
- **IP**: 47.130.211.9
- **PEM Key**: `D:\FPTU\exe\EXE1.pem`
- **User**: ubuntu
- **Domain**: kyvuongsuytam.site

## ⚠️ QUAN TRỌNG: Kiểm tra Security Group trước!

### Bước 1: Mở Security Group trên AWS Console

1. Vào **AWS Console** → **EC2** → **Instances**
2. Chọn instance có IP `47.130.211.9`
3. Click tab **"Security"** → Click vào **Security Group**
4. Click **"Edit inbound rules"**
5. **Thêm các rules sau:**

| Type | Protocol | Port Range | Source | Description |
|------|----------|------------|--------|-------------|
| SSH | TCP | 22 | 0.0.0.0/0 (hoặc IP của bạn) | SSH access |
| HTTP | TCP | 80 | 0.0.0.0/0 | HTTP access |
| HTTPS | TCP | 443 | 0.0.0.0/0 | HTTPS access |
| Custom TCP | TCP | 3000 | 0.0.0.0/0 (tùy chọn) | Next.js app |

6. Click **"Save rules"**

### Bước 2: Kiểm tra kết nối SSH

Sau khi mở Security Group, chạy:
```batch
pre-deploy-check.bat
```

Hoặc test thủ công:
```batch
connect-ec2.bat
```

## 📋 Quy trình Deploy

### Bước 1: Kiểm tra trước khi deploy
```batch
pre-deploy-check.bat
```

### Bước 2: Deploy ứng dụng
```batch
deploy-ec2.bat
```

Script sẽ:
- Upload source code (~10-20MB)
- Cài đặt Node.js, PM2, Nginx (nếu chưa có)
- Build ứng dụng trên EC2
- Khởi động ứng dụng

### Bước 3: Kiểm tra deployment
```batch
pm2-status.bat
check-server.bat
```

Truy cập: http://47.130.211.9

## 🔒 Setup SSL Certificate với Certbot

### Bước 1: Cập nhật DNS
Domain `kyvuongsuytam.site` phải trỏ về IP mới:
- **Type**: A Record
- **Name**: `@` (hoặc để trống)
- **Value**: `47.130.211.9`
- **TTL**: 300

Kiểm tra DNS:
```bash
nslookup kyvuongsuytam.site
# Kết quả phải là: 47.130.211.9
```

### Bước 2: Chạy script setup SSL

**Cách 1: Từ máy Windows (tự động)**
```batch
setup-ssl-certbot.bat
```

**Cách 2: Trên EC2 (thủ công)**
```bash
# Kết nối vào EC2
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9

# Chạy script
chmod +x /tmp/setup-ssl-certbot.sh
bash /tmp/setup-ssl-certbot.sh
```

### Bước 3: Script sẽ tự động:
1. ✅ Cài đặt Certbot
2. ✅ Dừng Nginx tạm thời
3. ✅ Lấy SSL certificate từ Let's Encrypt
4. ✅ Cấu hình Nginx với SSL
5. ✅ Khởi động lại Nginx
6. ✅ Thiết lập auto-renewal
7. ✅ Cập nhật environment variables

### Bước 4: Kiểm tra SSL
Truy cập: **https://kyvuongsuytam.site**

## 📝 Các lệnh Certbot thường dùng

### Xem thông tin certificate
```bash
sudo certbot certificates
```

### Gia hạn certificate thủ công
```bash
sudo certbot renew
```

### Test auto-renewal
```bash
sudo certbot renew --dry-run
```

### Xem trạng thái auto-renewal
```bash
sudo systemctl status certbot.timer
sudo systemctl list-timers | grep certbot
```

## 🐛 Troubleshooting

### Lỗi: "Connection timed out"
→ **Kiểm tra Security Group đã mở port 22 chưa**

### Lỗi: "Could not bind TCP port 80"
→ **Dừng Nginx trước:**
```bash
sudo systemctl stop nginx
```

### Lỗi: "DNS not pointing to server"
→ **Kiểm tra DNS:**
```bash
nslookup kyvuongsuytam.site
# Phải trả về: 47.130.211.9
```

### Lỗi: "Certificate not found"
→ **Chạy lại certbot:**
```bash
sudo certbot certonly --standalone -d kyvuongsuytam.site --email your-email@example.com --agree-tos --non-interactive
```

## ✅ Checklist hoàn tất

- [ ] Security Group đã mở port 22, 80, 443
- [ ] SSH kết nối được
- [ ] Deploy ứng dụng thành công
- [ ] Ứng dụng chạy trên http://47.130.211.9
- [ ] DNS trỏ về 47.130.211.9
- [ ] SSL certificate đã được cấp
- [ ] Website truy cập được qua https://kyvuongsuytam.site

