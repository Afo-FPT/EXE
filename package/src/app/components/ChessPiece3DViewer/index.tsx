'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Suspense, useState, useEffect } from 'react'

type ChessPiece3DViewerProps = {
  modelUrl: string
  pieceName: string
  onClose: () => void
}

function Model({ url, onError }: { url: string; onError: (error: string) => void }) {
  // Kiểm tra định dạng file để sử dụng loader phù hợp
  const fileExtension = url.split('.').pop()?.toLowerCase()
  
  // Kiểm tra URL hợp lệ
  if (!url || !fileExtension) {
    onError('URL file 3D không hợp lệ')
    return (
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="red" />
      </mesh>
    )
  }
  
  try {
    if (['glb', 'gltf'].includes(fileExtension)) {
      // Sử dụng useGLTF cho file .glb, .gltf
      const { scene } = useGLTF(url)
      return <primitive object={scene} scale={1.5} />
    } else {
      // Không hỗ trợ định dạng khác
      onError(`Định dạng file ${fileExtension} chưa được hỗ trợ. Chỉ hỗ trợ .glb, .gltf`)
      return (
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      )
    }
  } catch (error) {
    console.error('Error loading 3D model:', error)
    console.error('URL:', url)
    console.error('File extension:', fileExtension)
    
    let errorMessage = 'Lỗi không xác định'
    if (error instanceof Error) {
      errorMessage = error.message
    } else if (typeof error === 'string') {
      errorMessage = error
    } else if (error && typeof error === 'object') {
      errorMessage = JSON.stringify(error)
    }
    
    onError(`Không thể tải file 3D: ${errorMessage}`)
    
    // Fallback: hiển thị một cube đơn giản
    return (
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    )
  }
}

export default function ChessPiece3DViewer({ modelUrl, pieceName, onClose }: ChessPiece3DViewerProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [fileExists, setFileExists] = useState<boolean | null>(null)

  useEffect(() => {
    // Reset error state when modelUrl changes
    setError(null)
    setIsLoading(true)
    setFileExists(null)
    
    // Kiểm tra file có tồn tại không
    checkFileExists(modelUrl)
  }, [modelUrl])

  const checkFileExists = async (url: string) => {
    try {
      const response = await fetch(url, { method: 'HEAD' })
      if (response.ok) {
        setFileExists(true)
      } else {
        setFileExists(false)
        setError(`File không tồn tại hoặc không thể truy cập (HTTP ${response.status})`)
        setIsLoading(false)
      }
    } catch (err) {
      setFileExists(false)
      setError(`Không thể kiểm tra file: ${err instanceof Error ? err.message : 'Lỗi mạng'}`)
      setIsLoading(false)
    }
  }

  const handleModelError = (errorMessage: string) => {
    setError(errorMessage)
    setIsLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        >
          &times;
        </button>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
          Xem mô hình 3D: {pieceName}
        </h2>
        
        <div className="w-full h-[400px] bg-gray-100 rounded-md mb-4 relative">
          {error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">⚠️</div>
                <p className="text-red-600 font-medium">Không thể tải mô hình 3D</p>
                <p className="text-sm text-gray-500 mt-2">{error}</p>
                <p className="text-xs text-gray-400 mt-1">File: {modelUrl.split('/').pop()}</p>
                <p className="text-xs text-gray-400 mt-1">URL: {modelUrl}</p>
              </div>
            </div>
          ) : fileExists === false ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">📁</div>
                <p className="text-orange-600 font-medium">Đang kiểm tra file...</p>
                <p className="text-sm text-gray-500 mt-2">Vui lòng chờ...</p>
              </div>
            </div>
          ) : (
            <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
              <ambientLight intensity={0.8} />
              <directionalLight position={[10, 10, 5]} intensity={1.5} />
              <directionalLight position={[-10, -10, -5]} intensity={0.8} />
              <directionalLight position={[0, 10, 0]} intensity={1} />
              <directionalLight position={[0, -10, 0]} intensity={0.6} />
              <Suspense fallback={
                <mesh>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color="lightgray" />
                </mesh>
              }>
                <Model url={modelUrl} onError={handleModelError} />
              </Suspense>
              <OrbitControls enableZoom={true} />
            </Canvas>
          )}
        </div>
        
        <p className="text-sm text-gray-600 text-center">
          Sử dụng chuột để xoay (trái), di chuyển (phải) và zoom (cuộn) mô hình.
        </p>
      </div>
    </div>
  )
}
