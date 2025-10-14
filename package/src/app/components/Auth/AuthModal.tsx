'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Extend Window interface for Google
declare global {
  interface Window {
    google: any
  }
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, mode }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmpassword: ''  // Sửa thành confirmpassword để khớp với backend
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);
  
  const { login, register } = useAuth();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        console.log('🎉 Login successful!');
      } else {
        // Validation for register
        if (formData.password !== formData.confirmpassword) {
          setError('Mật khẩu xác nhận không khớp');
          setLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          setError('Mật khẩu phải có ít nhất 6 ký tự');
          setLoading(false);
          return;
        }

        await register(formData.username, formData.email, formData.password, formData.confirmpassword);
        console.log('🎉 Registration successful!');
      }
      
             // Đóng modal sau 1 giây để user thấy toast
       setTimeout(() => {
         onClose();
       }, 1000);
     } catch (err: any) {
       console.error('❌ Auth error:', err);
       // Hiển thị lỗi chi tiết hơn
       if (err.message) {
         setError(err.message);
       } else if (err.errors && Array.isArray(err.errors)) {
         setError(err.errors.join(', '));
       } else {
         setError('Có lỗi xảy ra, vui lòng thử lại');
       }
     } finally {
       setLoading(false);
     }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      setError('');
      console.log('Google login clicked');
      
      // Check if Google Client ID is configured
      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      console.log('Client ID:', clientId);
      
      if (!clientId) {
        setError('Google Client ID chưa được cấu hình');
        return;
      }

      // Load Google API script
      if (!window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        
        // Wait for script to load
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Initialize Google OAuth
      const authInstance = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'email profile',
        callback: async (response: any) => {
          try {
            if (response.error) {
              throw new Error(response.error);
            }

            console.log('Google OAuth response:', response);

            // Get user info
            const userInfo = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${response.access_token}`);
            const userData = await userInfo.json();
            console.log('User data:', userData);

            // Send to backend
            const backendResponse = await fetch('http://localhost:5000/api/google-login', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                token: response.access_token,
                userData: userData
              })
            });

            console.log('Backend response status:', backendResponse.status);
            
            if (!backendResponse.ok) {
              const errorText = await backendResponse.text();
              console.error('Backend error response:', errorText);
              throw new Error(`Backend error: ${backendResponse.status} - ${errorText}`);
            }

            const result = await backendResponse.json();
            console.log('Backend response:', result);

            if (result.success) {
              // Store token and user data
              localStorage.setItem('token', result.token);
              localStorage.setItem('user', JSON.stringify(result.user));
              
              // Close modal and redirect
              onClose();
              // Force page reload to update auth context
              window.location.reload();
            } else {
              console.error('Backend error:', result);
              throw new Error(result.message || result.error || 'Google login failed');
            }
          } catch (error) {
            console.error('Google login error:', error);
            setError('Đăng nhập Google thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
          } finally {
            setGoogleLoading(false);
          }
        }
      });

      // Request access token
      authInstance.requestAccessToken();

    } catch (error) {
      console.error('Google login initialization error:', error);
      setError('Lỗi khởi tạo Google login: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'));
      setGoogleLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản mới'}
          </h2>
          <p className="text-gray-600">
            {mode === 'login' ? (
              <>
                Hoặc{' '}
                <button
                  onClick={() => setFormData({ username: '', email: '', password: '', confirmpassword: '' })}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  đăng ký tài khoản mới
                </button>
              </>
            ) : (
              <>
                Hoặc{' '}
                <button
                  onClick={() => setFormData({ username: '', email: '', password: '', confirmpassword: '' })}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  đăng nhập nếu đã có tài khoản
                </button>
              </>
            )}
          </p>
        </div>

        {/* Google Login Button */}
        <div className="mb-6">
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm"
          >
            {googleLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span className="text-sm font-medium text-gray-700">
              {googleLoading ? 'Đang đăng nhập...' : 'Đăng nhập với Google'}
            </span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Hoặc</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {mode === 'register' && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Tên người dùng
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập tên người dùng"
                minLength={3}
                maxLength={20}
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Nhập email của bạn"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={mode === 'login' ? 'Nhập mật khẩu' : 'Nhập mật khẩu (tối thiểu 6 ký tự)'}
              minLength={mode === 'register' ? 6 : undefined}
            />
          </div>

          {mode === 'register' && (
            <div>
              <label htmlFor="confirmpassword" className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmpassword"
                name="confirmpassword"
                type="password"
                required
                value={formData.confirmpassword}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nhập lại mật khẩu"
                minLength={6}
              />
            </div>
          )}

          {mode === 'register' && (
            <div className="flex items-center">
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-700">
                Tôi đồng ý với{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                  điều khoản sử dụng
                </Link>{' '}
                và{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                  chính sách bảo mật
                </Link>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>
                  {mode === 'login' ? 'Đang đăng nhập...' : 'Đang tạo tài khoản...'}
                </span>
              </div>
            ) : (
              mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AuthModal;
