# Kiểm tra và Sửa lỗi SSL Certificate

## Vấn đề hiện tại:
- Let's Encrypt đang cố kết nối đến IP `13.237.124.97` (IP cũ)
- EC2 instance hiện tại có IP: `47.130.211.9` (IP mới)

## Giải pháp:

### Bước 1: Kiểm tra DNS
Domain `kyvuongsuytam.site` phải trỏ về IP mới `47.130.211.9`

**Kiểm tra DNS:**
```bash
nslookup kyvuongsuytam.site
# hoặc
dig kyvuongsuytam.site
```

**Nếu DNS chưa đúng:**
1. Vào nhà cung cấp domain (nơi bạn mua domain)
2. Tìm DNS Management / DNS Records
3. Tìm A Record cho `kyvuongsuytam.site`
4. Cập nhật IP từ `13.237.124.97` → `47.130.211.9`
5. Đợi DNS propagate (5-30 phút)

### Bước 2: Kiểm tra Security Group trên AWS
1. Vào AWS Console → EC2 → Instances
2. Chọn instance `47.130.211.9`
3. Click tab "Security" → Security Group
4. Click "Edit inbound rules"
5. Đảm bảo có:
   - **Port 80** (HTTP) - Source: `0.0.0.0/0`
   - **Port 443** (HTTPS) - Source: `0.0.0.0/0`

### Bước 3: Kiểm tra Firewall trên EC2
```bash
# Kiểm tra UFW
sudo ufw status

# Nếu UFW đang chạy, mở port 80 và 443
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Bước 4: Sau khi DNS đã đúng, chạy lại certbot

**Cách 1: Dùng HTTP challenge (sau khi DNS đã đúng)**
```bash
sudo systemctl stop nginx
sudo certbot certonly --standalone \
    -d kyvuongsuytam.site \
    --email your-email@example.com \
    --agree-tos \
    --non-interactive
```

**Cách 2: Dùng DNS challenge (không cần mở port 80)**
```bash
sudo certbot certonly --manual --preferred-challenges dns \
    -d kyvuongsuytam.site \
    --email your-email@example.com \
    --agree-tos
```
Certbot sẽ yêu cầu bạn thêm TXT record vào DNS.

### Bước 5: Kiểm tra DNS đã propagate chưa
```bash
# Kiểm tra từ nhiều nơi
dig @8.8.8.8 kyvuongsuytam.site
dig @1.1.1.1 kyvuongsuytam.site
```

Nếu tất cả đều trả về `47.130.211.9` thì DNS đã đúng.

