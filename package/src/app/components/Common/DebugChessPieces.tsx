'use client'
import { useEffect, useState } from 'react'
import { buildApiUrl } from '@/config/api'

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

const DebugChessPieces = () => {
  const [pieces, setPieces] = useState<ChessPiece[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPieces = async () => {
      try {
        const response = await fetch(buildApiUrl('/collections/active'))
        const data = await response.json()
        
        if (data.success && data.collections.length > 0) {
          const collectionId = data.collections[0]._id
          const piecesResponse = await fetch(buildApiUrl(`/chess-pieces/collection/${collectionId}`))
          const piecesData = await piecesResponse.json()
          
          if (piecesData.success) {
            setPieces(piecesData.chessPieces || [])
          }
        }
      } catch (error) {
        console.error('Error fetching pieces:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchPieces()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-4 bg-gray-100 rounded-lg">
      <h3 className="font-bold mb-4">Debug Chess Pieces</h3>
      {pieces.length === 0 ? (
        <p>No pieces found</p>
      ) : (
        <div className="space-y-2">
          {pieces.map((piece) => (
            <div key={piece._id} className="bg-white p-3 rounded border">
              <div className="font-medium">{piece.name}</div>
              <div className="text-sm text-gray-600">Type: {piece.type}</div>
              <div className="text-sm text-gray-600">Rarity: {piece.rarity}</div>
              <div className="text-sm text-gray-600">Model3D: {piece.model3D}</div>
              <div className="text-sm text-gray-600">Image: {piece.image}</div>
              <div className="mt-2">
                <a 
                  href={`https://exe-backend.fly.dev${piece.model3D}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-sm"
                >
                  Test Model URL
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DebugChessPieces
