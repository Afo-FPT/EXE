'use client'
import Image from 'next/image'
import { Icon } from '@iconify/react'

interface ChessPiece {
  _id: string
  name: string
  type: string
  rarity: string
  image: string
  model3D: string
  description: string
  dropRate: number
}

interface ChessPieceDetailProps {
  piece: ChessPiece
  onClose: () => void
  onView3D: () => void
}

const ChessPieceDetail = ({ piece, onClose, onView3D }: ChessPieceDetailProps) => {
  // Get rarity color
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100'
      case 'rare': return 'text-blue-600 bg-blue-100'
      case 'epic': return 'text-purple-600 bg-purple-100'
      case 'legendary': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  // Get rarity label
  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Thường'
      case 'rare': return 'Hiếm'
      case 'epic': return 'Epic'
      case 'legendary': return 'Huyền Thoại'
      default: return rarity
    }
  }

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-4xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Chi tiết quân cờ</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={piece.image}
                  alt={piece.name}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.src = '/images/Product/demo.png'
                  }}
                />
                
                {/* Rarity Badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRarityColor(piece.rarity)}`}>
                    {getRarityLabel(piece.rarity)}
                  </span>
                </div>

                {/* Type Icon */}
                <div className="absolute top-4 left-4">
                  <div className="bg-white/90 rounded-full p-2">
                    <Icon icon={getTypeIcon(piece.type)} className="w-6 h-6 text-gray-700" />
                  </div>
                </div>
              </div>

              {/* 3D View Button */}
              <button
                onClick={onView3D}
                className="w-full bg-primary text-white py-3 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                <Icon icon="solar:cube-bold" className="w-5 h-5" />
                Xem Model 3D
              </button>
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Basic Info */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{piece.name}</h2>
                <p className="text-gray-600 text-lg">{getTypeLabel(piece.type)}</p>
              </div>

              {/* Description */}
              <div>
                <h3 className="font-bold text-gray-900 mb-2">Mô tả</h3>
                <p className="text-gray-600">{piece.description || 'Chưa có mô tả chi tiết.'}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary">{piece.dropRate}%</div>
                  <div className="text-sm text-gray-600">Tỷ lệ rơi</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary capitalize">{piece.rarity}</div>
                  <div className="text-sm text-gray-600">Độ hiếm</div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ChessPieceDetail
