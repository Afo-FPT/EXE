'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from '@iconify/react';

const UserProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Chào mừng trở lại! 🎉
          </h2>
          <p className="text-lg text-gray-600">
            Bạn đã đăng nhập thành công vào EXE Project
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* User Info */}
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center">
                    <Icon icon="solar:user-bold" className="text-white text-3xl" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{user.username}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full mt-2">
                      Đã xác thực
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-700">
                    <Icon icon="solar:calendar-bold" className="text-primary" />
                    <span>Tham gia: {new Date().toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-700">
                    <Icon icon="solar:shield-check-bold" className="text-primary" />
                    <span>Vai trò: {user.role || 'Người dùng'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Hành động nhanh</h4>
                
                <button className="w-full flex items-center gap-3 p-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
                  <Icon icon="solar:user-bold" className="text-xl" />
                  <span>Chỉnh sửa hồ sơ</span>
                </button>

                <button className="w-full flex items-center gap-3 p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Icon icon="solar:settings-bold" className="text-xl" />
                  <span>Cài đặt tài khoản</span>
                </button>

                <button className="w-full flex items-center gap-3 p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Icon icon="solar:history-bold" className="text-xl" />
                  <span>Xem lịch sử</span>
                </button>

                <button className="w-full flex items-center gap-3 p-4 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <Icon icon="solar:gift-bold" className="text-xl" />
                  <span>Phần thưởng</span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Thống kê hoạt động</h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-blue-800">Lần đăng nhập</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-green-800">Hoạt động</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">0</div>
                  <div className="text-sm text-purple-800">Điểm tích lũy</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UserProfile;
