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

interface ChessPieceCardProps {
  piece: ChessPiece
  onClick: (piece: ChessPiece) => void
}

const ChessPieceCard = ({ piece, onClick }: ChessPieceCardProps) => {
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

  return (
    <div
      className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-all duration-300 hover:shadow-md group border-2 border-transparent hover:border-primary/20"
      onClick={() => onClick(piece)}
    >
      {/* Piece Image */}
      <div className="relative aspect-square mb-3">
        <Image
          src={piece.image}
          alt={piece.name}
          fill
          className="object-cover rounded group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.currentTarget.src = '/images/Product/demo.png'
          }}
        />
        
        {/* Rarity Badge */}
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getRarityColor(piece.rarity)}`}>
            {getRarityLabel(piece.rarity)}
          </span>
        </div>

        {/* Type Icon */}
        <div className="absolute top-2 left-2">
          <div className="bg-white/90 rounded-full p-1">
            <Icon icon={getTypeIcon(piece.type)} className="w-4 h-4 text-gray-700" />
          </div>
        </div>

        {/* Drop Rate */}
        <div className="absolute bottom-2 left-2">
          <span className="bg-black/70 text-white px-2 py-1 rounded text-xs">
            {piece.dropRate}%
          </span>
        </div>
      </div>

      {/* Piece Info */}
      <div className="space-y-2">
        <h4 className="font-bold text-gray-900 group-hover:text-primary transition-colors">
          {piece.name}
        </h4>
        <p className="text-sm text-gray-600 line-clamp-2">{piece.description}</p>
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500 capitalize font-medium">
            {piece.type}
          </span>
          <div className="flex items-center text-primary text-sm group-hover:text-primary/80 transition-colors">
            <Icon icon="solar:info-circle-bold" className="w-4 h-4 mr-1" />
            Chi tiết
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-primary/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  )
}

export default ChessPieceCard
