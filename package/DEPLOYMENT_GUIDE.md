# AWS EC2 Deployment Guide

Hướng dẫn deploy ứng dụng Next.js lên AWS EC2.

## Yêu cầu

- AWS EC2 instance đang chạy (IPv4: 47.130.211.9)
- PEM key file: `D:\FPTU\exe\EXE1.pem`
- OpenSSH Client (có sẵn trên Windows 10/11)

## Các bước deployment

### 1. Chuẩn bị

Đảm bảo các file sau đã được tạo:
- `deploy-ec2.sh` - Script deployment chính
- `nginx.conf` - Cấu hình Nginx
- `env.production` - Environment variables cho production
- `setup-nginx.sh` - Script setup Nginx và SSL

### 2. Deploy ứng dụng

#### Cách 1: Sử dụng Windows Batch file (Khuyến nghị)
```bash
# Chạy file batch
deploy-ec2.bat
```

#### Cách 2: Sử dụng WSL/Git Bash
```bash
# Cấp quyền thực thi
chmod +x deploy-ec2.sh

# Chạy script
./deploy-ec2.sh
```

### 3. Setup Nginx và SSL (Tùy chọn)

Sau khi deploy thành công, kết nối vào EC2 và setup Nginx:

```bash
# Kết nối vào EC2
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9

# Chạy script setup Nginx
bash /home/ubuntu/exe-project/setup-nginx.sh
```

### 4. Kiểm tra deployment

#### Sử dụng các script có sẵn (Khuyến nghị):
- `connect-ec2.bat` - Kết nối SSH vào EC2
- `pm2-status.bat` - Xem trạng thái PM2
- `pm2-logs.bat` - Xem logs ứng dụng
- `check-server.bat` - Kiểm tra tổng thể server

#### Hoặc sử dụng lệnh trực tiếp:
```bash
# Kiểm tra trạng thái ứng dụng
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "pm2 status"

# Kiểm tra logs
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "pm2 logs exe-project"

# Kiểm tra Nginx
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9 "sudo systemctl status nginx"
```

## Cấu trúc thư mục trên EC2

```
/home/ubuntu/exe-project/
├── src/                    # Source code
├── public/                 # Static files
├── package.json           # Dependencies
├── next.config.mjs        # Next.js config
├── nginx.conf             # Nginx config
├── env.production         # Environment variables
└── setup-nginx.sh         # Nginx setup script
```

## Quản lý ứng dụng

### PM2 Commands
```bash
# Xem trạng thái
pm2 status

# Restart ứng dụng
pm2 restart exe-project

# Stop ứng dụng
pm2 stop exe-project

# Xem logs
pm2 logs exe-project

# Monitor
pm2 monit
```

### Nginx Commands
```bash
# Test cấu hình
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# Xem logs
sudo tail -f /var/log/nginx/error.log
```

## Troubleshooting

### 1. Ứng dụng không start
```bash
# Kiểm tra logs
pm2 logs exe-project

# Kiểm tra port 3000
netstat -tlnp | grep :3000
```

### 2. Nginx không hoạt động
```bash
# Kiểm tra cấu hình
sudo nginx -t

# Kiểm tra logs
sudo tail -f /var/log/nginx/error.log
```

### 3. Không thể kết nối từ bên ngoài
- Kiểm tra Security Group của EC2 instance
- Đảm bảo port 80 và 443 được mở
- Kiểm tra firewall của EC2

## Cập nhật ứng dụng

Để cập nhật ứng dụng:

1. Thực hiện thay đổi code
2. Chạy lại `deploy-ec2.bat`
3. Script sẽ tự động build và deploy

## SSL Certificate (Tùy chọn)

Để enable SSL với Let's Encrypt:

1. Có domain name trỏ về IP EC2
2. Chạy script setup Nginx với domain:
```bash
# Trong file setup-nginx.sh, thay đổi:
DOMAIN="yourdomain.com"
```

## Monitoring

- **PM2**: Quản lý process và auto-restart
- **Nginx**: Reverse proxy và load balancing
- **System logs**: `/var/log/nginx/` và `pm2 logs`


