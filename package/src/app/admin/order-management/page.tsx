'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import AdminNavigation from '@/app/components/AdminNavigation';
import { buildApiUrl } from '@/config/api';

interface Order {
  _id: string;
  orderNumber: string;
  customer: {
    userId: string;
    fullName: string;
    email: string;
    phone: string;
  };
  shipping: {
    address: string;
    city: string;
    district: string;
    ward: string;
  };
  payment: {
    method: string;
    amount: number;
    status: string;
    paidAt?: string;
    transactionId?: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    discountPercent: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  totalItems: number;
  totalDiscount: number;
  finalAmount: number;
  status: string;
  notes?: string;
  adminNotes?: string;
  shippingInfo?: {
    trackingNumber?: string;
    shippingCompany?: string;
    estimatedDelivery?: string;
  };
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

interface OrderStatistics {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  confirmedOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  recentOrders: number;
  monthlyRevenue: number;
}

export default function OrderManagement() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [statistics, setStatistics] = useState<OrderStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    paymentMethod: '',
    search: '',
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchOrders();
      fetchStatistics();
    }
  }, [user, currentPage, filters]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filters.status && { status: filters.status }),
        ...(filters.paymentStatus && { paymentStatus: filters.paymentStatus }),
        ...(filters.paymentMethod && { paymentMethod: filters.paymentMethod }),
        ...(filters.search && { search: filters.search }),
      });

      const response = await fetch(`${buildApiUrl('/orders')}?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📦 Orders API response:', data);
        setOrders(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } else {
        console.error('❌ Orders API error:', response.status, response.statusText);
        setOrders([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(buildApiUrl('/orders/statistics'), {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStatistics(data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string, adminNotes: string = '') => {
    try {
      const response = await fetch(buildApiUrl(`/orders/${orderId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Order status updated:', result);
        fetchOrders(); // Refresh orders
        alert('✅ Cập nhật trạng thái đơn hàng thành công!');
      } else {
        const errorData = await response.json();
        console.error('❌ Order status update failed:', errorData);
        alert(`❌ Lỗi: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái đơn hàng');
    }
  };

  const updatePaymentStatus = async (orderId: string, paymentStatus: string, transactionId: string = '') => {
    try {
      const response = await fetch(buildApiUrl(`/orders/${orderId}/payment`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          paymentStatus,
          transactionId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Payment status updated:', result);
        fetchOrders(); // Refresh orders
        alert('✅ Cập nhật trạng thái thanh toán thành công!');
      } else {
        const errorData = await response.json();
        console.error('❌ Payment status update failed:', errorData);
        alert(`❌ Lỗi: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating payment status:', error);
      alert('Có lỗi xảy ra khi cập nhật trạng thái thanh toán');
    }
  };

  const markCODPaid = async (orderId: string) => {
    if (!window.confirm('Xác nhận đã nhận thanh toán COD cho đơn hàng này?')) {
      return;
    }
    
    try {
      const response = await fetch(buildApiUrl(`/orders/${orderId}/payment`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          paymentStatus: 'paid',
          transactionId: `COD-${Date.now()}`, // Generate COD transaction ID
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ COD payment updated:', result);
        fetchOrders(); // Refresh orders
        alert('✅ Đã cập nhật trạng thái thanh toán COD thành công!');
      } else {
        const errorData = await response.json();
        console.error('❌ COD payment update failed:', errorData);
        alert(`❌ Lỗi: ${errorData.message}`);
      }
    } catch (error) {
      console.error('Error updating COD payment status:', error);
      alert('❌ Có lỗi xảy ra khi cập nhật trạng thái thanh toán COD');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'shipped': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">🔒 Không có quyền truy cập</h1>
          <p className="text-gray-600 mb-6">Bạn cần quyền admin để truy cập trang này</p>
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📦 Quản lý đơn hàng</h1>
              <p className="text-gray-600">Theo dõi và quản lý tất cả đơn hàng</p>
            </div>
            <AdminNavigation currentPage="order-management" />
          </div>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng đơn hàng</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.totalOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Doanh thu tháng</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {statistics.monthlyRevenue.toLocaleString('vi-VN')} VNĐ
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Chờ xử lý</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.pendingOrders}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Đã giao</p>
                  <p className="text-2xl font-bold text-gray-900">{statistics.deliveredOrders}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Bộ lọc</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái đơn hàng</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ xử lý</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="processing">Đang xử lý</option>
                <option value="shipped">Đã giao hàng</option>
                <option value="delivered">Đã nhận hàng</option>
                <option value="cancelled">Đã hủy</option>
                <option value="refunded">Đã hoàn tiền</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Trạng thái thanh toán</label>
              <select
                value={filters.paymentStatus}
                onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ thanh toán</option>
                <option value="paid">Đã thanh toán</option>
                <option value="failed">Thanh toán thất bại</option>
                <option value="refunded">Đã hoàn tiền</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phương thức thanh toán</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả</option>
                <option value="cod">COD (Thanh toán khi nhận hàng)</option>
                <option value="bank_transfer">Chuyển khoản ngân hàng</option>
                <option value="momo">Ví điện tử MoMo</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Tên, email, số điện thoại..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Danh sách đơn hàng</h2>
          </div>
          
          {!orders || orders.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Không có đơn hàng nào</h3>
                <p className="mt-1 text-sm text-gray-500">Chưa có đơn hàng nào được tạo.</p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Đơn hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Khách hàng
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sản phẩm
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tổng tiền
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thanh toán
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
                  {orders && orders.length > 0 && orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order._id.slice(-8).toUpperCase()}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.totalItems} sản phẩm
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customer.fullName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {order.customer.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {order.items.slice(0, 2).map((item, index) => (
                            <div key={index} className="flex items-center space-x-2">
                              <img
                                className="w-8 h-8 object-cover rounded"
                                src={`${buildApiUrl('')}${item.productImage}`}
                                alt={item.productName}
                                onError={(e) => {
                                  e.currentTarget.src = '/images/404.svg';
                                }}
                              />
                              <span className="text-sm text-gray-900">
                                {item.productName} x{item.quantity}
                              </span>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <span className="text-sm text-gray-500">
                              +{order.items.length - 2} sản phẩm khác
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.finalAmount.toLocaleString('vi-VN')} VNĐ
                        </div>
                        {order.totalDiscount > 0 && (
                          <div className="text-sm text-red-600">
                            -{order.totalDiscount.toLocaleString('vi-VN')} VNĐ
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {order.status === 'pending' && 'Chờ xử lý'}
                          {order.status === 'confirmed' && 'Đã xác nhận'}
                          {order.status === 'processing' && 'Đang xử lý'}
                          {order.status === 'shipped' && 'Đã giao hàng'}
                          {order.status === 'delivered' && 'Đã nhận hàng'}
                          {order.status === 'cancelled' && 'Đã hủy'}
                          {order.status === 'refunded' && 'Đã hoàn tiền'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.payment.status)}`}>
                          {order.payment.status === 'pending' && 'Chờ thanh toán'}
                          {order.payment.status === 'paid' && 'Đã thanh toán'}
                          {order.payment.status === 'failed' && 'Thất bại'}
                          {order.payment.status === 'refunded' && 'Đã hoàn tiền'}
                        </span>
                        {order.payment.method && (
                          <div className="text-xs text-gray-500 mt-1">
                            {order.payment.method === 'cod' && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-medium">
                                💰 COD
                              </span>
                            )}
                            {order.payment.method === 'bank_transfer' && 'Chuyển khoản'}
                            {order.payment.method === 'momo' && 'MoMo'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateOrderStatus(order._id, 'confirmed')}
                            className="text-blue-600 hover:text-blue-900"
                            title="Xác nhận đơn hàng"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order._id, 'shipped')}
                            className="text-green-600 hover:text-green-900"
                            title="Đánh dấu đã giao hàng"
                          >
                            🚚
                          </button>
                          {/* COD Payment Button - Only show for COD orders with pending payment */}
                          {order.payment.method === 'cod' && order.payment.status === 'pending' && (
                            <button
                              onClick={() => markCODPaid(order._id)}
                              className="text-orange-600 hover:text-orange-900"
                              title="Đánh dấu đã thanh toán COD"
                            >
                              💰
                            </button>
                          )}
                          <button
                            onClick={() => updateOrderStatus(order._id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                            title="Hủy đơn hàng"
                          >
                            ✕
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Trang {currentPage} / {totalPages}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Trước
                  </button>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sau
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
