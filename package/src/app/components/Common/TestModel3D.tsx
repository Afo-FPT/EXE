'use client'
import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { Icon } from '@iconify/react'

const TestModel3D = () => {
  const [showViewer, setShowViewer] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const testUrl = 'http://localhost:5000/uploads/models/demo.glb'

  const TestModel = () => {
    try {
      const { scene } = useGLTF(testUrl)
      return <primitive object={scene} />
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
      return (
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )
    }
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="font-bold mb-4">Test 3D Model Loading</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-600 mb-2">Test URL: {testUrl}</p>
        <button
          onClick={() => setShowViewer(!showViewer)}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          {showViewer ? 'Hide' : 'Show'} 3D Viewer
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded text-red-700">
          Error: {error}
        </div>
      )}

      {showViewer && (
        <div className="bg-gray-100 rounded-lg aspect-video">
          <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
            <ambientLight intensity={0.8} />
            <directionalLight position={[10, 10, 5]} intensity={1.5} />
            <directionalLight position={[-10, -10, -5]} intensity={0.8} />
            <directionalLight position={[0, 10, 0]} intensity={1} />
            <TestModel />
            <OrbitControls />
          </Canvas>
        </div>
      )}

      <div className="mt-4">
        <a
          href={testUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline text-sm"
        >
          <Icon icon="solar:download-bold" className="w-4 h-4 mr-1" />
          Test Download Link
        </a>
      </div>
    </div>
  )
}

export default TestModel3D
