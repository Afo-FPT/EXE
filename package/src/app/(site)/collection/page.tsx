'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import CollectionCard from '@/app/components/Common/CollectionCard'
import ChessPieceCard from '@/app/components/Common/ChessPieceCard'
import ChessPieceDetail from '@/app/components/Common/ChessPieceDetail'
import CollectionStats from '@/app/components/Common/CollectionStats'
import Breadcrumb from '@/app/components/Common/Breadcrumb'
import FeatureGuide from '@/app/components/Common/FeatureGuide'
// import Model3DViewer from '@/app/components/Common/Model3DViewer' // Disabled 3D viewer
import { buildApiUrl } from '@/config/api'

interface Collection {
  _id: string
  name: string
  description: string
  coverImage: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

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

const CollectionPage = () => {
  const [collections, setCollections] = useState<Collection[]>([])
  const [selectedCollection, setSelectedCollection] = useState<Collection | null>(null)
  const [chessPieces, setChessPieces] = useState<ChessPiece[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingPieces, setLoadingPieces] = useState(false)
  
  // Debug log for chessPieces state
  useEffect(() => {
    console.log('🔄 Chess pieces state updated:', chessPieces)
    console.log('🎨 Rendering chess pieces:', chessPieces.length, 'pieces')
  }, [chessPieces])
  // const [show3DModal, setShow3DModal] = useState(false) // Disabled 3D viewer
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedPiece, setSelectedPiece] = useState<ChessPiece | null>(null)

  // Fetch collections
  const fetchCollections = async () => {
    try {
      console.log('📡 Fetching collections...')
      const response = await fetch(buildApiUrl('/collections/active'))
      
      if (!response.ok) {
        throw new Error('Failed to fetch collections')
      }
      
      const data = await response.json()
      console.log('✅ Collections fetched:', data.collections)
      console.log('📊 Collections with images:', data.collections?.map((c: any) => ({
        name: c.name,
        hasImage: !!c.coverImage,
        imageLength: c.coverImage?.length || 0
      })))
      setCollections(data.collections || [])
    } catch (error) {
      console.error('❌ Error fetching collections:', error)
      // Không có fallback data, để hiển thị danh sách trống
      setCollections([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch chess pieces for a collection
  const fetchChessPieces = async (collectionId: string) => {
    try {
      setLoadingPieces(true)
      console.log('📡 Fetching chess pieces for collection:', collectionId)
      console.log('🌐 API URL:', buildApiUrl(`/chess-pieces/collection/${collectionId}`))
      
      const response = await fetch(buildApiUrl(`/chess-pieces/collection/${collectionId}`))
      
      console.log('📊 Response status:', response.status)
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ Response error:', errorText)
        throw new Error('Failed to fetch chess pieces')
      }
      
      const data = await response.json()
      console.log('✅ Chess pieces fetched:', data)
      console.log('📊 Chess pieces array:', data.chessPieces)
      console.log('📊 Chess pieces length:', data.chessPieces?.length)
      setChessPieces(data.chessPieces || [])
    } catch (error) {
      console.error('❌ Error fetching chess pieces:', error)
      // Không có fallback data, để hiển thị danh sách trống
      setChessPieces([])
    } finally {
      setLoadingPieces(false)
    }
  }

  // Handle collection selection
  const handleCollectionSelect = (collection: Collection) => {
    console.log('🎯 Collection selected:', collection)
    setSelectedCollection(collection)
    fetchChessPieces(collection._id)
  }

  // Handle chess piece click for detail view
  const handleChessPieceClick = (piece: ChessPiece) => {
    setSelectedPiece(piece)
    setShowDetailModal(true)
  }

  // Handle 3D view from detail modal - DISABLED
  // const handleView3D = () => {
  //   setShowDetailModal(false)
  //   setShow3DModal(true)
  // }

  useEffect(() => {
    fetchCollections()
  }, [])

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Bộ Sưu Tập</h1>
              <p className="text-gray-600">Khám phá các bộ sưu tập quân cờ độc đáo </p>
            </div>
            <Link
              href="/"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-200"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-200"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Collections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection._id}
                  collection={collection}
                  isSelected={selectedCollection?._id === collection._id}
                  onSelect={handleCollectionSelect}
                />
              ))}
            </div>

            {/* Chess Pieces Section */}
            {selectedCollection && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Quân Cờ trong "{selectedCollection.name}"
                    </h2>
                    <p className="text-gray-600">
                      Tổng cộng {chessPieces.length} quân cờ
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedCollection(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
                  </button>
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
                  <div>
                    {chessPieces.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-gray-500">Không có quân cờ nào trong collection này</p>
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
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Chess Piece Detail Modal */}
      {showDetailModal && selectedPiece && (
        <ChessPieceDetail
          piece={selectedPiece}
          onClose={() => setShowDetailModal(false)}
          onView3D={() => {}} // Disabled 3D viewer
        />
      )}

      {/* 3D Model Modal - DISABLED */}
      {/* {show3DModal && selectedPiece && (
        <Model3DViewer
          modelUrl={selectedPiece.model3D}
          onClose={() => setShow3DModal(false)}
        />
      )} */}

      {/* Feature Guide */}
      <FeatureGuide />
    </div>
  )
}

export default CollectionPage