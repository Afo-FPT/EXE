'use client'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react'

interface Collection {
  _id: string
  name: string
  description: string
  coverImage: string
  theme: string
  totalChessPieces: number
  rarityDistribution: {
    common: number
    rare: number
    epic: number
    legendary: number
  }
  releaseDate: string
}

interface CollectionCardProps {
  collection: Collection
  isSelected: boolean
  onSelect: (collection: Collection) => void
}

const CollectionCard = ({ collection, isSelected, onSelect }: CollectionCardProps) => {
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

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={() => onSelect(collection)}
    >
      {/* Cover Image */}
      <div className="relative aspect-video">
        <Image
          src={collection.coverImage.startsWith('http') ? collection.coverImage : `http://localhost:5000${collection.coverImage}`}
          alt={collection.name}
          fill
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src = '/images/Product/demo.png'
          }}
        />
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
            {collection.totalChessPieces} quân cờ
          </span>
        </div>

        {/* Theme Badge */}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium capitalize">
            {collection.theme}
          </span>
        </div>

        {/* Collection Name */}
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white text-xl font-bold mb-1">{collection.name}</h3>
          <p className="text-white/90 text-sm line-clamp-2">{collection.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Rarity Distribution */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Phân bố độ hiếm:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(collection.rarityDistribution).map(([rarity, count]) => (
              count > 0 && (
                <span
                  key={rarity}
                  className={`px-2 py-1 rounded text-xs font-medium ${getRarityColor(rarity)}`}
                >
                  {getRarityLabel(rarity)}: {count}
                </span>
              )
            ))}
          </div>
        </div>

        {/* Release Date */}
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <Icon icon="solar:calendar-bold" className="w-4 h-4 mr-2" />
          <span>Phát hành: {new Date(collection.releaseDate).toLocaleDateString('vi-VN')}</span>
        </div>

        {/* Action Button */}
        <Link href={`/collection/${collection._id}`}>
          <button className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/90 transition-colors flex items-center justify-center">
            <Icon icon="solar:eye-bold" className="w-4 h-4 mr-2" />
            {isSelected ? 'Đang xem' : 'Xem Chi Tiết'}
          </button>
        </Link>
      </div>
    </div>
  )
}

export default CollectionCard
