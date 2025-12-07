# 🚀 Hướng Dẫn Nhanh - Deploy lên EC2

## Thông tin EC2 Instance
- **IP**: 47.130.211.9
- **PEM Key**: `D:\FPTU\exe\EXE1.pem`
- **User**: ubuntu

## 📋 Các bước deploy

### Bước 1: Kiểm tra Security Group trên AWS
Đảm bảo các port sau đã được mở trong Security Group:
- **Port 22** (SSH) - Để kết nối vào server
- **Port 80** (HTTP) - Để truy cập ứng dụng
- **Port 443** (HTTPS) - Nếu có SSL
- **Port 3000** (tùy chọn) - Port của Next.js app

### Bước 2: Deploy ứng dụng
Chạy file batch để deploy tự động:
```batch
deploy-ec2.bat
```

Script này sẽ:
1. Build ứng dụng Next.js
2. Tạo package deployment
3. Upload lên EC2
4. Cài đặt dependencies
5. Khởi động ứng dụng với PM2
6. Cấu hình Nginx

### Bước 3: Kiểm tra deployment
Sau khi deploy xong, truy cập:
```
http://47.130.211.9
```

## 🛠️ Các script quản lý EC2

### Kết nối và quản lý cơ bản
| Script | Mô tả |
|--------|-------|
| `connect-ec2.bat` | SSH vào EC2 instance |
| `check-server.bat` | Kiểm tra tổng thể server (PM2, Nginx, Port, Disk) |

### Quản lý PM2 (Ứng dụng)
| Script | Mô tả |
|--------|-------|
| `pm2-status.bat` | Xem trạng thái ứng dụng |
| `pm2-logs.bat` | Xem logs ứng dụng (real-time) |
| `pm2-restart.bat` | Restart ứng dụng |
| `pm2-stop.bat` | Dừng ứng dụng |
| `pm2-start.bat` | Khởi động ứng dụng |

### Quản lý Nginx
| Script | Mô tả |
|--------|-------|
| `nginx-status.bat` | Xem trạng thái Nginx |
| `nginx-restart.bat` | Restart Nginx |

### PowerShell Script (Nâng cao)
Sử dụng `ec2-commands.ps1` với nhiều tùy chọn:
```powershell
.\ec2-commands.ps1 connect      # SSH vào EC2
.\ec2-commands.ps1 status       # PM2 status
.\ec2-commands.ps1 logs         # PM2 logs
.\ec2-commands.ps1 restart      # Restart app
.\ec2-commands.ps1 check         # Kiểm tra server
.\ec2-commands.ps1 help         # Xem tất cả lệnh
```

## 🔧 Các lệnh thường dùng trên EC2

### Kết nối vào EC2
```bash
ssh -i "D:\FPTU\exe\EXE1.pem" ubuntu@47.130.211.9
```

### PM2 Commands (trên EC2)
```bash
pm2 status              # Xem trạng thái
pm2 logs exe-project    # Xem logs
pm2 restart exe-project # Restart
pm2 stop exe-project    # Dừng
pm2 start exe-project   # Khởi động
pm2 monit               # Monitor real-time
```

### Nginx Commands (trên EC2)
```bash
sudo nginx -t                    # Test cấu hình
sudo systemctl status nginx      # Xem trạng thái
sudo systemctl restart nginx     # Restart
sudo systemctl reload nginx      # Reload (không downtime)
sudo tail -f /var/log/nginx/error.log  # Xem error logs
```

### Kiểm tra ứng dụng
```bash
# Kiểm tra port 3000
netstat -tlnp | grep :3000

# Kiểm tra process
ps aux | grep node

# Kiểm tra disk space
df -h

# Kiểm tra memory
free -h
```

## 🐛 Troubleshooting

### Ứng dụng không chạy
1. Kiểm tra logs: `pm2-logs.bat` hoặc `pm2 logs exe-project`
2. Kiểm tra port: `netstat -tlnp | grep :3000`
3. Kiểm tra environment variables: `cat /home/ubuntu/exe-project/.env.production`

### Không thể truy cập từ browser
1. Kiểm tra Security Group trên AWS Console
2. Kiểm tra Nginx: `nginx-status.bat`
3. Kiểm tra firewall: `sudo ufw status`

### Lỗi khi deploy
1. Kiểm tra kết nối SSH: `connect-ec2.bat`
2. Kiểm tra disk space: `df -h`
3. Xem logs chi tiết trong quá trình deploy

## 📝 Cập nhật ứng dụng

Khi có code mới, chỉ cần chạy lại:
```batch
deploy-ec2.bat
```

Script sẽ tự động:
- Build code mới
- Upload lên EC2
- Restart ứng dụng

## 🔐 Bảo mật

1. **PEM Key**: Giữ file `EXE1.pem` an toàn, không commit lên Git
2. **Environment Variables**: Kiểm tra file `env.production` trước khi deploy
3. **Security Group**: Chỉ mở các port cần thiết
4. **Firewall**: Cấu hình UFW trên EC2 nếu cần

## 📞 Hỗ trợ

Nếu gặp vấn đề:
1. Kiểm tra logs: `pm2-logs.bat`
2. Kiểm tra server: `check-server.bat`
3. Xem hướng dẫn chi tiết: `DEPLOYMENT_GUIDE.md`

