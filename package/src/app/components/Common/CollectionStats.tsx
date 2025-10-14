'use client'
import { Icon } from '@iconify/react'

interface CollectionStatsProps {
  totalCollections: number
  totalPieces: number
  activeCollections: number
}

const CollectionStats = ({ totalCollections, totalPieces, activeCollections }: CollectionStatsProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Thống Kê Bộ Sưu Tập</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Collections */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{totalCollections}</div>
              <div className="text-blue-100">Tổng Bộ Sưu Tập</div>
            </div>
            <Icon icon="solar:gallery-bold" className="w-12 h-12 text-blue-200" />
          </div>
        </div>

        {/* Total Pieces */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{totalPieces}</div>
              <div className="text-green-100">Tổng Quân Cờ</div>
            </div>
            <Icon icon="solar:chess-bold" className="w-12 h-12 text-green-200" />
          </div>
        </div>

        {/* Active Collections */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">{activeCollections}</div>
              <div className="text-purple-100">Đang Hoạt Động</div>
            </div>
            <Icon icon="solar:star-bold" className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollectionStats
