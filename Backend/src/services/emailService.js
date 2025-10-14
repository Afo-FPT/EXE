import nodemailer from 'nodemailer';

// Email configuration
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // Sử dụng Gmail SMTP
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });
};

// Email template cho reset password
const createResetPasswordEmail = (email, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  return {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: 'Đặt lại mật khẩu - Chess Collection',
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt lại mật khẩu</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .title {
            font-size: 24px;
            color: #1f2937;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            margin: 20px 0;
            transition: background-color 0.3s;
          }
          .button:hover {
            background-color: #1d4ed8;
          }
          .warning {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
          .token {
            background-color: #f3f4f6;
            padding: 10px;
            border-radius: 5px;
            font-family: monospace;
            word-break: break-all;
            margin: 10px 0;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">♔ Chess Collection</div>
            <h1 class="title">Đặt lại mật khẩu</h1>
          </div>
          
          <div class="content">
            <p>Xin chào,</p>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Để đặt lại mật khẩu, vui lòng click vào nút bên dưới:</p>
            
            <div style="text-align: center;">
              <a href="${resetUrl}" class="button">Đặt lại mật khẩu</a>
            </div>
            
            <p>Hoặc copy và paste link này vào trình duyệt:</p>
            <div class="token">${resetUrl}</div>
            
            <div class="warning">
              <strong>⚠️ Lưu ý quan trọng:</strong>
              <ul>
                <li>Link này chỉ có hiệu lực trong <strong>24 giờ</strong></li>
                <li>Chỉ sử dụng được <strong>1 lần</strong></li>
                <li>Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>Email này được gửi tự động từ hệ thống Chess Collection</p>
            <p>Nếu có thắc mắc, vui lòng liên hệ: support@chesscollection.com</p>
            <p>© 2024 Chess Collection. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Email template cho confirm password reset
const createPasswordResetConfirmEmail = (email, username) => {
  return {
    from: process.env.EMAIL_USER || 'your-email@gmail.com',
    to: email,
    subject: 'Mật khẩu đã được đặt lại thành công - Chess Collection',
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mật khẩu đã được đặt lại</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background-color: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #10b981;
            margin-bottom: 10px;
          }
          .success-icon {
            font-size: 48px;
            color: #10b981;
            margin-bottom: 20px;
          }
          .content {
            margin-bottom: 30px;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">♔ Chess Collection</div>
            <div class="success-icon">✅</div>
            <h1 style="color: #10b981;">Mật khẩu đã được đặt lại thành công!</h1>
          </div>
          
          <div class="content">
            <p>Xin chào <strong>${username}</strong>,</p>
            <p>Mật khẩu của bạn đã được đặt lại thành công vào lúc <strong>${new Date().toLocaleString('vi-VN')}</strong>.</p>
            
            <p>Nếu bạn không thực hiện thao tác này, vui lòng:</p>
            <ul>
              <li>Liên hệ ngay với chúng tôi</li>
              <li>Kiểm tra tài khoản của bạn</li>
              <li>Thay đổi mật khẩu mới ngay lập tức</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Email này được gửi tự động từ hệ thống Chess Collection</p>
            <p>Nếu có thắc mắc, vui lòng liên hệ: support@chesscollection.com</p>
            <p>© 2024 Chess Collection. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Function để gửi email reset password
export const sendResetPasswordEmail = async (email, resetToken) => {
  try {
    const transporter = createTransporter();
    const mailOptions = createResetPasswordEmail(email, resetToken);
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Reset password email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending reset password email:', error);
    return { success: false, error: error.message };
  }
};

// Function để gửi email confirm password reset
export const sendPasswordResetConfirmEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    const mailOptions = createPasswordResetConfirmEmail(email, username);
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset confirm email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset confirm email:', error);
    return { success: false, error: error.message };
  }
};

// Function để test email connection
export const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server connection verified');
    return { success: true };
  } catch (error) {
    console.error('❌ Email server connection failed:', error);
    return { success: false, error: error.message };
  }
};

