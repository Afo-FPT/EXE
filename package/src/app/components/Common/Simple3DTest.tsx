'use client'
import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Icon } from '@iconify/react'

const Simple3DTest = () => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const testUrls = [
    'http://localhost:5000/uploads/models/demo.glb',
    'http://localhost:5000/uploads/models/model-1759198863487-621154019.obj'
  ]

  const TestModel = ({ url }: { url: string }) => {
    try {
      const { scene } = useGLTF(url)
      setStatus('success')
      return <primitive object={scene} />
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error')
      return (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )
    }
  }

  const testUrl = (url: string) => {
    setStatus('loading')
    setErrorMessage('')
    
    // Test if URL is accessible
    fetch(url, { method: 'HEAD' })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        console.log('URL accessible:', url)
      })
      .catch(error => {
        setStatus('error')
        setErrorMessage(`Cannot access URL: ${error.message}`)
      })
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Simple 3D Model Test</h2>
      
      {/* Status */}
      <div className="mb-4">
        <div className={`p-3 rounded-lg ${
          status === 'idle' ? 'bg-gray-100' :
          status === 'loading' ? 'bg-yellow-100' :
          status === 'success' ? 'bg-green-100' :
          'bg-red-100'
        }`}>
          <div className="flex items-center gap-2">
            {status === 'idle' && <Icon icon="solar:info-circle-bold" className="w-5 h-5" />}
            {status === 'loading' && <Icon icon="solar:loading-bold" className="w-5 h-5 animate-spin" />}
            {status === 'success' && <Icon icon="solar:check-circle-bold" className="w-5 h-5 text-green-600" />}
            {status === 'error' && <Icon icon="solar:close-circle-bold" className="w-5 h-5 text-red-600" />}
            <span className="font-medium">
              {status === 'idle' && 'Ready to test'}
              {status === 'loading' && 'Testing...'}
              {status === 'success' && 'Success!'}
              {status === 'error' && 'Error'}
            </span>
          </div>
          {errorMessage && (
            <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
          )}
        </div>
      </div>

      {/* Test URLs */}
      <div className="mb-4">
        <h3 className="font-medium mb-2">Test URLs:</h3>
        <div className="space-y-2">
          {testUrls.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <button
                onClick={() => testUrl(url)}
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
              >
                Test {index + 1}
              </button>
              <span className="text-sm text-gray-600 font-mono">{url}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 3D Viewer */}
      <div className="mb-4">
        <h3 className="font-medium mb-2">3D Viewer:</h3>
        <div className="bg-gray-100 rounded-lg aspect-video">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            <directionalLight position={[-10, -10, -5]} intensity={0.8} />
            <directionalLight position={[0, 10, 0]} intensity={1} />
            <TestModel url={testUrls[0]} />
            <OrbitControls />
          </Canvas>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Instructions:</h3>
        <ol className="text-sm text-blue-800 space-y-1">
          <li>1. Click "Test 1" để kiểm tra file GLB</li>
          <li>2. Click "Test 2" để kiểm tra file OBJ</li>
          <li>3. Nếu có lỗi, kiểm tra backend có chạy không</li>
          <li>4. Kiểm tra file có tồn tại trong uploads/models không</li>
        </ol>
      </div>
    </div>
  )
}

export default Simple3DTest
