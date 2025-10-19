'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import ChessPieceCard from '@/app/components/Common/ChessPieceCard'
import ChessPieceDetail from '@/app/components/Common/ChessPieceDetail'
import Model3DViewer from '@/app/components/Common/Model3DViewer'
import FeatureGuide from '@/app/components/Common/FeatureGuide'
import { buildApiUrl } from '@/config/api'

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
  price: number
  discount: number
}

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

const CollectionDetailPage = () => {
  const params = useParams()
  const collectionId = params.id as string
  
  const [collection, setCollection] = useState<Collection | null>(null)
  const [chessPieces, setChessPieces] = useState<ChessPiece[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPieces, setLoadingPieces] = useState(false)
  const [show3DModal, setShow3DModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedPiece, setSelectedPiece] = useState<ChessPiece | null>(null)

  // Fetch collection details
  const fetchCollection = async () => {
    try {
      console.log('📡 Fetching collection:', collectionId)
      const response = await fetch(buildApiUrl(`/collections/public/${collectionId}`))
      
      if (!response.ok) {
        throw new Error('Failed to fetch collection')
      }
      
      const data = await response.json()
      console.log('✅ Collection fetched:', data.collection)
      setCollection(data.collection)
    } catch (error) {
      console.error('❌ Error fetching collection:', error)
      // Không có fallback data, để hiển thị loading hoặc error
      setCollection(null)
    } finally {
      setLoading(false)
    }
  }

  // Fetch chess pieces for the collection
  const fetchChessPieces = async () => {
    try {
      setLoadingPieces(true)
      console.log('📡 Fetching chess pieces for collection:', collectionId)
      
      const response = await fetch(`http://localhost:5000/api/chess-pieces/collection/${collectionId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch chess pieces')
      }
      
      const data = await response.json()
      console.log('✅ Chess pieces fetched:', data.chessPieces)
      setChessPieces(data.chessPieces || [])
    } catch (error) {
      console.error('❌ Error fetching chess pieces:', error)
      // Không có fallback data, để hiển thị danh sách trống
      setChessPieces([])
    } finally {
      setLoadingPieces(false)
    }
  }

  // Handle chess piece click for detail view
  const handleChessPieceClick = (piece: ChessPiece) => {
    setSelectedPiece(piece)
    setShowDetailModal(true)
  }

  // Handle 3D view from detail modal
  const handleView3D = () => {
    setShowDetailModal(false)
    setShow3DModal(true)
  }

  useEffect(() => {
    if (collectionId) {
      fetchCollection()
      fetchChessPieces()
    }
  }, [collectionId])

  if (loading) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <Icon icon="solar:loading-bold" className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin bộ sưu tập...</p>
        </div>
      </div>
    )
  }

  if (!collection) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center">
          <Icon icon="solar:close-circle-bold" className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bộ sưu tập</h2>
          <p className="text-gray-600 mb-6">Bộ sưu tập bạn đang tìm kiếm không tồn tại.</p>
          <Link
            href="/collection"
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/collection"
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Icon icon="solar:arrow-left-bold" className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
              <p className="text-gray-600">{collection.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Collection Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cover Image */}
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <Image
                src={collection.coverImage.startsWith('http') ? collection.coverImage : `http://localhost:5000${collection.coverImage}`}
                alt={collection.name}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/images/Product/demo.png'
                }}
              />
            </div>

            {/* Collection Details */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{collection.name}</h2>
                <p className="text-gray-600">{collection.description}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary">{collection.totalChessPieces}</div>
                  <div className="text-sm text-gray-600">Quân cờ</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-primary capitalize">{collection.theme}</div>
                  <div className="text-sm text-gray-600">Chủ đề</div>
                </div>
              </div>

              {/* Rarity Distribution */}
              <div>
                <h3 className="font-bold text-gray-900 mb-3">Phân bố độ hiếm:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(collection.rarityDistribution).map(([rarity, count]) => (
                    count > 0 && (
                      <div key={rarity} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <span className="capitalize font-medium">{rarity}</span>
                        <span className="bg-primary text-white px-2 py-1 rounded text-sm">
                          {count}
                        </span>
                      </div>
                    )
                  ))}
                </div>
              </div>

              {/* Price */}
              {collection.price > 0 && (
                <div className="flex items-center gap-4">
                  <div className="text-3xl font-bold text-primary">
                    {collection.discount > 0 ? (
                      <>
                        {(collection.price * (1 - collection.discount / 100)).toLocaleString('vi-VN')}đ
                        <span className="text-lg text-gray-500 line-through ml-2">
                          {collection.price.toLocaleString('vi-VN')}đ
                        </span>
                      </>
                    ) : (
                      `${collection.price.toLocaleString('vi-VN')}đ`
                    )}
                  </div>
                  {collection.discount > 0 && (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      -{collection.discount}%
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chess Pieces */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Quân Cờ trong bộ sưu tập</h2>
            <span className="bg-primary text-white px-3 py-1 rounded-full text-sm">
              {chessPieces.length} quân cờ
            </span>
          </div>

          {loadingPieces ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                  <div className="aspect-square bg-gray-200 rounded mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {chessPieces.map((piece) => (
                <ChessPieceCard
                  key={piece._id}
                  piece={piece}
                  onClick={handleChessPieceClick}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chess Piece Detail Modal */}
      {showDetailModal && selectedPiece && (
        <ChessPieceDetail
          piece={selectedPiece}
          onClose={() => setShowDetailModal(false)}
          onView3D={handleView3D}
        />
      )}

      {/* 3D Model Modal */}
      {show3DModal && selectedPiece && (
        <Model3DViewer
          modelUrl={selectedPiece.model3D}
          onClose={() => setShow3DModal(false)}
        />
      )}

      {/* Feature Guide */}
      <FeatureGuide />
    </div>
  )
}

export default CollectionDetailPage
