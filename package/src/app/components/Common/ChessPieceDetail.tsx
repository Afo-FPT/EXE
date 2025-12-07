'use client'
import Image from 'next/image'
import { Icon } from '@iconify/react'

interface ChessPiece {
  _id: string
  name: string
  type: string
  collection: string
  description: string
  model3D: string
  images: string[]
  isActive: boolean
  createdAt: string
}

interface ChessPieceDetailProps {
  piece: ChessPiece
  onClose: () => void
  onView3D: () => void
}

const ChessPieceDetail = ({ piece, onClose, onView3D }: ChessPieceDetailProps) => {
  // Removed price calculation since we don't have price fields

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vua': return 'solar:crown-bold'
      case 'hậu': return 'solar:queen-bold'
      case 'xe': return 'solar:castle-bold'
      case 'mã': return 'solar:horse-bold'
      case 'tượng': return 'solar:bishop-bold'
      case 'tốt': return 'solar:pawn-bold'
      default: return 'solar:chess-bold'
    }
  }

  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'vua': return 'Vua'
      case 'hậu': return 'Hậu'
      case 'xe': return 'Xe'
      case 'mã': return 'Mã'
      case 'tượng': return 'Tượng'
      case 'tốt': return 'Tốt'
      default: return type
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Icon icon={getTypeIcon(piece.type)} className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Chi tiết Quân Cờ</h2>
                <p className="text-blue-100">Thông tin chi tiết về quân cờ</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Image and 3D */}
            <div className="xl:col-span-1 space-y-4">
              {/* Main Image */}
              <div className="relative group">
                <div className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200">
                  {piece.images && piece.images.length > 0 ? (
                    <Image
                      src={piece.images[0]}
                      alt={piece.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Icon icon={getTypeIcon(piece.type)} className="w-24 h-24 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
                    piece.isActive 
                      ? 'bg-green-500 text-white' 
                      : 'bg-red-500 text-white'
                  }`}>
                    {piece.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>

              </div>

              {/* Image Gallery */}
              {piece.images && piece.images.length > 1 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Thêm ảnh khác:</h4>
                  <div className="grid grid-cols-2 gap-2">
                    {piece.images.slice(1, 5).map((image, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <Image
                          src={image}
                          alt={`${piece.name} - Ảnh ${index + 2}`}
                          fill
                          className="object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Right Column - Details */}
            <div className="xl:col-span-2 space-y-6">
              {/* Basic Info Card */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-white rounded-lg shadow-sm">
                    <Icon icon={getTypeIcon(piece.type)} className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{piece.name}</h3>
                    <p className="text-lg text-gray-600">{getTypeLabel(piece.type)}</p>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <Icon icon="solar:calendar-bold" className="w-4 h-4 mr-1" />
                    {new Date(piece.createdAt).toLocaleDateString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Icon icon="solar:text-bold" className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Mô tả</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">{piece.description}</p>
              </div>

              {/* Technical Info Card */}
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Icon icon="solar:settings-bold" className="w-5 h-5 text-gray-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Thông tin kỹ thuật</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Icon icon="solar:tag-bold" className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-500">Loại quân cờ</p>
                      <p className="font-medium text-gray-900">{getTypeLabel(piece.type)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Icon icon="solar:calendar-bold" className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-gray-500">Ngày tạo</p>
                      <p className="font-medium text-gray-900">
                        {new Date(piece.createdAt).toLocaleDateString('vi-VN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500">
              ID: {piece._id}
            </div>
            <div className="flex gap-3">
              {/* 3D Button - DISABLED */}
              {/* <button
                onClick={onView3D}
                disabled={!piece.model3D || piece.model3D.trim() === ''}
                className={`px-6 py-2 text-sm font-medium rounded-lg transition-colors ${
                  piece.model3D && piece.model3D.trim() !== ''
                    ? 'text-white bg-blue-600 border border-blue-600 hover:bg-blue-700'
                    : 'text-gray-400 bg-gray-100 border border-gray-200 cursor-not-allowed'
                }`}
                title={(!piece.model3D || piece.model3D.trim() === '') ? 'Chưa có model 3D' : 'Xem 3D'}
              >
                Xem 3D
              </button> */}
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChessPieceDetail