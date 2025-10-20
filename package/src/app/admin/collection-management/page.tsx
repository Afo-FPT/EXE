'use client';

import { useState, useEffect } from 'react';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import AdminNavigation from '@/app/components/AdminNavigation';
import ErrorBoundary from '@/components/ErrorBoundary';
import { buildApiUrl } from '@/config/api';

interface ChessPiece {
  _id: string;
  name: string;
  type: 'xe' | 'hậu' | 'mã' | 'tượng' | 'tốt' | 'vua';
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image: string;
  model3D?: string; // Thêm field model3D
  description: string;
}

interface Collection {
  _id: string;
  name: string;
  description: string;
  coverImage: string;
  theme: string;
  isActive: boolean;
  chessPieces: ChessPiece[];
  createdBy: {
    username: string;
    email: string;
  };
  releaseDate: string;
  endDate?: string;
  createdAt: string;
  totalChessPieces?: number; // Added for total chess pieces
  rarityDistribution?: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
  };
}

export default function CollectionManagementPage() {
  const { user, token } = useAuth();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddPieceForm, setShowAddPieceForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    theme: 'vietnam',
    endDate: '',
    coverImage: ''
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selected3DFile, setSelected3DFile] = useState<File | null>(null);
  const [model3DPreview, setModel3DPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [pieceFormData, setPieceFormData] = useState({
    name: '',
    type: 'xe' as const,
    rarity: 'common' as const,
    description: '',
    dropRate: 10
  });

  useEffect(() => {
    if (token) {
      fetchCollections();
    }
  }, [token]);

  // Xử lý chọn ảnh
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra loại file
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file ảnh!');
        return;
      }
      
      // Kiểm tra kích thước file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB!');
        return;
      }
      
      setSelectedImage(file);
      
      // Tạo preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Xử lý chọn file 3D
  const handle3DFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Kiểm tra loại file 3D
      const allowedExtensions = ['.fbx', '.glb', '.gltf', '.dae'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
      
      if (!allowedExtensions.includes(fileExtension)) {
        alert('Vui lòng chọn file 3D với định dạng: FBX, GLB, GLTF, DAE!');
        return;
      }
      
      // Kiểm tra kích thước file (max 500MB với Vercel Blob)
      if (file.size > 500 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 500MB! Vui lòng chọn file nhỏ hơn.');
        return;
      }
      
      console.log('📁 Selected 3D file:', file.name, 'Size:', (file.size / 1024 / 1024).toFixed(2), 'MB');
      
      setSelected3DFile(file);
      setModel3DPreview(file.name);
    }
  };

  const clear3DFile = () => {
    setSelected3DFile(null);
    setModel3DPreview(null);
  };

  // Xóa ảnh đã chọn
  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  const fetchCollections = async () => {
    try {
      console.log('📡 Fetching collections for admin...');
      const response = await fetch(buildApiUrl('/collections'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Admin collections response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Admin collections fetched successfully:', data);
        setCollections(data.collections);
      } else {
        const errorData = await response.json();
        console.error('❌ Error fetching admin collections:', response.status, errorData);
        const errorMessage = errorData.errors?.join(', ') || errorData.message || 'Không thể tải collections';
        alert(`Lỗi khi tải collections: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Network error fetching admin collections:', error);
      alert('Lỗi kết nối khi tải collections! Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra ảnh bắt buộc
    if (!selectedImage) {
      alert('Vui lòng chọn ảnh collection!');
      return;
    }
    
    try {
      console.log('📝 Creating collection with data:', formData);
      console.log('📷 Selected image:', selectedImage.name);
      
      // Tạo FormData để gửi file
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('theme', formData.theme);
      if (formData.endDate) {
        formDataToSend.append('endDate', formData.endDate);
      }
      formDataToSend.append('coverImage', selectedImage);
      
      console.log('📡 Sending collection data with image...');
      
      const response = await fetch(buildApiUrl('/collections'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Không set Content-Type, để browser tự động set với boundary cho FormData
        },
        body: formDataToSend,
      });

      console.log('📡 Create collection response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Collection created successfully:', data);
        alert('Tạo collection thành công!');
        setShowCreateForm(false);
        setFormData({ name: '', description: '', theme: 'vietnam', endDate: '', coverImage: '' });
        clearImage();
        fetchCollections();
      } else {
        const errorData = await response.json();
        console.error('❌ Error creating collection:', response.status, errorData);
        const errorMessage = errorData.errors?.join(', ') || errorData.message || 'Không thể tạo collection';
        alert(`Lỗi: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Network error creating collection:', error);
      alert('Lỗi kết nối khi tạo collection! Vui lòng kiểm tra kết nối mạng.');
    }
  };

  const handleAddChessPiece = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollection) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      console.log('📝 Adding chess piece with data:', pieceFormData);
      console.log('🎯 Adding to collection:', selectedCollection._id);
      console.log('📁 3D File selected:', selected3DFile?.name);
      
      // Sử dụng FormData để gửi file 3D
      const formData = new FormData();
      formData.append('name', pieceFormData.name);
      formData.append('type', pieceFormData.type);
      formData.append('rarity', pieceFormData.rarity);
      formData.append('description', pieceFormData.description);
      formData.append('dropRate', pieceFormData.dropRate.toString());
      formData.append('image', 'https://via.placeholder.com/100x100?text=Chess+Piece'); // Tạm thời dùng placeholder
      formData.append('collectionId', selectedCollection._id);
      
      // Thêm file 3D nếu có
      if (selected3DFile) {
        formData.append('model3D', selected3DFile);
      }
      
      console.log('📡 Sending chess piece data with FormData');
      console.log('🌐 API endpoint:', buildApiUrl('/chess-pieces'));
      
      // Simulate progress for large files
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 500);
      
      const response = await fetch(buildApiUrl('/chess-pieces'), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Không set Content-Type, để browser tự động set với boundary
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      console.log('📡 Add chess piece response status:', response.status);
      console.log('📡 Response headers:', response.headers);

      if (response.status === 413) {
        alert('File quá lớn! Vercel có giới hạn cứng 4.5MB. Vui lòng chọn file nhỏ hơn 4MB hoặc nén file trước khi upload.');
        return;
      }

      if (response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          console.log('✅ Chess piece added successfully:', data);
          alert('Thêm quân cờ thành công!');
          setShowAddPieceForm(false);
          setPieceFormData({ name: '', type: 'xe', rarity: 'common', description: '', dropRate: 10 });
          clear3DFile(); // Xóa file 3D đã chọn
          fetchCollections();
        } else {
          console.error('❌ Response is not JSON:', contentType);
          alert('Lỗi: Server trả về dữ liệu không đúng định dạng. Vui lòng kiểm tra backend!');
        }
      } else {
        try {
          const errorData = await response.json();
          console.error('❌ Error adding chess piece:', response.status, errorData);
          const errorMessage = errorData.errors?.join(', ') || errorData.message || 'Không thể thêm quân cờ';
          alert(`Lỗi: ${errorMessage}`);
        } catch (parseError) {
          console.error('❌ Cannot parse error response:', parseError);
          alert(`Lỗi khi thêm quân cờ: HTTP ${response.status}`);
        }
      }
    } catch (error) {
      console.error('❌ Network error adding chess piece:', error);
      alert('Lỗi kết nối khi thêm quân cờ! Vui lòng kiểm tra kết nối mạng và backend.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const toggleCollectionStatus = async (collectionId: string, currentStatus: boolean) => {
    try {
      console.log('🔄 Toggling collection status:', collectionId, 'from', currentStatus, 'to', !currentStatus);
      
      const response = await fetch(buildApiUrl(`/collections/${collectionId}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      console.log('📡 Toggle collection status response:', response.status);

      if (response.ok) {
        console.log('✅ Collection status toggled successfully');
        fetchCollections();
      } else {
        const errorData = await response.json();
        console.error('❌ Error toggling collection status:', response.status, errorData);
        const errorMessage = errorData.errors?.join(', ') || errorData.message || 'Không thể cập nhật trạng thái collection';
        alert(`Lỗi: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Network error toggling collection status:', error);
      alert('Lỗi kết nối khi cập nhật trạng thái collection! Vui lòng kiểm tra kết nối mạng.');
    }
  };

  const deleteCollection = async (collectionId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa collection này?')) return;

    try {
      console.log('🗑️ Deleting collection:', collectionId);
      
      const response = await fetch(buildApiUrl(`/collections/${collectionId}`), {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 Delete collection response:', response.status);

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Collection deleted successfully:', result);
        console.log('🔄 Refreshing collections list...');
        await fetchCollections();
        console.log('✅ Collections list refreshed');
        alert('Đã xóa collection thành công!');
      } else {
        const errorData = await response.json();
        console.error('❌ Error deleting collection:', response.status, errorData);
        const errorMessage = errorData.errors?.join(', ') || errorData.message || 'Không thể xóa collection';
        alert(`Lỗi: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Network error deleting collection:', error);
      alert('Lỗi kết nối khi xóa collection! Vui lòng kiểm tra kết nối mạng.');
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
        console.log('🔄 Refreshing collections list...');
        await fetchCollections();
        console.log('✅ Collections list refreshed');
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

  const handleEditCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCollection) return;

    try {
      console.log('✏️ Editing collection with data:', formData);
      console.log('🎯 Editing collection:', selectedCollection._id);
      
      // Sử dụng FormData để gửi file ảnh
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('theme', formData.theme);
      if (formData.endDate) {
        formDataToSend.append('endDate', formData.endDate);
      }
      
      // Thêm ảnh mới nếu có
      if (selectedImage) {
        formDataToSend.append('coverImage', selectedImage);
      } else if (formData.coverImage) {
        // Giữ ảnh cũ nếu không có ảnh mới
        formDataToSend.append('coverImage', formData.coverImage);
      }

      const response = await fetch(buildApiUrl(`/collections/${selectedCollection._id}`), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend,
      });

      console.log('📡 Edit collection response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Collection edited successfully:', data);
        alert('Cập nhật collection thành công!');
        setShowEditForm(false);
        setSelectedCollection(null);
        setFormData({ name: '', description: '', theme: 'vietnam', endDate: '', coverImage: '' });
        clearImage();
        fetchCollections();
      } else {
        const errorData = await response.json();
        console.error('❌ Error editing collection:', response.status, errorData);
        const errorMessage = errorData.errors?.join(', ') || errorData.message || 'Không thể cập nhật collection';
        alert(`Lỗi: ${errorMessage}`);
      }
    } catch (error) {
      console.error('❌ Network error editing collection:', error);
      alert('Lỗi kết nối khi cập nhật collection! Vui lòng kiểm tra kết nối mạng.');
    }
  };

  const openEditForm = (collection: Collection) => {
    setSelectedCollection(collection);
    setFormData({
      name: collection.name,
      description: collection.description,
      theme: collection.theme,
      endDate: collection.endDate || '',
      coverImage: collection.coverImage
    });
    setShowEditForm(true);
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Thường';
      case 'rare': return 'Hiếm';
      case 'epic': return 'Epic';
      case 'legendary': return 'Huyền thoại';
      default: return 'Thường';
    }
  };

  const testAPI = async () => {
    try {
      console.log('🧪 Testing API endpoints...');
      
      // Test health check
      const healthResponse = await fetch(buildApiUrl('/health'));
      console.log('🏥 Health check status:', healthResponse.status);
      
      // Test API health
      const apiHealthResponse = await fetch(buildApiUrl('/api/health'));
      console.log('🔌 API health status:', apiHealthResponse.status);
      
      if (apiHealthResponse.ok) {
        const apiHealthData = await apiHealthResponse.json();
        console.log('✅ API health data:', apiHealthData);
        
        // Test chess-pieces endpoint
        const chessResponse = await fetch(buildApiUrl('/chess-pieces'), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        console.log('♟️ Chess pieces endpoint status:', chessResponse.status);
        
        if (chessResponse.ok) {
          console.log('✅ Chess pieces endpoint is working!');
        } else {
          console.log('❌ Chess pieces endpoint error:', chessResponse.status);
        }
      }
    } catch (error) {
      console.error('❌ API test failed:', error);
    }
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
                <h1 className="text-3xl font-bold text-gray-900">🎴 Quản lý Collection</h1>
                <p className="text-gray-600">Tạo và quản lý collection cho Mystery Box</p>
              </div>
              <div className="flex items-center space-x-4">
                <AdminNavigation currentPage="collection-management" />
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-200"
                >
                  + Tạo Collection Mới
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng Collection</p>
                  <p className="text-2xl font-semibold text-gray-900">{collections.length}</p>
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
                    {collections.filter(b => b.isActive).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Tổng quân cờ</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {collections.reduce((total, b) => total + (b.totalChessPieces || 0), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Collections List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">Danh sách Collection</h2>
                  <p className="text-sm text-gray-600">Quản lý tất cả collection trong hệ thống</p>
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={testAPI}
                    className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    🧪 Test API
                  </button>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="-ml-1 mr-2 h-4 w-4 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Tạo Collection Mới
                  </button>
                </div>
              </div>
            </div>
            
            {collections.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <div className="text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Chưa có collection nào</h3>
                  <p className="mt-1 text-sm text-gray-500">Bắt đầu tạo collection đầu tiên để quản lý Mystery Box.</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreateForm(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg className="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Tạo Collection Đầu Tiên
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Collection
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quân cờ
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
                    {collections.map((collection) => (
                      <tr key={collection._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 aspect-square w-16">
                              <img
                                className="w-16 h-16 rounded-lg object-cover"
                                src={collection.coverImage.startsWith('http') ? collection.coverImage : `/uploads/collections/${collection.coverImage}`}
                                alt={collection.name}
                                onError={(e) => {
                                  // Fallback nếu ảnh không load được
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjMyIiB5PSIzNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjEyIiBmaWxsPSIjNkI3MjgwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5Db2xsZWN0aW9uPC90ZXh0Pgo8L3N2Zz4K';
                                }}
                              />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{collection.name}</div>
                              <div className="text-sm text-gray-500">{collection.description}</div>
                              <div className="text-xs text-gray-400">Chủ đề: {collection.theme}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-wrap gap-2">
                            {(collection.totalChessPieces || 0) > 0 ? (
                              <>
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  Tổng: {collection.totalChessPieces || 0}
                                </span>
                                {(collection.rarityDistribution?.common || 0) > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    Thường: {collection.rarityDistribution?.common || 0}
                                  </span>
                                )}
                                {(collection.rarityDistribution?.rare || 0) > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-600">
                                    Hiếm: {collection.rarityDistribution?.rare || 0}
                                  </span>
                                )}
                                {(collection.rarityDistribution?.epic || 0) > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-600">
                                    Epic: {collection.rarityDistribution?.epic || 0}
                                  </span>
                                )}
                                {(collection.rarityDistribution?.legendary || 0) > 0 && (
                                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-600">
                                    Huyền thoại: {collection.rarityDistribution?.legendary || 0}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-400 text-sm">Chưa có quân cờ</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            collection.isActive 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {collection.isActive ? '✅ Đang hoạt động' : '❌ Đã tắt'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(collection.createdAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => openEditForm(collection)}
                              className="text-green-600 hover:text-green-900"
                              title="Chỉnh sửa collection"
                            >
                              ✏️ Sửa
                            </button>
                            <button
                              onClick={() => {
                                setSelectedCollection(collection);
                                setShowAddPieceForm(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Thêm quân cờ"
                            >
                              + Quân cờ
                            </button>
                            <button
                              onClick={() => toggleCollectionStatus(collection._id, collection.isActive)}
                              className={`${
                                collection.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                              }`}
                              title={collection.isActive ? 'Tắt collection' : 'Bật collection'}
                            >
                              {collection.isActive ? 'Tắt' : 'Bật'}
                            </button>
                            <button
                              onClick={() => deleteCollection(collection._id)}
                              className="text-red-600 hover:text-red-900"
                              title="Xóa collection"
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

        {/* Create Collection Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Tạo Collection Mới</h3>
                <form onSubmit={handleCreateCollection} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên Collection</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ví dụ: Văn Lang"
                    />
                  </div>

                  {/* Upload Ảnh Collection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh Collection *</label>
                    
                    {/* File Input */}
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="collection-image"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Chọn ảnh collection</span>
                            <input
                              id="collection-image"
                              name="collection-image"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageSelect}
                            />
                          </label>
                          <p className="pl-1">hoặc kéo thả vào đây</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF tối đa 5MB
                        </p>
                      </div>
                    </div>

                    {/* Preview Ảnh */}
                    {imagePreview && (
                      <div className="mt-4">
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="aspect-video w-full object-cover rounded-lg border border-gray-300"
                          />
                          <button
                            type="button"
                            onClick={clearImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {selectedImage?.name} ({(selectedImage?.size! / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Mô tả về collection..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chủ đề</label>
                    <select
                      value={formData.theme}
                      onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="vietnam">Việt Nam</option>
                      <option value="ancient">Cổ đại</option>
                      <option value="modern">Hiện đại</option>
                      <option value="fantasy">Kỳ ảo</option>
                    </select>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Tạo Collection
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Add Chess Piece Modal */}
        {showAddPieceForm && selectedCollection && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Thêm Quân Cờ vào "{selectedCollection.name}"
                </h3>
                <form onSubmit={handleAddChessPiece} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên Quân Cờ</label>
                    <input
                      type="text"
                      required
                      value={pieceFormData.name}
                      onChange={(e) => setPieceFormData({ ...pieceFormData, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ví dụ: Xe Văn Lang"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Loại</label>
                      <select
                        value={pieceFormData.type}
                        onChange={(e) => setPieceFormData({ ...pieceFormData, type: e.target.value as any })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="xe">Xe</option>
                        <option value="hậu">Hậu</option>
                        <option value="mã">Mã</option>
                        <option value="tượng">Tượng</option>
                        <option value="tốt">Tốt</option>
                        <option value="vua">Vua</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Độ hiếm</label>
                      <select
                        value={pieceFormData.rarity}
                        onChange={(e) => setPieceFormData({ ...pieceFormData, rarity: e.target.value as any })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="common">Thường</option>
                        <option value="rare">Hiếm</option>
                        <option value="epic">Epic</option>
                        <option value="legendary">Huyền thoại</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                    <textarea
                      value={pieceFormData.description}
                      onChange={(e) => setPieceFormData({ ...pieceFormData, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={2}
                      placeholder="Mô tả về quân cờ..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Drop Rate (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={pieceFormData.dropRate}
                      onChange={(e) => setPieceFormData({ ...pieceFormData, dropRate: Number(e.target.value) })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="10"
                    />
                    <p className="text-xs text-gray-500 mt-1">Tỷ lệ rơi của quân cờ (càng hiếm càng thấp)</p>
                  </div>

                  {/* Upload File 3D */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mô hình 3D (Tùy chọn)</label>
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 48 48"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="3d-model-file"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Chọn file 3D</span>
                            <input
                              id="3d-model-file"
                              name="3d-model-file"
                              type="file"
                              className="sr-only"
                              accept=".fbx,.glb,.gltf,.dae"
                              onChange={handle3DFileSelect}
                            />
                          </label>
                          <p className="pl-1">hoặc kéo thả vào đây</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          FBX, GLB, GLTF, DAE tối đa 500MB (Vercel Blob)
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          ✅ Hỗ trợ file lớn hơn 4MB với Vercel Blob!
                        </p>
                      </div>
                    </div>
                    
                    {/* Preview File 3D */}
                    {model3DPreview && (
                      <div className="mt-4">
                        <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="flex items-center">
                            <div className="flex-shrink-0">
                              <svg className="h-8 w-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-blue-900">{model3DPreview}</p>
                              <p className="text-xs text-blue-600">File 3D đã chọn</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={clear3DFile}
                            className="text-blue-400 hover:text-blue-600 transition-colors"
                          >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  {isUploading && (
                    <div className="pt-4">
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                        <span>Đang upload...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddPieceForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      disabled={isUploading}
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isUploading}
                    >
                      {isUploading ? 'Đang upload...' : 'Thêm Quân Cờ'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Collection Modal */}
        {showEditForm && selectedCollection && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">✏️ Chỉnh sửa Collection</h3>
                  <button
                    onClick={() => {
                      setShowEditForm(false);
                      setSelectedCollection(null);
                      setFormData({ name: '', description: '', theme: 'vietnam', endDate: '', coverImage: '' });
                      clearImage();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="sr-only">Đóng</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleEditCollection} className="space-y-4">
                  {/* Tên Collection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tên Collection *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ví dụ: Văn Lang"
                    />
                  </div>

                  {/* Mô tả */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                      placeholder="Mô tả về collection..."
                    />
                  </div>

                  {/* Chủ đề */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chủ đề</label>
                    <select
                      value={formData.theme}
                      onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="vietnam">Việt Nam</option>
                      <option value="medieval">Trung Cổ</option>
                      <option value="fantasy">Fantasy</option>
                      <option value="modern">Hiện Đại</option>
                    </select>
                  </div>

                  {/* Ngày kết thúc */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Ngày kết thúc (Tùy chọn)</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Upload Ảnh Collection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh Collection</label>
                    
                    {/* Hiển thị ảnh hiện tại */}
                    {formData.coverImage && !selectedImage && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Ảnh hiện tại:</p>
                        <img
                          src={formData.coverImage.startsWith('http') ? formData.coverImage : `/uploads/collections/${formData.coverImage}`}
                          alt="Current cover"
                          className="aspect-square w-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}

                    {/* Hiển thị ảnh preview */}
                    {selectedImage && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Ảnh mới:</p>
                        <img
                          src={URL.createObjectURL(selectedImage)}
                          alt="Preview"
                          className="aspect-square w-32 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                    
                    {/* File Input */}
                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
                      <div className="space-y-1 text-center">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label
                            htmlFor="edit-collection-image"
                            className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                          >
                            <span>Chọn ảnh mới</span>
                            <input
                              id="edit-collection-image"
                              name="edit-collection-image"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleImageSelect}
                            />
                          </label>
                          <p className="pl-1">hoặc kéo thả vào đây</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF tối đa 5MB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setSelectedCollection(null);
                        setFormData({ name: '', description: '', theme: 'vietnam', endDate: '', coverImage: '' });
                        clearImage();
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      Cập nhật Collection
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
    </ErrorBoundary>
  );
}
