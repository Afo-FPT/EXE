# 📧 Hướng dẫn cấu hình Email Service

## 🔧 **Cấu hình Gmail SMTP**

### **Bước 1: Tạo App Password cho Gmail**

1. **Bật 2-Factor Authentication** cho Gmail account
2. **Tạo App Password:**
   - Vào Google Account Settings
   - Security → 2-Step Verification → App passwords
   - Chọn "Mail" và "Other (Custom name)"
   - Nhập tên: "Chess Collection App"
   - Copy password được tạo (16 ký tự)

### **Bước 2: Cấu hình Environment Variables**

Tạo file `.env` trong thư mục `D:/FPTU/exe/V2/BE/Backend/`:

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server Configuration
PORT=5000
NODE_ENV=development
```

### **Bước 3: Test Email Connection**

Chạy lệnh test:
```bash
cd D:/FPTU/exe/V2/BE/Backend
node -e "
import('./src/services/emailService.js').then(module => {
  module.testEmailConnection().then(result => {
    console.log('Email test result:', result);
  });
});
"
```

## 🚀 **Các API Endpoints**

### **Forgot Password**
```
POST /api/password-reset/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### **Reset Password**
```
POST /api/password-reset/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

### **Verify Token**
```
GET /api/password-reset/verify-token/:token
```

## 📱 **Frontend Pages**

- **Forgot Password:** `/forgotpassword`
- **Reset Password:** `/reset-password?token=xxx`

## 🔍 **Debug & Testing**

### **Xem Reset Tokens (Debug)**
```
GET /api/password-reset/debug/tokens
```

### **Test Email Templates**
```javascript
// Test reset password email
import { sendResetPasswordEmail } from './src/services/emailService.js';

sendResetPasswordEmail('test@example.com', 'test-token-123')
  .then(result => console.log(result));
```

## ⚠️ **Lưu ý quan trọng**

1. **App Password:** Không sử dụng mật khẩu Gmail thông thường
2. **Token Expiry:** Reset tokens có hiệu lực 24 giờ
3. **One-time Use:** Mỗi token chỉ sử dụng được 1 lần
4. **Security:** Trong production, sử dụng Redis để lưu tokens
5. **Rate Limiting:** Nên thêm rate limiting cho forgot password

## 🛠️ **Troubleshooting**

### **Lỗi Authentication Failed**
- Kiểm tra App Password đúng chưa
- Đảm bảo 2FA đã được bật
- Kiểm tra email format

### **Lỗi Connection Timeout**
- Kiểm tra firewall
- Thử port khác (465 cho SSL)
- Kiểm tra network connection

### **Email không được gửi**
- Kiểm tra spam folder
- Verify email address
- Check SMTP settings

## 📊 **Production Recommendations**

1. **Use Redis** thay vì memory để lưu tokens
2. **Add Rate Limiting** để tránh spam
3. **Use Queue System** (Bull/BullMQ) cho email
4. **Add Logging** cho email events
5. **Use Email Service** như SendGrid, Mailgun
6. **Add Monitoring** cho email delivery rates

