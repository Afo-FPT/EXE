'use client'

import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'

type ModelProps = {
  url: string
}

function Model({ url }: ModelProps) {
  const { scene } = useGLTF(url)
  return <primitive object={scene} scale={1.5} />
}

export default function ModelViewer({ url }: ModelProps) {
  return (
    <div className='w-[300px] h-[300px] mx-auto'>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <directionalLight position={[-10, -10, -5]} intensity={0.8} />
        <directionalLight position={[0, 10, 0]} intensity={1} />
        <directionalLight position={[0, -10, 0]} intensity={0.6} />
        <Model url={url} />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  )
}
