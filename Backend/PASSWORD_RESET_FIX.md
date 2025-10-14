# 📧 Email Setup Guide - Password Reset

## Vấn đề đã được khắc phục ✅

**Nguyên nhân:** Router password reset đã được tạo nhưng chưa được đăng ký trong `app.js` và `server.js`

**Giải pháp:** Đã thêm password reset router vào cả hai file server:
- `D:\FPTU\exe\V2\BE\Backend\src\app.js`
- `D:\FPTU\exe\V2\BE\Backend\server.js`

## API Endpoints hiện có

```
POST /api/password-reset/forgot-password
POST /api/password-reset/reset-password  
GET  /api/password-reset/verify-token/:token
GET  /api/password-reset/debug/tokens (for debugging)
```

## Cấu hình Email

### 1. Tạo file `.env` từ `env.example`

```bash
cp env.example .env
```

### 2. Cấu hình Gmail SMTP

Mở file `.env` và thêm:

```env
# Email Configuration (Gmail SMTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Tạo App Password cho Gmail

1. Đăng nhập vào Gmail
2. Vào **Settings** → **Security**
3. Bật **2-Step Verification** nếu chưa có
4. Tạo **App Password**:
   - Chọn **Mail** và **Other (Custom name)**
   - Nhập tên: "Chess Collection Backend"
   - Copy password được tạo (16 ký tự)

### 4. Cập nhật `.env`

```env
EMAIL_USER=your-actual-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

## Test API

### Chạy test script:

```bash
cd D:\FPTU\exe\V2\BE\Backend
node test-password-reset.mjs
```

### Test thủ công:

```bash
# Test forgot password
curl -X POST http://localhost:5000/api/password-reset/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Test health check
curl http://localhost:5000/api/health
```

## Frontend Integration

Frontend đã được cấu hình để gọi đúng endpoints:

- **Forgot Password:** `POST /api/password-reset/forgot-password`
- **Reset Password:** `POST /api/password-reset/reset-password`
- **Verify Token:** `GET /api/password-reset/verify-token/:token`

## Troubleshooting

### 1. "API endpoint không tồn tại"
- ✅ **Đã sửa:** Router đã được đăng ký
- Restart server sau khi thay đổi

### 2. Email không gửi được
- Kiểm tra `EMAIL_USER` và `EMAIL_PASS` trong `.env`
- Đảm bảo đã tạo App Password (không phải mật khẩu thường)
- Kiểm tra 2-Step Verification đã bật

### 3. CORS errors
- Frontend URL đã được cấu hình trong CORS
- Kiểm tra `FRONTEND_URL=http://localhost:3000`

### 4. Token không hợp lệ
- Tokens có thời hạn 24 giờ
- Chỉ sử dụng được 1 lần
- Kiểm tra debug endpoint: `/api/password-reset/debug/tokens`

## Email Templates

Email templates đã được tạo với:
- ✅ Thiết kế responsive
- ✅ Logo và branding
- ✅ Hướng dẫn rõ ràng
- ✅ Cảnh báo bảo mật
- ✅ Link reset password

## Next Steps

1. **Cấu hình email** theo hướng dẫn trên
2. **Test API** bằng script hoặc frontend
3. **Deploy** với cấu hình production email
4. **Monitor** logs để debug nếu cần

---

**Lưu ý:** Trong production, nên sử dụng Redis hoặc database để lưu reset tokens thay vì memory.
