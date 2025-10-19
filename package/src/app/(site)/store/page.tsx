'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Link from 'next/link';
import { buildApiUrl } from '@/config/api';

interface Collection {
  _id: string;
  name: string;
}

interface MysteryBag {
  _id: string;
  name: string;
  collection: Collection;
  description: string;
  price: number;
  discountPercent: number;
  image: string;
  isActive: boolean;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export default function Store() {
  const { user } = useAuth();
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const [mysteryBags, setMysteryBags] = useState<MysteryBag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch mystery bags
        const bagsResponse = await fetch(buildApiUrl('/mystery-bags/public'));
        console.log('🔍 Bags response status:', bagsResponse.status);
        console.log('🔍 Bags response ok:', bagsResponse.ok);
        
        if (bagsResponse.ok) {
          const bagsData = await bagsResponse.json();
          console.log('📦 Mystery bags data:', bagsData);
          console.log('📦 Mystery bags data.data:', bagsData.data);
          setMysteryBags(bagsData.data || []);
        } else {
          console.error('❌ Failed to fetch mystery bags:', bagsResponse.status);
          const errorText = await bagsResponse.text();
          console.error('❌ Error response:', errorText);
        }

        // Fetch collections for filter
        const collectionsResponse = await fetch(buildApiUrl('/collections/public'));
        console.log('🔍 Collections response status:', collectionsResponse.status);
        console.log('🔍 Collections response ok:', collectionsResponse.ok);
        
        if (collectionsResponse.ok) {
          const collectionsData = await collectionsResponse.json();
          console.log('📚 Collections data:', collectionsData);
          console.log('📚 Collections data.data:', collectionsData.data);
          setCollections(collectionsData.data || []);
        } else {
          console.error('❌ Failed to fetch collections:', collectionsResponse.status);
          const errorText = await collectionsResponse.text();
          console.error('❌ Error response:', errorText);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredBags = selectedCollection 
    ? mysteryBags.filter(bag => bag.collection && bag.collection._id === selectedCollection)
    : mysteryBags;

  console.log('🔍 Mystery bags:', mysteryBags);
  console.log('🔍 Filtered bags:', filteredBags);
  console.log('🔍 Selected collection:', selectedCollection);

  const calculateDiscountedPrice = (price: number, discountPercent: number) => {
    return price * (1 - discountPercent / 100);
  };

  const handleBuyClick = (bag: MysteryBag) => {
    if (!user) {
      alert('Vui lòng đăng nhập để mua hàng!');
      return;
    }
    
    if (bag.stock === 0) {
      alert('Sản phẩm đã hết hàng!');
      return;
    }
    
    addToCart(bag, 1);
    alert(`Đã thêm "${bag.name}" vào giỏ hàng!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải cửa hàng...</p>
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
              <h1 className="text-3xl font-bold text-gray-900"> Cửa hàng</h1>
              <p className="text-gray-600">Khám phá các túi mù độc đáo</p>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <span className="text-sm text-gray-500">
                  Xin chào, <span className="font-medium text-gray-900">{user.username}</span>
                </span>
              ) : (
                <Link
                  href="/signin"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  Đăng nhập
                </Link>
              )}
              <Link
                href="/"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Lọc theo bộ sưu tập</h2>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCollection('')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition duration-200 ${
                selectedCollection === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tất cả
            </button>
            {Array.isArray(collections) && collections.map(collection => (
              <button
                key={collection._id}
                onClick={() => setSelectedCollection(collection._id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition duration-200 ${
                  selectedCollection === collection._id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {collection.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.isArray(filteredBags) && filteredBags.length > 0 ? (
            filteredBags.map((bag) => {
              const discountedPrice = calculateDiscountedPrice(bag.price, bag.discountPercent);
              return (
                <div key={bag._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300">
                  <div className="aspect-w-16 aspect-h-12">
                    <img
                      className="w-full h-48 object-cover"
                      src={`${bag.image}`}
                      alt={bag.name}
                      onLoad={() => console.log('✅ Image loaded successfully:', `${bag.image}`)}
                      onError={(e) => {
                        console.error('❌ Image failed to load:', `${bag.image}`);
                        e.currentTarget.src = '/images/404.svg';
                      }}
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                        {bag.collection?.name || 'No Collection'}
                      </span>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        bag.stock > 0 
                          ? 'text-green-600 bg-green-100' 
                          : 'text-red-600 bg-red-100'
                      }`}>
                        {bag.stock > 0 ? `Còn ${bag.stock}` : 'Hết hàng'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {bag.name}
                    </h3>
                    
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {bag.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col">
                        {bag.discountPercent > 0 ? (
                          <>
                            <span className="text-lg font-bold text-red-600">
                              {discountedPrice.toLocaleString('vi-VN')} VNĐ
                            </span>
                            <span className="text-sm text-gray-500 line-through">
                              {bag.price.toLocaleString('vi-VN')} VNĐ
                            </span>
                            <span className="text-xs text-red-600 font-medium">
                              -{bag.discountPercent}%
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-bold text-gray-900">
                            {bag.price.toLocaleString('vi-VN')} VNĐ
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleBuyClick(bag)}
                      disabled={bag.stock === 0}
                      className={`w-full py-2 px-4 rounded-lg font-medium transition duration-200 ${
                        bag.stock > 0
                          ? isInCart(bag._id)
                            ? 'bg-green-600 text-white hover:bg-green-700'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {bag.stock > 0 
                        ? isInCart(bag._id)
                          ? `✅ Đã có trong giỏ (${getItemQuantity(bag._id)})`
                          : '🛒 Thêm vào giỏ'
                        : 'Hết hàng'
                      }
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Không có sản phẩm nào</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {selectedCollection 
                    ? 'Không có túi mù nào trong bộ sưu tập này.' 
                    : 'Chưa có túi mù nào được bán.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 rounded-lg p-6">
          <div className="text-center">
            <h3 className="text-lg font-medium text-blue-900 mb-2">
              🎁 Về túi mù
            </h3>
            <p className="text-blue-700 max-w-2xl mx-auto">
              Túi mù là những sản phẩm đặc biệt chứa đựng những quân cờ ngẫu nhiên từ các bộ sưu tập khác nhau. 
              Mỗi túi mù mang đến sự bất ngờ và thú vị khi bạn mở ra để khám phá những quân cờ độc đáo bên trong.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
