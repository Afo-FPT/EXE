'use client';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Icon } from '@iconify/react/dist/iconify.js';

const AdminPanel: React.FC = () => {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <section className="py-12 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-extrabold text-gray-900 text-center mb-10">
           Admin Control Panel
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Dashboard */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center transform hover:scale-105 transition-all duration-300 border-b-4 border-blue-500">
            <div className="p-4 bg-blue-100 rounded-full mb-4">
              <Icon icon="solar:chart-square-bold" className="text-blue-600 text-4xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h3>
            <p className="text-gray-600 mb-6">Tổng quan hệ thống, thống kê người dùng và hoạt động.</p>
            <Link
              href="/admin/dashboard"
              className="mt-auto bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center justify-center"
            >
              <Icon icon="solar:arrow-right-up-bold" className="mr-2" />
              Xem Dashboard
            </Link>
          </div>

          {/* Card 2: Collection Management */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center transform hover:scale-105 transition-all duration-300 border-b-4 border-purple-500">
            <div className="p-4 bg-purple-100 rounded-full mb-4">
              <Icon icon="solar:gallery-bold" className="text-purple-600 text-4xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Collection</h3>
            <p className="text-gray-600 mb-6">Thêm, sửa, xóa collection và quản lý quân cờ trong collection.</p>
            <Link
              href="/admin/collection-management"
              className="mt-auto bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors duration-200 font-medium flex items-center justify-center"
            >
              <Icon icon="solar:arrow-right-up-bold" className="mr-2" />
              Quản lý Collection
            </Link>
          </div>

          {/* Card 3: User Management */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center text-center transform hover:scale-105 transition-all duration-300 border-b-4 border-green-500">
            <div className="p-4 bg-green-100 rounded-full mb-4">
              <Icon icon="solar:users-group-rounded-bold" className="text-green-600 text-4xl" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Quản lý Người dùng</h3>
            <p className="text-gray-600 mb-6">Xem, chỉnh sửa vai trò, ban/unban và xóa người dùng.</p>
            <Link
              href="/admin/user-management"
              className="mt-auto bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium flex items-center justify-center"
            >
              <Icon icon="solar:arrow-right-up-bold" className="mr-2" />
              Quản lý Người dùng
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <h4 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h4>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/admin/dashboard"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
            >
              <Icon icon="solar:widget-5-bold" className="inline-block mr-2" />
              Dashboard
            </Link>
            <Link
              href="/admin/collection-management"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
            >
              <Icon icon="solar:gallery-bold" className="inline-block mr-2" />
              Collections
            </Link>
            <Link
              href="/admin/user-management"
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
            >
              <Icon icon="solar:users-group-rounded-bold" className="inline-block mr-2" />
              Users
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AdminPanel;
