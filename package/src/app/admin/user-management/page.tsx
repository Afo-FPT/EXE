'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ProtectedRoute from '@/app/components/ProtectedRoute';
import Link from 'next/link';
import AdminNavigation from '@/app/components/AdminNavigation';
import { Icon } from '@iconify/react/dist/iconify.js';

interface User {
  _id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'banned';
  createdAt: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function UserManagementPage() {
  const { token, user: currentUser, showToast } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<'all' | 'user' | 'admin' | 'banned'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 10, totalPages: 1 });

  useEffect(() => {
    if (token) {
      fetchUsers();
    } else {
      setIsLoading(false);
    }
  }, [token, filterRole, searchTerm, pagination.page, pagination.limit]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filterRole !== 'all') {
        queryParams.append('role', filterRole);
      }
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }
      queryParams.append('page', pagination.page.toString());
      queryParams.append('limit', pagination.limit.toString());

      const response = await fetch(`http://localhost:5000/api/users?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setPagination(data.pagination);
      } else {
        const errorData = await response.json();
        showToast(errorData.errors?.join(', ') || 'Lỗi khi tải danh sách người dùng', 'error');
        setUsers([]);
      }
    } catch (error) {
      console.error('Network error fetching users:', error);
      showToast('Lỗi kết nối khi tải danh sách người dùng', 'error');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string, newRole: string) => {
    if (currentUser?._id === userId) {
      showToast('Không thể thay đổi vai trò của chính mình!', 'error');
      return;
    }
    if (currentRole === 'admin' && newRole !== 'admin') {
      showToast('Không thể hạ cấp admin khác!', 'error');
      return;
    }
    if (newRole === 'admin' && currentRole !== 'admin') {
      const confirmAdmin = window.confirm(`Bạn có chắc chắn muốn nâng cấp người dùng ${users.find(u => u._id === userId)?.username} lên vai trò ADMIN?`);
      if (!confirmAdmin) return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        showToast('Cập nhật vai trò thành công!', 'success');
        fetchUsers();
      } else {
        const errorData = await response.json();
        showToast(errorData.errors?.join(', ') || 'Lỗi khi cập nhật vai trò', 'error');
      }
    } catch (error) {
      console.error('Network error updating role:', error);
      showToast('Lỗi kết nối khi cập nhật vai trò', 'error');
    }
  };

  const handleDeleteUser = async (userId: string, username: string) => {
    if (currentUser?._id === userId) {
      showToast('Không thể xóa chính mình!', 'error');
      return;
    }
    const userToDelete = users.find(u => u._id === userId);
    if (userToDelete?.role === 'admin') {
      showToast('Không thể xóa admin khác!', 'error');
      return;
    }

    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa người dùng ${username} không?`);
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        showToast('Xóa người dùng thành công!', 'success');
        fetchUsers();
      } else {
        const errorData = await response.json();
        showToast(errorData.errors?.join(', ') || 'Lỗi khi xóa người dùng', 'error');
      }
    } catch (error) {
      console.error('Network error deleting user:', error);
      showToast('Lỗi kết nối khi xóa người dùng', 'error');
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'user': return 'bg-blue-100 text-blue-800';
      case 'banned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">👥 Quản lý Người dùng</h1>
                <p className="text-gray-600">Xem và quản lý tất cả người dùng trong hệ thống</p>
              </div>
              <div className="flex items-center space-x-4">
                <AdminNavigation currentPage="user-management" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Tìm kiếm:</label>
                <input
                  type="text"
                  id="search"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700 mb-1">Lọc theo vai trò:</label>
                <select
                  id="roleFilter"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={filterRole}
                  onChange={(e) => {
                    setFilterRole(e.target.value as 'all' | 'user' | 'admin' | 'banned');
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                >
                  <option value="all">Tất cả</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                  <option value="banned">Banned</option>
                </select>
              </div>
              <div>
                <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">Số lượng mỗi trang:</label>
                <select
                  id="limit"
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={pagination.limit}
                  onChange={(e) => {
                    setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }));
                  }}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="20">20</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {isLoading ? (
              <div className="p-6 text-center text-gray-500">Đang tải người dùng...</div>
            ) : users.length === 0 ? (
              <div className="p-6 text-center text-gray-500">Không tìm thấy người dùng nào.</div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người dùng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600">
                                {user.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                          {user.role === 'admin' ? '👑 Admin' : user.role === 'user' ? '👤 User' : '🚫 Banned'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, user.role, e.target.value as 'user' | 'admin' | 'banned')}
                            className="border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            disabled={currentUser?._id === user._id || user.role === 'admin' && currentUser?.role !== 'admin'}
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="banned">Banned</option>
                          </select>
                          <button
                            onClick={() => handleDeleteUser(user._id, user.username)}
                            className="text-red-600 hover:text-red-900 p-2 rounded-full hover:bg-red-100 transition-colors"
                            title="Xóa người dùng"
                            disabled={currentUser?._id === user._id || user.role === 'admin'}
                          >
                            <Icon icon="solar:trash-bin-minimalistic-bold" className="text-lg" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <nav
              className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow"
              aria-label="Pagination"
            >
              <div className="hidden sm:block">
                <p className="text-sm text-gray-700">
                  Hiển thị <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> đến{' '}
                  <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> của{' '}
                  <span className="font-medium">{pagination.total}</span> kết quả
                </p>
              </div>
              <div className="flex-1 flex justify-between sm:justify-end">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tiếp
                </button>
              </div>
            </nav>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
