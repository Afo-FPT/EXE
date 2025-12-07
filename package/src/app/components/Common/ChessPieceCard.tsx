'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react'
// import ChessPiece3DViewer from '@/app/components/ChessPiece3DViewer' // Disabled 3D viewer

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

interface ChessPieceCardProps {
  piece: ChessPiece
  onClick?: (piece: ChessPiece) => void
  show3DButton?: boolean
}

export default function ChessPieceCard({ piece, onClick, show3DButton = false }: ChessPieceCardProps) {
  // const [show3DModal, setShow3DModal] = useState(false) // Disabled 3D viewer

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'xe': return '♜'
      case 'hậu': return '♛'
      case 'mã': return '♞'
      case 'tượng': return '♝'
      case 'tốt': return '♟'
      case 'vua': return '♚'
      default: return '♟'
    }
  }

  const getTypeText = (type: string) => {
    switch (type) {
      case 'xe': return 'Xe'
      case 'hậu': return 'Hậu'
      case 'mã': return 'Mã'
      case 'tượng': return 'Tượng'
      case 'tốt': return 'Tốt'
      case 'vua': return 'Vua'
      default: return type
    }
  }

  // Removed price calculation since we don't have price fields

  const handleCardClick = () => {
    if (onClick) {
      onClick(piece)
    }
  }

  // Disabled 3D viewer
  // const handle3DClick = (e: React.MouseEvent) => {
  //   e.stopPropagation()
  //   if (piece.model3D) {
  //     setShow3DModal(true)
  //   }
  // }

  return (
    <>
      <div 
        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden"
        onClick={handleCardClick}
      >
        {/* Header with type icon */}
        <div className="relative p-4 bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-2xl">
                {getTypeIcon(piece.type)}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">{piece.name}</h3>
                <p className="text-sm text-gray-600">{getTypeText(piece.type)}</p>
              </div>
            </div>
            
            {/* 3D Button - DISABLED */}
            {/* {show3DButton && piece.model3D && (
              <button
                onClick={handle3DClick}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors opacity-0 group-hover:opacity-100"
                title="Xem mô hình 3D"
              >
                <Icon icon="solar:3d-cube-bold" className="w-5 h-5" />
              </button>
            )} */}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Chess Piece Images */}
          {piece.images && piece.images.length > 0 && (
            <div className="mb-4">
              <div className="relative w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                <Image
                  src={piece.images[0]}
                  alt={piece.name}
                  fill
                  className="object-cover"
                />
              </div>
              {piece.images.length > 1 && (
                <div className="mt-2 text-xs text-gray-500">
                  +{piece.images.length - 1} ảnh khác
                </div>
              )}
            </div>
          )}

          <div className="mb-3">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {piece.collection}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {piece.description}
          </p>

          {/* Status */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span className="text-xs text-gray-500">
              {new Date(piece.createdAt).toLocaleDateString('vi-VN')}
            </span>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              piece.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {piece.isActive ? 'Hoạt động' : 'Tạm dừng'}
            </span>
          </div>

          {/* 3D Model indicator - DISABLED */}
          {/* {piece.model3D && (
            <div className="mt-3 flex items-center text-xs text-blue-600">
              <Icon icon="solar:3d-cube-bold" className="w-4 h-4 mr-1" />
              <span>Mô hình 3D có sẵn</span>
            </div>
          )} */}
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* 3D Modal - DISABLED */}
      {/* {show3DModal && (
        <ChessPiece3DViewer
          modelUrl={piece.model3D}
          pieceName={piece.name}
          onClose={() => setShow3DModal(false)}
        />
      )} */}
    </>
  )
}