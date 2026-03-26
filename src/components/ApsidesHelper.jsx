import React, { useMemo, memo } from 'react'
import { Html, Line } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

const ApsidesHelper = memo(function ApsidesHelper({ a, e }) {
    const labels = { peri: "Perihelion", apo: "Aphelion" }
    const { camera } = useThree()
    const camDist = camera.position.length()
    // Scale dot with camera distance so it stays visible at any zoom level
    const dotR = Math.max(0.02, camDist * 0.003)
    const isHyperbolic = e >= 1;

    // Calculate positions
    // Periapsis (q): distance a(1-e). Direction +X (per universalKepler.js orientation)
    // Actually, let's verify orientation.
    // In our universalKepler: 
    // Ellipse (e<1): Center at (-ae, 0). Focus at (0,0).
    // Periapsis is at (a(1-e), 0)? 
    // r = a(1-e^2)/(1+e cos nu). At nu=0 -> r = a(1-e). Coords: (r, 0). Correct.

    // Apoapsis (Q): At nu=PI -> r = a(1+e). Coords: (-r, 0).
    // So Apoapsis is at (-a(1+e), 0).

    const q = a * (1 - e)
    const Q = a * (1 + e)

    // Overlap Logic (Smart Labels)
    // If periapsis q is < 1.0 (approx sun radius + text margin), shift label UP
    const isOverlapping = q < 1.0
    const labelPosPeri = isOverlapping ? [0, 1.2, 0] : [0, 0.5, 0]

    const linePoints = useMemo(() => {
        if (!isOverlapping) return null
        return [new THREE.Vector3(q, 0, 0), new THREE.Vector3(q, 1.0, 0)]
    }, [q, isOverlapping])

    return (
        <group>
            {/* Periapsis Callout Line */}
            {isOverlapping && (
                <Line points={linePoints} color="yellow" lineWidth={1} transparent opacity={0.5} />
            )}

            {/* Periapsis Marker & Label */}
            <mesh position={[q, 0, 0]}>
                <sphereGeometry args={[dotR, 16, 16]} />
                <meshStandardMaterial color="#ffff00" emissive="#ffff00" emissiveIntensity={5} toneMapped={false} />
                <Html position={labelPosPeri} center zIndexRange={[100, 0]}>
                    <div className="text-sm font-bold text-white bg-black/70 px-2 py-0.5 rounded pointer-events-none select-none border border-yellow-400/40 whitespace-nowrap">
                        {labels.peri}
                    </div>
                </Html>
            </mesh>

            {/* Apoapsis Marker & Label - Only if not hyperbolic */}
            {!isHyperbolic && (
                <mesh position={[-Q, 0, 0]}>
                    <sphereGeometry args={[dotR, 16, 16]} />
                    <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={5} toneMapped={false} />
                    <Html position={[0, 0.5, 0]} center zIndexRange={[100, 0]}>
                        <div className="text-sm font-bold text-white bg-black/70 px-2 py-0.5 rounded pointer-events-none select-none border border-cyan-400/40 whitespace-nowrap">
                            {labels.apo}
                        </div>
                    </Html>
                </mesh>
            )}
        </group>
    )
})

export default ApsidesHelper
