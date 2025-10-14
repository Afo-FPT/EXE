'use client'
import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'

const FeatureGuide = () => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has seen the guide before
    const hasSeenGuide = localStorage.getItem('chess-3d-guide-seen')
    if (!hasSeenGuide) {
      setIsVisible(true)
    }
  }, [])

  const handleClose = () => {
    setIsVisible(false)
    localStorage.setItem('chess-3d-guide-seen', 'true')
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 max-w-sm z-50">
      <div className="flex items-start gap-3">
        <div className="bg-primary/10 rounded-full p-2">
          <Icon icon="solar:cube-bold" className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-gray-900 mb-1">Tính năng mới!</h3>
          <p className="text-sm text-gray-600 mb-3">
            Click vào quân cờ để xem chi tiết và model 3D tương tác
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="bg-primary text-white px-3 py-1 rounded text-sm hover:bg-primary/90 transition-colors"
            >
              Đã hiểu
            </button>
            <button
              onClick={handleClose}
              className="text-gray-500 hover:text-gray-700 text-sm"
            >
              Bỏ qua
            </button>
          </div>
        </div>
        
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-gray-600"
        >
          <Icon icon="solar:close-circle-bold" className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default FeatureGuide
