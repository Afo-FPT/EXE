# 🔒 Hướng Dẫn Cấp SSL Certificate cho Domain

## Domain: `kyvuongsuytam.site`

## 📋 Yêu cầu trước khi cấp SSL

### 1. ✅ Cấu hình DNS
Domain `kyvuongsuytam.site` phải trỏ về IP EC2:
- **Type**: A Record
- **Name**: `@` (hoặc để trống)
- **Value**: `47.130.211.9`
- **TTL**: 300 (hoặc mặc định)

**Kiểm tra DNS:**
```bash
nslookup kyvuongsuytam.site
# hoặc
dig kyvuongsuytam.site
```

### 2. ✅ Security Group
Mở các port sau trong Security Group trên AWS Console:
- **Port 80** (HTTP) - Source: `0.0.0.0/0`
- **Port 443** (HTTPS) - Source: `0.0.0.0/0`

## 🚀 Cách 1: Sử dụng Script Tự Động (Khuyến nghị)

### Trên máy Windows:
```batch
setup-ssl.bat
```

Script này sẽ:
1. Upload script setup lên EC2
2. Cài đặt Certbot
3. Cấp SSL certificate từ Let's Encrypt
4. Cấu hình Nginx với SSL
5. Thiết lập auto-renewal

## 🔧 Cách 2: Chạy thủ công trên EC2

### Bước 1: Kết nối vào EC2
```bash
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9
```

### Bước 2: Cài đặt Certbot
```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### Bước 3: Cấp SSL Certificate
```bash
sudo certbot certonly --standalone \
    -d kyvuongsuytam.site \
    --email your-email@example.com \
    --agree-tos \
    --non-interactive
```

**Lưu ý:** 
- Thay `your-email@example.com` bằng email của bạn
- Đảm bảo domain đã trỏ về IP EC2 trước khi chạy lệnh này

### Bước 4: Cấu hình Nginx với SSL

Tạo file cấu hình Nginx mới:
```bash
sudo nano /etc/nginx/sites-available/kyvuongsuytam.site
```

Nội dung:
```nginx
server {
    listen 80;
    listen [::]:80;
    server_name kyvuongsuytam.site www.kyvuongsuytam.site;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name kyvuongsuytam.site www.kyvuongsuytam.site;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/kyvuongsuytam.site/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/kyvuongsuytam.site/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Kích hoạt site:
```bash
sudo ln -s /etc/nginx/sites-available/kyvuongsuytam.site /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

### Bước 5: Thiết lập Auto-Renewal
```bash
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer

# Test renewal
sudo certbot renew --dry-run
```

## 📝 Các lệnh quản lý SSL

### Xem thông tin certificate
```bash
sudo certbot certificates
```

### Gia hạn certificate thủ công
```bash
sudo certbot renew
```

### Xóa certificate
```bash
sudo certbot delete --cert-name kyvuongsuytam.site
```

### Kiểm tra auto-renewal
```bash
sudo systemctl status certbot.timer
sudo systemctl list-timers | grep certbot
```

## 🔍 Kiểm tra SSL

### Kiểm tra certificate
```bash
openssl s_client -connect kyvuongsuytam.site:443 -servername kyvuongsuytam.site
```

### Kiểm tra online
- https://www.ssllabs.com/ssltest/analyze.html?d=kyvuongsuytam.site
- https://www.sslshopper.com/ssl-checker.html#hostname=kyvuongsuytam.site

## 🐛 Troubleshooting

### Lỗi: "Failed to obtain certificate"
- Kiểm tra DNS đã trỏ đúng chưa: `nslookup kyvuongsuytam.site`
- Kiểm tra port 80 đã mở trong Security Group
- Đảm bảo không có firewall chặn port 80

### Lỗi: "Connection refused"
- Kiểm tra Nginx đang chạy: `sudo systemctl status nginx`
- Kiểm tra port 80, 443: `sudo netstat -tlnp | grep -E ':(80|443)'`

### Certificate không auto-renew
```bash
# Kiểm tra timer
sudo systemctl status certbot.timer

# Khởi động lại timer
sudo systemctl restart certbot.timer
```

## 📞 Sau khi cấp SSL

1. **Cập nhật environment variables** trên EC2:
   ```bash
   # Sửa file .env.production
   sudo nano /home/ubuntu/exe-project/.env.production
   ```
   
   Thay đổi:
   ```
   NEXT_PUBLIC_API_URL=https://kyvuongsuytam.site
   NEXTAUTH_URL=https://kyvuongsuytam.site
   ```

2. **Restart ứng dụng:**
   ```bash
   pm2 restart exe-project
   ```

3. **Truy cập site:**
   - https://kyvuongsuytam.site

