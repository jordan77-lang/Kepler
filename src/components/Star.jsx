import React from 'react'
import { useTexture } from '@react-three/drei'

export default function Star({ radius = 0.5 }) {
    return (
        <mesh>
            <sphereGeometry args={[radius, 32, 32]} />
            <meshStandardMaterial
                color="#ffd700"
                emissive="#ff8c00"
                emissiveIntensity={2}
                toneMapped={false}
                transparent={true}
                opacity={0.6}
                depthWrite={false}
            />
            <pointLight intensity={2} color="#ffd700" distance={100} decay={2} />
        </mesh>
    )
}
