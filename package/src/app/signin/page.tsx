'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import GoogleLogin from '@/app/components/Auth/GoogleLogin';

export default function SignInPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmpassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await register(formData.username, formData.email, formData.password, formData.confirmpassword);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isLogin ? 'Đăng nhập' : 'Đăng ký'}
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Chào mừng bạn trở lại!' : 'Tạo tài khoản mới'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Tên người dùng
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required={!isLogin}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Nhập tên người dùng"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Nhập email của bạn"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              placeholder="Nhập mật khẩu"
            />
          </div>

          {!isLogin && (
            <div>
              <label htmlFor="confirmpassword" className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </label>
              <input
                type="password"
                id="confirmpassword"
                name="confirmpassword"
                value={formData.confirmpassword}
                onChange={handleInputChange}
                required={!isLogin}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                placeholder="Nhập lại mật khẩu"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                {isLogin ? 'Đang đăng nhập...' : 'Đang đăng ký...'}
              </div>
            ) : (
              isLogin ? 'Đăng nhập' : 'Đăng ký'
            )}
          </button>
        </form>

        {/* Google Login Section */}
        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-white text-gray-500 font-medium">Hoặc đăng nhập với</span>
            </div>
          </div>

          <div className="mt-6">
            <GoogleLogin
              onSuccess={() => {
                console.log('Google login successful');
                // Redirect to home page or dashboard
                window.location.href = '/';
              }}
              onError={(error) => {
                console.error('Google login error:', error);
                alert('Đăng nhập Google thất bại: ' + error);
              }}
              className="w-full"
            />
          </div>
          
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Bằng cách đăng nhập, bạn đồng ý với 
              <Link href="/terms" className="text-blue-600 hover:underline ml-1">Điều khoản sử dụng</Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:text-blue-700 font-medium transition duration-200"
          >
            {isLogin ? 'Chưa có tài khoản? Đăng ký ngay' : 'Đã có tài khoản? Đăng nhập'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-gray-600 hover:text-gray-800 transition duration-200">
            ← Quay về trang chủ
          </Link>
        </div>

        {!isLogin && (
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">👑 Tài khoản Admin mặc định:</h3>
            <p className="text-sm text-blue-700">
              Email: <strong>admin@exe.com</strong><br />
              Password: <strong>123123123</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

