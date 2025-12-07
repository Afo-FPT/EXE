'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, useFBX } from '@react-three/drei'
import { Suspense, useState, useEffect } from 'react'
import Model3DErrorBoundary from '@/app/components/Common/Model3DErrorBoundary'

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
    } else if (fileExtension === 'fbx') {
      // Sử dụng useFBX cho file .fbx
      const fbx = useFBX(url)
      return <primitive object={fbx} scale={1.5} />
    } else if (fileExtension === 'obj') {
      // OBJ files không được hỗ trợ trực tiếp, sử dụng fallback
      onError(`Định dạng file ${fileExtension} chưa được hỗ trợ trực tiếp. Vui lòng chuyển đổi sang GLB hoặc GLTF.`)
      return (
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      )
    } else {
      // Không hỗ trợ định dạng khác
      onError(`Định dạng file ${fileExtension} chưa được hỗ trợ. Chỉ hỗ trợ .glb, .gltf, .fbx, .obj`)
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
      // For Vercel Blob URLs, we can be more lenient with the check
      const response = await fetch(url, { 
        method: 'HEAD',
        headers: {
          'Accept': '*/*',
        }
      })
      
      if (response.ok) {
        setFileExists(true)
        console.log('✅ File exists and is accessible')
      } else if (response.status === 403) {
        // Vercel Blob might return 403 for HEAD requests but work for GET
        setFileExists(true)
        console.log('⚠️ File might be accessible (403 on HEAD, trying anyway)')
      } else {
        setFileExists(false)
        setError(`File không tồn tại hoặc không thể truy cập (HTTP ${response.status})`)
        setIsLoading(false)
      }
    } catch (err) {
      // For Vercel Blob, we'll try to load anyway as the error might be CORS related
      console.log('⚠️ File check failed, but trying to load anyway:', err)
      setFileExists(true)
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
                <button 
                  onClick={() => {
                    setError(null)
                    setIsLoading(true)
                    checkFileExists(modelUrl)
                  }}
                  className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Thử lại
                </button>
              </div>
            </div>
          ) : fileExists === false ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">📁</div>
                <p className="text-orange-600 font-medium">Đang kiểm tra file...</p>
                <p className="text-sm text-gray-500 mt-2">Vui lòng chờ...</p>
                <div className="mt-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                </div>
              </div>
            </div>
          ) : (
            <Model3DErrorBoundary
              onError={(error, errorInfo) => {
                console.error('3D Model loading error:', error, errorInfo)
                handleModelError(`Lỗi tải mô hình: ${error.message}`)
              }}
            >
              <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
                <ambientLight intensity={0.8} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} />
                <directionalLight position={[-10, -10, -5]} intensity={0.8} />
                <directionalLight position={[0, 10, 0]} intensity={1} />
                <directionalLight position={[0, -10, 0]} intensity={0.6} />
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                      <p className="text-blue-600 font-medium">Đang tải mô hình 3D...</p>
                      <p className="text-sm text-gray-500 mt-1">Vui lòng chờ trong giây lát</p>
                    </div>
                  </div>
                }>
                  <Model url={modelUrl} onError={handleModelError} />
                </Suspense>
                <OrbitControls enableZoom={true} />
              </Canvas>
            </Model3DErrorBoundary>
          )}
        </div>
        
        <p className="text-sm text-gray-600 text-center">
          Sử dụng chuột để xoay (trái), di chuyển (phải) và zoom (cuộn) mô hình.
        </p>
      </div>
    </div>
  )
}
