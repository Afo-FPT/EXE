'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import AdminNavigation from '@/app/components/AdminNavigation';
import ErrorBoundary from '@/components/ErrorBoundary';
import { buildApiUrl } from '@/config/api';

interface ChessPiece {
  _id: string;
  name: string;
  type: 'xe' | 'hậu' | 'mã' | 'tượng' | 'tốt' | 'vua';
  collection: string;
  description: string;
  price: number;
  discountPercent: number;
  stock: number;
  model3D: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ChessPieceManagementPage() {
  const { user, token } = useAuth();
  const [chessPieces, setChessPieces] = useState<ChessPiece[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchChessPieces();
    }
  }, [token]);

  const fetchChessPieces = async () => {
    try {
      console.log('📡 Fetching chess pieces for admin...');
      const response = await fetch(buildApiUrl('/chess-pieces'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Admin chess pieces response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Admin chess pieces fetched successfully:', data);
        setChessPieces(data.chessPieces);
      } else {
        const errorData = await response.json();
        console.error('❌ Error fetching admin chess pieces:', response.status, errorData);
        const errorMessage = errorData.errors?.join(', ') || errorData.message || 'Không thể tải chess pieces';
        alert(`Lỗi khi tải chess pieces: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Network error fetching admin chess pieces:', error);
      alert('Lỗi kết nối khi tải chess pieces! Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setIsLoading(false);
    }
  };

  const deleteChessPiece = async (chessPieceId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa quân cờ này?')) return;

    try {
      console.log('🗑️ Deleting chess piece:', chessPieceId);
      
      const response = await fetch(buildApiUrl(`/chess-pieces/${chessPieceId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Delete chess piece response:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Chess piece deleted successfully:', result);
        console.log('🔄 Refreshing chess pieces list...');
        await fetchChessPieces();
        console.log('✅ Chess pieces list refreshed');
        alert('Đã xóa quân cờ thành công!');
      } else {
        const errorData = await response.json();
        console.error('❌ Error deleting chess piece:', response.status, errorData);
        const errorMessage = errorData.errors?.join(', ') || errorData.message || 'Không thể xóa quân cờ';
        alert(`Lỗi: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Network error deleting chess piece:', error);
      alert('Lỗi kết nối khi xóa quân cờ! Vui lòng kiểm tra kết nối mạng.');
    }
  };

  const toggleChessPieceStatus = async (chessPieceId: string, currentStatus: boolean) => {
    try {
      console.log('🔄 Toggling chess piece status:', chessPieceId, 'from', currentStatus, 'to', !currentStatus);
      
      const response = await fetch(buildApiUrl(`/chess-pieces/${chessPieceId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      console.log('📡 Toggle chess piece status response:', response.status);

      if (response.ok) {
        console.log('✅ Chess piece status toggled successfully');
        fetchChessPieces();
      } else {
        const errorData = await response.json();
        console.error('❌ Error toggling chess piece status:', response.status, errorData);
        const errorMessage = errorData.errors?.join(', ') || errorData.message || 'Không thể cập nhật trạng thái quân cờ';
        alert(`Lỗi: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Network error toggling chess piece status:', error);
      alert('Lỗi kết nối khi cập nhật trạng thái quân cờ! Vui lòng kiểm tra kết nối mạng.');
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'xe': return 'Xe';
      case 'hậu': return 'Hậu';
      case 'mã': return 'Mã';
      case 'tượng': return 'Tượng';
      case 'tốt': return 'Tốt';
      case 'vua': return 'Vua';
      default: return type;
    }
  };

  const calculatePrice = (price: number, discountPercent: number) => {
    return price * (1 - discountPercent / 100);
  };

  if (isLoading) {
    return (
      <ErrorBoundary>
        <ProtectedRoute requiredRole="admin">
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        </ProtectedRoute>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">♟️ Quản lý Quân Cờ</h1>
                <p className="text-gray-600">Quản lý tất cả quân cờ trong hệ thống</p>
              </div>
              <div className="flex items-center space-x-4">
                <AdminNavigation currentPage="chess-piece-management" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng Quân Cờ</p>
                  <p className="text-2xl font-semibold text-gray-900">{chessPieces.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {chessPieces.filter(p => p.isActive).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng Giá Trị</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    ${chessPieces.reduce((total, p) => total + p.price, 0).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng Kho</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {chessPieces.reduce((total, p) => total + p.stock, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Chess Pieces List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Danh sách Quân Cờ</h2>
                  <p className="text-sm text-gray-600">Quản lý tất cả quân cờ trong hệ thống</p>
                </div>
              </div>
            </div>
            
            {chessPieces.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có quân cờ nào</h3>
                  <p className="mt-1 text-sm text-gray-500">Quân cờ sẽ xuất hiện ở đây khi được tạo.</p>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quân Cờ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Collection
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Giá
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kho
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trạng thái
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
                    {chessPieces.map((piece) => (
                      <tr key={piece._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 w-12 h-12">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg flex items-center justify-center">
                                <span className="text-white text-lg">♟️</span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{piece.name}</div>
                              <div className="text-sm text-gray-500">{getTypeText(piece.type)}</div>
                              <div className="text-xs text-gray-400">{piece.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {piece.collection}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {piece.discountPercent > 0 ? (
                              <>
                                <span className="text-sm font-bold text-green-600">
                                  ${calculatePrice(piece.price, piece.discountPercent).toFixed(2)}
                                </span>
                                <span className="text-xs text-gray-500 line-through">
                                  ${piece.price.toFixed(2)}
                                </span>
                                <span className="bg-red-100 text-red-800 text-xs font-medium px-1 py-0.5 rounded-full">
                                  -{piece.discountPercent}%
                                </span>
                              </>
                            ) : (
                              <span className="text-sm font-bold text-gray-900">
                                ${piece.price.toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {piece.stock}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            piece.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {piece.isActive ? '✅ Đang hoạt động' : '❌ Đã tắt'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(piece.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => toggleChessPieceStatus(piece._id, piece.isActive)}
                              className={`${
                                piece.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                              }`}
                              title={piece.isActive ? 'Tắt quân cờ' : 'Bật quân cờ'}
                            >
                              {piece.isActive ? 'Tắt' : 'Bật'}
                            </button>
                            <button
                              onClick={() => deleteChessPiece(piece._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Xóa quân cờ"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
    </ErrorBoundary>
  );
}
