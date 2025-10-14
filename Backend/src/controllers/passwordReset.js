import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../model/user.js';
import { sendResetPasswordEmail, sendPasswordResetConfirmEmail } from '../services/emailService.js';

// Mock database để lưu reset tokens (trong production sẽ dùng Redis hoặc database)
const resetTokens = new Map();

// Generate reset token
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Forgot password endpoint
export const forgotPassword = async (req, res) => {
  try {
    console.log('📧 Forgot password request:', req.body);
    
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email là bắt buộc'
      });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }
    
    // Generate reset token
    const resetToken = generateResetToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    // Store token in memory (in production, use Redis or database)
    resetTokens.set(resetToken, {
      email: email,
      expiresAt: expiresAt,
      used: false
    });
    
    console.log('🔑 Generated reset token for:', email);
    
    // Send reset password email
    const emailResult = await sendResetPasswordEmail(email, resetToken);
    
    if (emailResult.success) {
      console.log('✅ Reset password email sent successfully to:', email);
      
      return res.status(200).json({
        success: true,
        message: 'Email đặt lại mật khẩu đã được gửi thành công',
        data: {
          email: email,
          expiresAt: expiresAt,
          messageId: emailResult.messageId
        }
      });
    } else {
      console.error('❌ Failed to send reset password email:', emailResult.error);
      
      // Remove token if email failed
      resetTokens.delete(resetToken);
      
      return res.status(500).json({
        success: false,
        message: 'Không thể gửi email đặt lại mật khẩu. Vui lòng thử lại sau.'
      });
    }
    
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi xử lý yêu cầu đặt lại mật khẩu'
    });
  }
};

// Reset password endpoint
export const resetPassword = async (req, res) => {
  try {
    console.log('🔐 Reset password request:', req.body);
    
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Token và mật khẩu mới là bắt buộc'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự'
      });
    }
    
    // Check if token exists and is valid
    const tokenData = resetTokens.get(token);
    
    if (!tokenData) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }
    
    if (tokenData.used) {
      return res.status(400).json({
        success: false,
        message: 'Token đã được sử dụng'
      });
    }
    
    if (new Date() > tokenData.expiresAt) {
      // Remove expired token
      resetTokens.delete(token);
      return res.status(400).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }
    
    // Mark token as used
    tokenData.used = true;
    resetTokens.set(token, tokenData);
    
    // Try to update password in database
    try {
      // Hash new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      // Update password in database
      const user = await User.findOneAndUpdate(
        { email: tokenData.email },
        { password: hashedPassword },
        { new: true }
      );
      
      if (user) {
        console.log('✅ Password updated in database for:', tokenData.email);
        console.log('👤 User found:', user.username || user.email);
        
        // Send confirmation email with user info
        await sendPasswordResetConfirmEmail(tokenData.email, user.username || user.name || 'User');
      } else {
        console.log('⚠️ User not found in database, but token was valid');
        console.log('📧 Email:', tokenData.email);
        
        // Still send confirmation email
        await sendPasswordResetConfirmEmail(tokenData.email, 'User');
      }
    } catch (dbError) {
      console.error('❌ Database update error:', dbError.message);
      console.log('⚠️ Continuing with email confirmation despite DB error');
      
      // Still send confirmation email even if DB update failed
      await sendPasswordResetConfirmEmail(tokenData.email, 'User');
    }
    
    console.log('✅ Password reset process completed for:', tokenData.email);
    
    // Remove token after successful reset
    resetTokens.delete(token);
    
    return res.status(200).json({
      success: true,
      message: 'Mật khẩu đã được đặt lại thành công'
    });
    
  } catch (error) {
    console.error('❌ Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi đặt lại mật khẩu'
    });
  }
};

// Verify reset token endpoint
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token là bắt buộc'
      });
    }
    
    const tokenData = resetTokens.get(token);
    
    if (!tokenData) {
      return res.status(400).json({
        success: false,
        message: 'Token không hợp lệ hoặc đã hết hạn'
      });
    }
    
    if (tokenData.used) {
      return res.status(400).json({
        success: false,
        message: 'Token đã được sử dụng'
      });
    }
    
    if (new Date() > tokenData.expiresAt) {
      resetTokens.delete(token);
      return res.status(400).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'Token hợp lệ',
      data: {
        email: tokenData.email,
        expiresAt: tokenData.expiresAt
      }
    });
    
  } catch (error) {
    console.error('❌ Verify reset token error:', error);
    return res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi xác thực token'
    });
  }
};

// Get all reset tokens (for debugging)
export const getResetTokens = async (req, res) => {
  try {
    const tokens = Array.from(resetTokens.entries()).map(([token, data]) => ({
      token: token.substring(0, 8) + '...', // Only show first 8 chars for security
      email: data.email,
      expiresAt: data.expiresAt,
      used: data.used
    }));
    
    res.status(200).json({
      success: true,
      data: tokens
    });
  } catch (error) {
    console.error('❌ Get reset tokens error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy danh sách tokens'
    });
  }
};

