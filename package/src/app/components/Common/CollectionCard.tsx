'use client'

import { useState } from 'react'
import { Icon } from '@iconify/react'
import Image from 'next/image'

interface Collection {
  _id: string
  name: string
  description: string
  coverImage: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CollectionCardProps {
  collection: Collection
  isSelected?: boolean
  onSelect?: (collection: Collection) => void
}

export default function CollectionCard({ collection, isSelected = false, onSelect }: CollectionCardProps) {
  const [imageError, setImageError] = useState(false)
  
  // Debug log for collection data
  console.log('🖼️ CollectionCard rendering:', {
    name: collection.name,
    hasCoverImage: !!collection.coverImage,
    coverImageLength: collection.coverImage?.length || 0,
    coverImageStart: collection.coverImage?.substring(0, 50) || 'N/A'
  })

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(collection)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100'
      case 'rare': return 'text-blue-600 bg-blue-100'
      case 'epic': return 'text-purple-600 bg-purple-100'
      case 'legendary': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRarityText = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Thường'
      case 'rare': return 'Hiếm'
      case 'epic': return 'Epic'
      case 'legendary': return 'Huyền thoại'
      default: return rarity
    }
  }

  return (
    <div 
      className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden border-2 ${
        isSelected 
          ? 'border-blue-500 ring-2 ring-blue-200' 
          : 'border-transparent hover:border-blue-200'
      }`}
      onClick={handleCardClick}
    >
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-blue-100 to-purple-100">
        {collection.coverImage && !imageError ? (
          <Image
            src={collection.coverImage}
            alt={collection.name}
            fill
            className="object-cover"
            onError={(e) => {
              console.error('❌ Collection image load error:', e);
              setImageError(true);
            }}
            onLoad={() => {
              console.log('✅ Collection image loaded successfully');
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-6xl">♟️</div>
            {!collection.coverImage && (
              <div className="absolute bottom-2 left-2 text-xs text-gray-500">
                No image
              </div>
            )}
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {/* Status badge */}
        <div className="absolute top-3 right-3">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            collection.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {collection.isActive ? 'Hoạt động' : 'Tạm dừng'}
          </span>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-3 left-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Icon icon="solar:check-bold" className="w-5 h-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{collection.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">{collection.description}</p>
        </div>

        {/* Stats */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Ngày tạo</span>
            <span className="font-medium text-gray-900">
              {new Date(collection.createdAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Cập nhật</span>
            <span className="font-medium text-gray-900">
              {new Date(collection.updatedAt).toLocaleDateString('vi-VN')}
            </span>
          </div>
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>
    </div>
  )
}