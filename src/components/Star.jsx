import React, { useMemo } from 'react'
import * as THREE from 'three'

function createGlowTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 32);
    // Natural Light Gradient: White/Yellow -> Orange -> Red -> Transparent
    gradient.addColorStop(0, 'rgba(255, 255, 200, 1)'); // Intense core
    gradient.addColorStop(0.2, 'rgba(255, 200, 50, 0.8)'); // Inner glow
    gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.2)'); // Soft falloff
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)'); // Transparent
    context.fillStyle = gradient;
    context.fillRect(0, 0, 64, 64);
    const texture = new THREE.CanvasTexture(canvas);
    return texture;
}

const Star = React.memo(function Star({ radius = 0.5, intensity = 6 }) {
    const glowTexture = useMemo(() => createGlowTexture(), [])

    return (
        <group>
            {/* Core Sun */}
            <mesh>
                <sphereGeometry args={[radius, 32, 32]} />
                <meshStandardMaterial
                    color="#ffd700"
                    emissive="#ffaa00"
                    emissiveIntensity={intensity / 3}
                    toneMapped={false}
                    transparent={true}
                    opacity={0.9}
                    depthWrite={false}
                />
            </mesh>

            {/* Natural Glow Sprite */}
            <sprite scale={[radius * 8, radius * 8, 1]}>
                <spriteMaterial
                    map={glowTexture}
                    transparent={true}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                    opacity={intensity / 6}
                />
            </sprite>

            {/* Light */}
            <pointLight intensity={intensity} color="#ffaa00" distance={100} decay={2} />
        </group>
    )
})

export default Star
