# ✅ Checklist Trước Khi Deploy

## 🔍 Những gì cần kiểm tra TRƯỚC khi chạy deploy:

### 1. ✅ Security Group trên AWS Console (QUAN TRỌNG NHẤT!)

Vào AWS Console → EC2 → Security Groups → Chọn Security Group của instance → Inbound Rules

**BẮT BUỘC phải mở các port sau:**
- **Port 22** (SSH) - Source: `0.0.0.0/0` hoặc IP của bạn
- **Port 80** (HTTP) - Source: `0.0.0.0/0` 
- **Port 443** (HTTPS) - Source: `0.0.0.0/0` (nếu có SSL)

**Cách kiểm tra:**
1. Vào AWS Console
2. EC2 → Instances → Chọn instance của bạn
3. Click tab "Security" → Click Security Group
4. Click "Edit inbound rules"
5. Đảm bảo có các rules trên

### 2. ✅ EC2 Instance đang chạy

- Vào AWS Console → EC2 → Instances
- Đảm bảo instance có status là "Running"
- Đảm bảo IP là: `47.130.211.9`

### 3. ✅ File PEM key tồn tại

- Đường dẫn: `D:\FPTU\exe\EXE1.pem`
- File phải có quyền đọc

### 4. ✅ Kết nối SSH hoạt động

Chạy script kiểm tra:
```batch
pre-deploy-check.bat
```

Hoặc test thủ công:
```batch
connect-ec2.bat
```

## 🎯 Những gì KHÔNG cần làm trên EC2:

### ❌ KHÔNG cần cài đặt Node.js trước
Script deploy sẽ tự động cài Node.js 18 nếu chưa có.

### ❌ KHÔNG cần cài đặt PM2 trước
Script deploy sẽ tự động cài PM2 nếu chưa có.

### ❌ KHÔNG cần cài đặt Nginx trước
Script deploy sẽ tự động cài Nginx nếu chưa có.

### ❌ KHÔNG cần tạo thư mục trước
Script deploy sẽ tự động tạo thư mục `/home/ubuntu/exe-project`.

### ❌ KHÔNG cần cấu hình gì trước
Script deploy sẽ tự động:
- Cài đặt tất cả dependencies
- Cấu hình PM2
- Cấu hình Nginx
- Khởi động ứng dụng

## 🚀 Quy trình deploy:

1. **Kiểm tra Security Group** (quan trọng nhất!)
2. **Chạy script kiểm tra**: `pre-deploy-check.bat`
3. **Chạy deploy**: `deploy-ec2.bat`
4. **Đợi script hoàn tất** (5-10 phút)
5. **Truy cập**: `http://47.130.211.9`

## 📝 Lưu ý:

- Script deploy sẽ **TỰ ĐỘNG** setup mọi thứ trên EC2
- Bạn chỉ cần đảm bảo **Security Group đã mở port**
- Lần đầu deploy có thể mất 10-15 phút (cài đặt Node.js, PM2, Nginx)
- Các lần deploy sau sẽ nhanh hơn (chỉ upload code mới)

## 🐛 Nếu gặp lỗi:

### Lỗi "Connection refused" hoặc "Connection timeout"
→ Kiểm tra Security Group đã mở port 22 chưa

### Lỗi "Permission denied"
→ Kiểm tra file PEM key có đúng không

### Lỗi "Host key verification failed"
→ Chạy lệnh này để bỏ qua kiểm tra:
```batch
ssh -i "D:\FPTU\exe\EXE1.pem" -o StrictHostKeyChecking=no ubuntu@47.130.211.9 "echo 'OK'"
```

