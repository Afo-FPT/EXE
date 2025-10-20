'use client';

import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useState } from 'react';
import { buildApiUrl } from '@/config/api';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart } = useCart();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleCheckout = () => {
    if (!user) {
      alert('Vui lòng đăng nhập để thanh toán!');
      return;
    }
    
    if (cart.items.filter(item => item.product).length === 0) {
      alert('Giỏ hàng trống!');
      return;
    }
    
    setIsCheckingOut(true);
    // Redirect to checkout page
    window.location.href = '/checkout';
  };

  if (cart.items.filter(item => item.product).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Empty Cart */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Navigation */}
          <div className="mb-6">
            <Link
              href="/store"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Tiếp tục mua sắm
            </Link>
          </div>
          <div className="text-center py-12">
            <div className="text-gray-500">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Giỏ hàng trống</h3>
              <p className="mt-2 text-gray-500">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
              <div className="mt-6">
                <Link
                  href="/store"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition duration-200 inline-block"
                >
                  🛍️ Mua sắm ngay
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="mb-6 flex justify-between items-center">
          <Link
            href="/store"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Tiếp tục mua sắm
          </Link>
          <button
            onClick={clearCart}
            className="inline-flex items-center text-red-600 hover:text-red-800 transition duration-200"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Xóa tất cả
          </button>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Sản phẩm trong giỏ</h2>
              </div>
              <div className="divide-y divide-gray-200">
                {cart.items.filter(item => item.product).map((item) => {
                  const discountedPrice = item.product.price * (1 - item.product.discountPercent / 100);
                  return (
                    <div key={item.product._id} className="p-6">
                      <div className="flex items-center space-x-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          <img
                            className="w-20 h-20 object-cover rounded-lg"
                            src={`${buildApiUrl('')}${item.product.image}`}
                            alt={item.product.name}
                            onError={(e) => {
                              e.currentTarget.src = '/images/404.svg';
                            }}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {item.product.collection?.name || 'Không có collection'}
                          </p>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {item.product.description || 'Không có mô tả'}
                          </p>
                          
                          {/* Price */}
                          <div className="mt-2">
                            {(item.product.discountPercent || 0) > 0 ? (
                              <div className="flex items-center space-x-2">
                                <span className="text-lg font-bold text-red-600">
                                  {discountedPrice.toLocaleString('vi-VN')} VNĐ
                                </span>
                                <span className="text-sm text-gray-500 line-through">
                                  {(item.product.price || 0).toLocaleString('vi-VN')} VNĐ
                                </span>
                                <span className="text-xs text-red-600 font-medium bg-red-100 px-2 py-1 rounded">
                                  -{item.product.discountPercent || 0}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-gray-900">
                                {(item.product.price || 0).toLocaleString('vi-VN')} VNĐ
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Quantity Controls */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                          >
                            −
                          </button>
                          <span className="w-8 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-600"
                          >
                            +
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.product._id)}
                          className="text-red-600 hover:text-red-800 p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-8">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Tóm tắt đơn hàng</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                {/* Summary Items */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tạm tính ({cart.totalItems} sản phẩm)</span>
                    <span className="text-gray-900">{cart.totalPrice.toLocaleString('vi-VN')} VNĐ</span>
                  </div>
                  
                  {cart.totalDiscount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-red-600">Giảm giá</span>
                      <span className="text-red-600">-{cart.totalDiscount.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Tổng cộng</span>
                      <span className="text-blue-600">{cart.finalPrice.toLocaleString('vi-VN')} VNĐ</span>
                    </div>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckingOut ? 'Đang chuyển hướng...' : '🚀 Thanh toán'}
                </button>

                {/* User Info */}
                {user && (
                  <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                    <p><strong>Khách hàng:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                  </div>
                )}

                {/* Security Note */}
                <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                  <p>🔒 Thanh toán an toàn và bảo mật</p>
                  <p>📦 Giao hàng nhanh chóng</p>
                  <p>🔄 Đổi trả trong 7 ngày</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
