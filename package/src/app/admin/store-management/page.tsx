'use client';
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { useEffect, useState } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import AdminNavigation from '@/app/components/AdminNavigation';
import ErrorBoundary from '@/components/ErrorBoundary';
import { buildApiUrl } from '@/config/api';

interface MysteryBag {
  _id: string;
  name: string;
  collection: {
    _id: string;
    name: string;
  };
  description: string;
  price: number;
  discountPercent: number;
  image: string;
  isActive: boolean;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export default function StoreManagement() {
  const { user, token } = useAuth();
  const [mysteryBags, setMysteryBags] = useState<MysteryBag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBag, setEditingBag] = useState<MysteryBag | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    collection: '',
    description: '',
    price: '',
    discountPercent: '',
    image: '',
    stock: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  useEffect(() => {
    console.log('🔄 useEffect - Fetching mystery bags...');
    const fetchData = async () => {
      try {
        console.log('🌐 Fetching from:', buildApiUrl('/mystery-bags/admin'));
        // Fetch mystery bags
        const bagsResponse = await fetch(buildApiUrl('/mystery-bags/admin'), {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('📡 Response status:', bagsResponse.status);
        console.log('📡 Response ok:', bagsResponse.ok);

        if (bagsResponse.ok) {
          const bagsData = await bagsResponse.json();
          console.log('✅ Mystery bags data received:', bagsData);
          
          // Ensure we have an array and filter out invalid items
          const rawArray = Array.isArray(bagsData) ? bagsData : 
                          Array.isArray(bagsData.data) ? bagsData.data : 
                          Array.isArray(bagsData.bags) ? bagsData.bags : 
                          Array.isArray(bagsData.mysteryBags) ? bagsData.mysteryBags : [];
          
          // Filter out null/undefined items and ensure they have required properties
          const bagsArray = rawArray.filter((item: any) => 
            item && 
            typeof item === 'object' && 
            item._id && 
            item.name
          );
          
          console.log('📦 Raw array length:', rawArray.length);
          console.log('📦 Filtered array length:', bagsArray.length);
          console.log('🔍 First valid item:', bagsArray[0]);
          setMysteryBags(bagsArray);
        } else {
          console.error('❌ Error fetching mystery bags:', bagsResponse.status);
          setMysteryBags([]); // Set empty array on error
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setMysteryBags([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingBag 
        ? buildApiUrl(`/mystery-bags/admin/${editingBag._id}`)
        : buildApiUrl('/mystery-bags');
      
      const method = editingBag ? 'PUT' : 'POST';
      
      // Tạo FormData để upload file
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('collection', formData.collection);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('discountPercent', formData.discountPercent);
      formDataToSend.append('stock', formData.stock);
      
      // Chỉ thêm file nếu có file mới được chọn
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }
      
      console.log('FormData contents:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(key, ':', value);
      }
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          // Không set Content-Type, để browser tự động set với boundary
        },
        body: formDataToSend,
      });

      if (response.ok) {
        const result = await response.json();
        if (editingBag) {
          setMysteryBags(bags => bags.map(bag => 
            bag._id === editingBag._id ? result.data : bag
          ));
        } else {
          setMysteryBags(bags => {
            const currentBags = Array.isArray(bags) ? bags : [];
            const newItem = result.data;
            // Only add if the new item is valid
            if (newItem && newItem._id && newItem.name) {
              return [...currentBags, newItem];
            }
            console.warn('⚠️ Invalid new item:', newItem);
            return currentBags;
          });
        }
        resetForm();
        alert(editingBag ? 'Cập nhật thành công!' : 'Tạo sản phẩm thành công!');
        
        // Refresh data after successful creation/update
        if (!editingBag) {
          // Refresh the page to show new data
          window.location.reload();
        }
      } else {
        console.error('Response status:', response.status);
        console.error('Response statusText:', response.statusText);
        
        let errorMessage = 'Có lỗi xảy ra';
        try {
          const errorData = await response.json();
          console.error('Error response data:', errorData);
          errorMessage = errorData.errors?.join(', ') || errorData.message || 'Không xác định';
        } catch (parseError) {
          console.error('Error parsing response:', parseError);
          const responseText = await response.text();
          console.error('Response text:', responseText);
          errorMessage = `Lỗi ${response.status}: ${response.statusText}`;
        }
        
        alert('Có lỗi xảy ra: ' + errorMessage);
      }
    } catch (error) {
      console.error('Error saving mystery bag:', error);
      alert('Có lỗi xảy ra khi lưu sản phẩm');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      collection: '',
      description: '',
      price: '',
      discountPercent: '',
      image: '',
      stock: ''
    });
    setSelectedFile(null);
    setImagePreview('');
    setShowCreateForm(false);
    setEditingBag(null);
  };

  const handleEdit = (bag: MysteryBag) => {
    setFormData({
      name: bag.name || '',
      collection: bag.collection?.name || '',
      description: bag.description || '',
      price: (bag.price || 0).toString(),
      discountPercent: (bag.discountPercent || 0).toString(),
      image: bag.image || '',
      stock: (bag.stock || 0).toString()
    });
    setSelectedFile(null);
    setImagePreview(bag.image || '');
    setEditingBag(bag);
    setShowCreateForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa túi mù này?')) return;
    
    try {
      console.log('🗑️ Deleting mystery bag with ID:', id);
      console.log('🌐 DELETE URL:', buildApiUrl(`/mystery-bags/admin/${id}`));
      
      const response = await fetch(buildApiUrl(`/mystery-bags/admin/${id}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Delete response status:', response.status);
      console.log('📡 Delete response ok:', response.ok);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Delete result:', result);
        
        setMysteryBags(bags => {
          const currentBags = Array.isArray(bags) ? bags : [];
          return currentBags.filter(bag => bag && bag._id !== id);
        });
        
        alert('Xóa túi mù thành công!');
      } else {
        console.error('❌ Delete failed:', response.status);
        alert('Có lỗi xảy ra khi xóa túi mù');
      }
    } catch (error) {
      console.error('❌ Error deleting mystery bag:', error);
      alert('Có lỗi xảy ra khi xóa túi mù');
    }
  };

  const toggleActive = async (bag: MysteryBag) => {
    try {
      const response = await fetch(buildApiUrl(`/mystery-bags/${bag._id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...bag, isActive: !bag.isActive }),
      });

      if (response.ok) {
        const result = await response.json();
        setMysteryBags(bags => {
          const currentBags = Array.isArray(bags) ? bags : [];
          return currentBags.map(b => {
            if (b && b._id === bag._id && (result.bag || result.data)) {
              return result.bag || result.data;
            }
            return b;
          }).filter(item => item && item._id); // Filter out invalid items
        });
      }
    } catch (error) {
      console.error('Error updating mystery bag:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Tạo preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
          </div>
        </div>
      </ProtectedRoute>
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
                <h1 className="text-3xl font-bold text-gray-900">🛍️ Quản lý Cửa hàng</h1>
                <p className="text-gray-600">Quản lý sản phẩm túi mù</p>
              </div>
              <div className="flex items-center space-x-4">
                <AdminNavigation currentPage="store-management" />
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  + Thêm túi mù
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Create/Edit Form */}
          {showCreateForm && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                {editingBag ? 'Chỉnh sửa túi mù' : 'Thêm túi mù mới'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên túi mù
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên bộ sưu tập
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập tên bộ sưu tập (ví dụ: Bộ cờ vua cổ điển)"
                      value={formData.collection}
                      onChange={(e) => setFormData({...formData, collection: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Bộ sưu tập sẽ được tạo tự động nếu chưa tồn tại
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Giá (VNĐ)
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      % Giảm giá
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discountPercent}
                      onChange={(e) => setFormData({...formData, discountPercent: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Số lượng tồn kho
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hình ảnh sản phẩm
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      required={!editingBag}
                      onChange={handleFileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {imagePreview && (
                      <div className="mt-2">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-32 h-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingBag ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mystery Bags Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Danh sách túi mù</h2>
              <p className="text-sm text-gray-600">Quản lý tất cả sản phẩm túi mù</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bộ sưu tập
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Giảm giá
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tồn kho
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(mysteryBags) && mysteryBags.length > 0 ? (
                    mysteryBags.filter(bag => bag && bag._id).map((bag) => (
                      <tr key={bag._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12">
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={bag.image ? bag.image : '/images/404.svg'}
                                alt={bag.name || 'Mystery Bag'}
                                onError={(e) => {
                                  e.currentTarget.src = '/images/404.svg';
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{bag.name || 'Unnamed'}</div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {bag.description || 'No description'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{bag.collection?.name || 'No Collection'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {(bag.price || 0).toLocaleString('vi-VN')} VNĐ
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {(bag.discountPercent || 0) > 0 ? `${bag.discountPercent}%` : 'Không'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{bag.stock || 0}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            (bag.isActive ?? true)
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {(bag.isActive ?? true) ? 'Hoạt động' : 'Tạm dừng'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(bag)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => toggleActive(bag)}
                              className={`${
                                bag.isActive 
                                  ? 'text-orange-600 hover:text-orange-900' 
                                  : 'text-green-600 hover:text-green-900'
                              }`}
                            >
                              {bag.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                            </button>
                            <button
                              onClick={() => handleDelete(bag._id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <div className="text-gray-500">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có túi mù nào</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            Hãy tạo túi mù đầu tiên để bắt đầu bán hàng.
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
    </ErrorBoundary>
  );
}
