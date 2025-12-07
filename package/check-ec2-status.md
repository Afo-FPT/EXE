# Kiểm tra trạng thái EC2

## Lỗi "Failed to describe details"

Lỗi này có thể do:
1. **Quyền truy cập AWS bị hạn chế**
2. **Instance đã bị terminate**
3. **Instance ID không đúng**
4. **Vấn đề với AWS Console**

## Cách kiểm tra:

### 1. Kiểm tra danh sách instances
- Vào AWS Console → EC2 → Instances
- Xem có instance nào đang chạy không
- Kiểm tra IP address của instance

### 2. Kiểm tra qua website
Truy cập trực tiếp:
- **HTTPS**: https://kyvuongsuytam.site
- **HTTP**: http://47.130.211.9

Nếu website load được → Instance đang chạy và đã deploy thành công!

### 3. Kiểm tra Security Groups
- Vào EC2 → Security Groups
- Tìm Security Group của instance
- Đảm bảo có rules:
  - Port 22 (SSH) - Source: 0.0.0.0/0 hoặc IP của bạn
  - Port 80 (HTTP) - Source: 0.0.0.0/0
  - Port 443 (HTTPS) - Source: 0.0.0.0/0

### 4. Kiểm tra Elastic IP (nếu có)
- Vào EC2 → Elastic IPs
- Kiểm tra IP 47.130.211.9 có được gán cho instance không

## Nếu instance không tồn tại:

1. **Tạo instance mới** với cùng cấu hình
2. **Gán Elastic IP** (nếu có) cho instance mới
3. **Deploy lại** ứng dụng

## Nếu chỉ là lỗi quyền:

- Kiểm tra IAM permissions
- Đảm bảo có quyền `ec2:DescribeInstances`
- Hoặc liên hệ admin AWS để cấp quyền

