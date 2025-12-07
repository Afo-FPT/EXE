'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'

interface Model3DLoaderProps {
  modelUrl: string
  onLoadStart?: () => void
  onLoadComplete?: () => void
  onLoadError?: (error: string) => void
  children: React.ReactNode
}

export default function Model3DLoader({ 
  modelUrl, 
  onLoadStart, 
  onLoadComplete, 
  onLoadError, 
  children 
}: Model3DLoaderProps) {
  const [loadingState, setLoadingState] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!modelUrl) return

    setLoadingState('loading')
    setProgress(0)
    setError(null)
    onLoadStart?.()

    // Simulate loading progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + Math.random() * 20
      })
    }, 200)

    // Check if model URL is accessible
    const checkModel = async () => {
      try {
        const response = await fetch(modelUrl, { method: 'HEAD' })
        
        if (response.ok) {
          setProgress(100)
          setLoadingState('loaded')
          onLoadComplete?.()
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        setLoadingState('error')
        onLoadError?.(errorMessage)
      }
    }

    // Add a minimum loading time for better UX
    const minLoadingTime = setTimeout(() => {
      checkModel()
    }, 1000)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(minLoadingTime)
    }
  }, [modelUrl, onLoadStart, onLoadComplete, onLoadError])

  if (loadingState === 'loading') {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] bg-gray-50 rounded-lg">
        <div className="text-center p-6">
          <div className="relative mb-4">
            <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Icon icon="solar:3d-cube-bold" className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Đang tải mô hình 3D
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Vui lòng chờ trong giây lát...
          </p>
          
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-400">
            {Math.round(progress)}% hoàn thành
          </p>
        </div>
      </div>
    )
  }

  if (loadingState === 'error') {
    return (
      <div className="flex items-center justify-center h-full min-h-[200px] bg-gray-50 rounded-lg">
        <div className="text-center p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không thể tải mô hình 3D
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            {error || 'Có lỗi xảy ra khi tải mô hình'}
          </p>
          <button
            onClick={() => {
              setLoadingState('idle')
              setProgress(0)
              setError(null)
            }}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Icon icon="solar:refresh-bold" className="w-4 h-4 mr-2" />
            Thử lại
          </button>
        </div>
      </div>
    )
  }

  if (loadingState === 'loaded') {
    return <>{children}</>
  }

  return null
}
