'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { buildApiUrl } from '@/config/api';

interface ChessPiece {
  _id: string;
  name: string;
  type: string;
  rarity: string;
  image: string;
  description: string;
  stats: {
    attack: number;
    defense: number;
    speed: number;
  };
  dropRate: number;
}

interface Collection {
  _id: string;
  name: string;
  description: string;
  coverImage: string;
  theme: string;
  totalChessPieces: number;
  rarityDistribution: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
  releaseDate: string;
}

interface WonItem {
  chessPiece: {
    _id: string;
    name: string;
    type: string;
    rarity: string;
    image: string;
    description: string;
    stats: {
      attack: number;
      defense: number;
      speed: number;
    };
  };
  banner: {
    _id: string;
    name: string;
    theme: string;
  };
  obtainedAt: string;
  level: number;
  experience: number;
}

interface InventoryStats {
  totalItems: number;
  boxesOpened: number;
  lastOpenedBox: string | null;
}

export default function MysteryBoxPage() {
  const { user, token } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOpeningBox, setIsOpeningBox] = useState(false);
  const [wonItem, setWonItem] = useState<WonItem | null>(null);
  const [showWonModal, setShowWonModal] = useState(false);
  const [inventoryStats, setInventoryStats] = useState<InventoryStats | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Fetch collections từ API
  useEffect(() => {
    checkBackendHealth();
  }, []);

  // Fetch inventory stats chỉ khi user đã đăng nhập
  useEffect(() => {
    if (user && token) {
      fetchInventoryStats();
    }
  }, [user, token]);

  const checkBackendHealth = async () => {
    try {
      console.log('🏥 Checking backend health...');
      const response = await fetch('https://exe-backend.fly.dev/health');
      
      if (response.ok) {
        console.log('✅ Backend is healthy');
        fetchCollections(); // Chỉ fetch banners khi backend healthy
      } else {
        console.error('❌ Backend health check failed:', response.status);
        setBackendError('Backend không phản hồi. Vui lòng kiểm tra backend!');
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Cannot connect to backend:', error);
      setBackendError('Không thể kết nối đến backend. Vui lòng kiểm tra backend!');
      setLoading(false);
    }
  };

  const fetchCollections = async () => {
    try {
      setBackendError(null); // Reset error state
      console.log('📡 Fetching active collections...');
      const response = await fetch(buildApiUrl('/collections/active'));
      console.log('📡 Collections response status:', response.status);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('✅ Collections fetched successfully:', data);
          
          if (data.success && data.collections) {
            console.log('📊 Raw collections data:', data.collections);
            console.log('📊 Number of collections:', data.collections.length);
            
            // Debug từng collection
            data.collections.forEach((collection: any, index: number) => {
              console.log(`📋 Collection ${index + 1}:`, {
                name: collection.name,
                coverImage: collection.coverImage,
                theme: collection.theme,
                isActive: collection.isActive,
                totalChessPieces: collection.totalChessPieces
              });
            });
            
            setCollections(data.collections);
          } else {
            console.error('❌ Invalid response format:', data);
            setBackendError('Server trả về dữ liệu không đúng định dạng. Vui lòng kiểm tra backend!');
          }
        } else {
          console.error('❌ Response is not JSON:', contentType);
          const responseText = await response.text();
          console.error('❌ Response text:', responseText);
          setBackendError('Server trả về dữ liệu không đúng định dạng. Vui lòng kiểm tra backend!');
        }
      } else {
        try {
          const errorData = await response.json();
          console.error('❌ Error fetching collections:', response.status, errorData);
          const errorMessage = errorData.errors?.[0] || errorData.message || 'Không thể tải collections';
          setBackendError(`Lỗi khi tải collections: ${errorMessage}`);
        } catch (parseError) {
          console.error('❌ Cannot parse error response:', parseError);
          const responseText = await response.text();
          console.error('❌ Response text:', responseText);
          setBackendError(`Lỗi khi tải collections: HTTP ${response.status}`);
        }
      }
    } catch (error) {
      console.error('❌ Network error fetching collections:', error);
      setBackendError('Lỗi kết nối khi tải collections! Vui lòng kiểm tra kết nối mạng và backend.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryStats = async () => {
    try {
      console.log('📡 Fetching inventory stats...');
      const response = await fetch(buildApiUrl('/mystery-box/inventory/stats'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 Inventory stats response status:', response.status);
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('✅ Inventory stats fetched successfully:', data);
          setInventoryStats({
            totalItems: data.totalItems,
            boxesOpened: data.boxesOpened,
            lastOpenedBox: data.lastOpenedBox
          });
        } else {
          console.error('❌ Inventory stats response is not JSON:', contentType);
          // Không hiển thị alert cho inventory stats vì không quan trọng lắm
        }
      } else {
        try {
          const errorData = await response.json();
          console.error('❌ Error fetching inventory stats:', response.status, errorData);
          // Không hiển thị alert cho inventory stats vì không quan trọng lắm
        } catch (parseError) {
          console.error('❌ Cannot parse inventory stats error response:', parseError);
          // Không hiển thị alert cho inventory stats vì không quan trọng lắm
        }
      }
    } catch (error) {
      console.error('❌ Network error fetching inventory stats:', error);
      // Không hiển thị alert cho inventory stats vì không quan trọng lắm
    }
  };

  const openMysteryBox = async (collectionId: string) => {
    if (!user || !token) {
      alert('Vui lòng đăng nhập để mở hộp!');
      return;
    }

    setIsOpeningBox(true);
    try {
      console.log('🎁 Opening mystery box for collection:', collectionId);
      console.log('🔑 Using token:', token ? 'Valid token' : 'No token');
      
      const response = await fetch(buildApiUrl(`/mystery-box/open/${collectionId}`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('✅ Mystery box opened successfully:', data);
          setWonItem(data.wonItem);
          setShowWonModal(true);
          setInventoryStats(data.inventoryStats);
        } else {
          console.error('❌ Response is not JSON:', contentType);
          const responseText = await response.text();
          console.error('❌ Response text:', responseText);
          alert('Lỗi: Server trả về dữ liệu không đúng định dạng. Vui lòng kiểm tra backend!');
        }
      } else {
        try {
          const errorData = await response.json();
          console.error('❌ Error response:', errorData);
          const errorMessage = errorData.errors?.[0] || errorData.message || 'Lỗi khi mở hộp!';
          alert(`Lỗi: ${errorMessage}`);
        } catch (parseError) {
          console.error('❌ Cannot parse error response:', parseError);
          const responseText = await response.text();
          console.error('❌ Response text:', responseText);
          alert(`Lỗi khi mở hộp: HTTP ${response.status}`);
        }
      }
    } catch (error) {
      console.error('❌ Network error opening mystery box:', error);
      alert('Lỗi kết nối khi mở hộp! Vui lòng kiểm tra kết nối mạng và backend.');
    } finally {
      setIsOpeningBox(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Thường';
      case 'rare': return 'Hiếm';
      case 'epic': return 'Epic';
      case 'legendary': return 'Huyền thoại';
      default: return rarity;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang kiểm tra backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">🎁 Mystery Box</h1>
              <p className="mt-2 text-gray-600">Mở hộp để nhận quân cờ độc đáo!</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
              >
                🏠 Trang chủ
              </Link>
              {inventoryStats && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Tổng items: <span className="font-semibold">{inventoryStats.totalItems}</span></p>
                  <p className="text-sm text-gray-600">Hộp đã mở: <span className="font-semibold">{inventoryStats.boxesOpened}</span></p>
                </div>
              )}
              <Link 
                href="/inventory"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                📦 Inventory
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {backendError ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-red-900 mb-2">Lỗi kết nối backend</h3>
            <p className="text-gray-600 mb-4">{backendError}</p>
            <button
              onClick={checkBackendHealth}
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              🔄 Thử lại
            </button>
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có banner nào</h3>
            <p className="text-gray-600 mb-4">Admin cần tạo banner và thêm quân cờ trước</p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>• Tạo banner mới trong admin panel</p>
              <p>• Thêm quân cờ vào banner</p>
              <p>• Kích hoạt banner để người dùng có thể mở hộp</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((banner) => {
              // Tạo URL ảnh đúng cách
              let imageUrl = banner.coverImage;
              
              // Kiểm tra nếu là placeholder URL thì không thêm localhost
              if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.includes('placeholder')) {
                imageUrl = `https://exe-backend.fly.dev${imageUrl}`;
              }
              
              console.log('🖼️ Banner:', banner.name);
              console.log('📷 CoverImage path:', banner.coverImage);
              console.log('🌐 Full URL:', imageUrl);
              return (
              <div key={banner._id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* Banner Cover - Simplified */}
                <div className="relative h-48 overflow-hidden bg-gray-200">
                  {/* Main Image */}
                  <img
                    src={imageUrl}
                    alt={banner.name}
                    className="w-full h-full object-cover"
                    onLoad={(e) => {
                      console.log('✅ Image loaded successfully:', imageUrl);
                      // Hide fallback when image loads
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) {
                        (fallback as HTMLElement).style.display = 'none';
                      }
                    }}
                    onError={(e) => {
                      console.error('❌ Image failed to load:', imageUrl);
                      console.error('Banner coverImage:', banner.coverImage);
                      // Hide image and show fallback
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling;
                      if (fallback) {
                        (fallback as HTMLElement).style.display = 'block';
                      }
                    }}
                  />
                  
                  {/* Fallback Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-400">
                    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <div className="text-4xl mb-2">🎁</div>
                        <div className="text-lg font-bold">{banner.name}</div>
                        <div className="text-sm opacity-90">{banner.theme}</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Banner Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4">
                    <h3 className="text-white text-lg font-bold mb-1">{banner.name}</h3>
                    <p className="text-white/90 text-sm">{banner.theme}</p>
                  </div>
                  
                  {/* Debug Info */}
                  <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    {banner.coverImage ? 'Has Image' : 'No Image'}
                  </div>
                  <div className="absolute top-2 left-2 bg-blue-500/70 text-white text-xs px-2 py-1 rounded max-w-32 truncate">
                    {imageUrl.split('/').pop()}
                  </div>
                  
                  {/* Test Link */}
                  <div className="absolute top-12 right-2 bg-green-500/70 text-white text-xs px-2 py-1 rounded">
                    <a href={imageUrl} target="_blank" rel="noopener noreferrer" className="text-white hover:underline">
                      Test URL
                    </a>
                  </div>
                </div>

                {/* Banner Info */}
                <div className="p-6">
                  <p className="text-gray-600 mb-4">{banner.description || 'Không có mô tả'}</p>
                  
                  {/* Chess Pieces Preview */}
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Quân cờ có thể nhận:</h4>
                    <div className="flex flex-wrap gap-2">
                      <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                        <span className="text-xs">Tổng: {banner.totalChessPieces || 0}</span>
                      </div>
                      {banner.totalChessPieces === 0 ? (
                        <div className="flex items-center space-x-1 bg-red-100 px-2 py-1 rounded-full">
                          <span className="text-xs text-red-600">Chưa có quân cờ</span>
                        </div>
                      ) : (
                        <>
                          {banner.rarityDistribution?.common > 0 && (
                            <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
                              <span className="text-xs text-gray-600">Thường: {banner.rarityDistribution.common}</span>
                            </div>
                          )}
                          {banner.rarityDistribution?.rare > 0 && (
                            <div className="flex items-center space-x-1 bg-blue-100 px-2 py-1 rounded-full">
                              <span className="text-xs text-blue-600">Hiếm: {banner.rarityDistribution.rare}</span>
                            </div>
                          )}
                          {banner.rarityDistribution?.epic > 0 && (
                            <div className="flex items-center space-x-1 bg-purple-100 px-2 py-1 rounded-full">
                              <span className="text-xs text-purple-600">Epic: {banner.rarityDistribution.epic}</span>
                            </div>
                          )}
                          {banner.rarityDistribution?.legendary > 0 && (
                            <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                              <span className="text-xs text-yellow-600">Huyền thoại: {banner.rarityDistribution.legendary}</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Open Box Button */}
                  <button
                    onClick={() => openMysteryBox(banner._id)}
                    disabled={isOpeningBox || banner.totalChessPieces === 0}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                      isOpeningBox || banner.totalChessPieces === 0
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white hover:shadow-lg'
                    }`}
                  >
                    {isOpeningBox ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Đang mở hộp...
                      </span>
                    ) : banner.totalChessPieces === 0 ? (
                      <span className="flex items-center justify-center">
                        ❌ Không thể mở hộp
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        🎁 Mở hộp
                      </span>
                    )}
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Won Item Modal */}
      {showWonModal && wonItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Chúc mừng!</h3>
            <p className="text-gray-600 mb-4">Bạn đã nhận được:</p>
            
            {/* Won Item Display */}
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 mb-4">
              <div className="text-2xl mb-2">{wonItem.chessPiece.type}</div>
              <div className={`text-lg font-bold mb-1 ${getRarityColor(wonItem.chessPiece.rarity)}`}>
                {wonItem.chessPiece.name}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {getRarityText(wonItem.chessPiece.rarity)}
              </div>
              <div className="text-xs text-gray-500 mb-2">
                Từ banner: {wonItem.banner.name}
              </div>
              <div className="text-xs text-gray-500">
                Level: {wonItem.level} | Exp: {wonItem.experience}
              </div>
            </div>

            <button
              onClick={() => setShowWonModal(false)}
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Tuyệt vời!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

