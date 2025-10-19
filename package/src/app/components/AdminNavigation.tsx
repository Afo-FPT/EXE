'use client';

import Link from 'next/link';

interface AdminNavigationProps {
  currentPage?: string;
  showHomeButton?: boolean;
}

export default function AdminNavigation({ 
  currentPage, 
  showHomeButton = true 
}: AdminNavigationProps) {
  return (
    <div className="flex items-center space-x-4">
      {showHomeButton && (
        <Link
          href="/"
          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
        >
          🏠 Trang chủ
        </Link>
      )}
      
      <Link
        href="/admin/dashboard"
        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
      >
        📊 Dashboard
      </Link>
      
      {/* Quick navigation menu */}
      <div className="relative group">
        <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200">
          ⚡ Thao tác nhanh
        </button>
        
        {/* Dropdown menu */}
        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
          <div className="p-2">
            <Link
              href="/admin/store-management"
              className={`block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${
                currentPage === 'store-management' ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              🛍️ Quản lý Cửa hàng
            </Link>
            <Link
              href="/admin/order-management"
              className={`block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${
                currentPage === 'order-management' ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              📦 Quản lý Đơn hàng
            </Link>
            <Link
              href="/admin/collection-management"
              className={`block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${
                currentPage === 'collection-management' ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              🎴 Quản lý Collection
            </Link>
            <Link
              href="/admin/chess-piece-management"
              className={`block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${
                currentPage === 'chess-piece-management' ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              ♟️ Quản lý Quân Cờ
            </Link>
            <Link
              href="/admin/user-management"
              className={`block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors ${
                currentPage === 'user-management' ? 'bg-blue-50 text-blue-700' : ''
              }`}
            >
              👥 Quản lý Người dùng
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
