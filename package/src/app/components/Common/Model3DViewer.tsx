'use client'
import { useEffect, useRef, useState } from 'react'
import { Icon } from '@iconify/react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF, Environment, PresentationControls } from '@react-three/drei'
import { FBXLoader } from 'three-stdlib'
import * as THREE from 'three'
import { buildApiUrl } from '@/config/api'

interface Model3DViewerProps {
  modelUrl: string
  onClose: () => void
}

// Component để load và hiển thị model 3D
const Model3D = ({ url }: { url: string }) => {
  const [error, setError] = useState(false)
  
  // Construct full URL if it's a relative path (use current origin)
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const fullUrl = url.startsWith('http') ? url : `${origin}${url}`
  
  // Load GLTF model
  const { scene } = useGLTF(fullUrl)

  useEffect(() => {
    if (scene) {
      // Center the model
      const box = new THREE.Box3().setFromObject(scene)
      const center = box.getCenter(new THREE.Vector3())
      scene.position.sub(center)
      
      // Scale the model to fit
      const size = box.getSize(new THREE.Vector3())
      const maxDim = Math.max(size.x, size.y, size.z)
      const scale = 2 / maxDim
      scene.scale.setScalar(scale)
    }
  }, [scene])

  if (error) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    )
  }

  return <primitive object={scene} />
}

// Component để load FBX model
const FBXModel = ({ url }: { url: string }) => {
  const [model, setModel] = useState<THREE.Group | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loader = new FBXLoader()
    
    // Construct full URL if it's a relative path (use current origin)
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const fullUrl = url.startsWith('http') ? url : `${origin}${url}`
    
    loader.load(
      fullUrl,
      (object) => {
        // Center the model
        const box = new THREE.Box3().setFromObject(object)
        const center = box.getCenter(new THREE.Vector3())
        object.position.sub(center)
        
        // Scale the model to fit
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 2 / maxDim
        object.scale.setScalar(scale)
        
        // Add basic material to meshes without materials
        object.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (!child.material) {
              child.material = new THREE.MeshStandardMaterial({ 
                color: 0x888888,
                metalness: 0.1,
                roughness: 0.8
              })
            }
          }
        })
        
        setModel(object)
        setLoading(false)
      },
      undefined,
      (error) => {
        console.error('Error loading FBX:', error)
        setError(true)
        setLoading(false)
      }
    )
  }, [url])

  if (loading) {
    return (
      <mesh>
        <boxGeometry args={[0.1, 0.1, 0.1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    )
  }

  if (error || !model) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="red" />
      </mesh>
    )
  }

  return <primitive object={model} />
}

const Model3DViewer = ({ modelUrl, onClose }: Model3DViewerProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  
  // Determine file type
  const isGLTF = modelUrl.toLowerCase().includes('.glb') || modelUrl.toLowerCase().includes('.gltf')
  const isFBX = modelUrl.toLowerCase().includes('.fbx')

  useEffect(() => {
    // Construct full URL if it's a relative path (use current origin)
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const fullUrl = modelUrl.startsWith('http') ? modelUrl : `${origin}${modelUrl}`
    
    // Test if the model URL is accessible
    fetch(fullUrl, { 
      method: 'HEAD',
      mode: 'cors'
    })
      .then(response => {
        if (!response.ok) {
          console.error('Model URL not accessible:', fullUrl, response.status)
          setHasError(true)
        } else {
          console.log('Model URL accessible:', fullUrl)
        }
        setIsLoading(false)
      })
      .catch((error) => {
        console.error('Error checking model URL:', fullUrl, error)
        setHasError(true)
        setIsLoading(false)
      })
  }, [modelUrl])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-6xl w-full my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-bold text-gray-900">Xem Model 3D</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <Icon icon="solar:close-circle-bold" className="w-6 h-6" />
          </button>
        </div>

        {/* 3D Viewer */}
        <div className="p-6">
          <div className="bg-gray-100 rounded-lg aspect-video relative">
            {isLoading ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Icon icon="solar:loading-bold" className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-gray-600">Đang tải model 3D...</p>
                </div>
              </div>
            ) : hasError ? (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Icon icon="solar:close-circle-bold" className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Không thể tải model 3D</p>
                  <p className="text-sm text-gray-500 mb-4">URL: {modelUrl.startsWith('http') ? modelUrl : `${typeof window !== 'undefined' ? window.location.origin : ''}${modelUrl}`}</p>
                </div>
              </div>
            ) : (
              <Canvas
                camera={{ position: [0, 0, 5], fov: 50 }}
                style={{ width: '100%', height: '100%' }}
              >
                <Environment preset="studio" />
                <ambientLight intensity={0.8} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} />
                <directionalLight position={[-10, -10, -5]} intensity={0.8} />
                <directionalLight position={[0, 10, 0]} intensity={1} />
                <directionalLight position={[0, -10, 0]} intensity={0.6} />
                
                <PresentationControls
                  global
                  rotation={[0, 0, 0]}
                  polar={[-Math.PI / 3, Math.PI / 3]}
                  azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
                >
                  {isGLTF ? (
                    <Model3D url={modelUrl} />
                  ) : isFBX ? (
                    <FBXModel url={modelUrl} />
                  ) : (
                    <mesh>
                      <boxGeometry args={[1, 1, 1]} />
                      <meshStandardMaterial color="gray" />
                    </mesh>
                  )}
                </PresentationControls>
                
                <OrbitControls
                  enablePan={true}
                  enableZoom={true}
                  enableRotate={true}
                  minDistance={1}
                  maxDistance={10}
                />
              </Canvas>
            )}
          </div>

          {/* Controls */}
          <div className="mt-4 flex gap-4 justify-center">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-blue-800 font-medium">Điều khiển:</p>
              <p className="text-xs text-blue-600">Kéo để xoay • Scroll để zoom • Click phải để di chuyển</p>
            </div>
          </div>


          {/* Instructions */}
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Hướng dẫn sử dụng:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Kéo chuột để xoay model</li>
              <li>• Scroll để zoom in/out</li>
              <li>• Click chuột phải để di chuyển</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Model3DViewer
