import { useRef, useState, useLayoutEffect, Suspense, useMemo, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useGLTF, Trail } from '@react-three/drei'
import * as THREE from 'three'
import { UniversalKepler } from '../utils/universalKepler'

// Sub-component for GLTF to isolate Suspense
function Model({ url, scale }) {
    const { scene } = useGLTF(url)
    const clone = useMemo(() => scene.clone(), [scene])
    return <primitive object={clone} scale={scale ? [scale, scale, scale] : [0.002, 0.002, 0.002]} />
}

const Planet = memo(function Planet({ a, e, speed, paused, radius, color, showVector, model, modelScale, name, initialOffset = 0, resetTrigger, solarMode = false }) {
    const meshRef = useRef()
    const groupRef = useRef()
    const arrowRef = useRef()

    // Calculate initial time offset
    // n = sqrt(mu / a^3)
    const n = Math.sqrt(10 / Math.pow(a, 3))
    const startTime = n > 0 ? initialOffset / n : 0
    const timeRef = useRef(startTime || 0)

    // Reset time when orbit parameters change substantially
    useLayoutEffect(() => {
        // Default to -7 (Closer Incoming, ~10 AU) for immediate visibility
        const defaultTime = (Math.abs(e - 1) < 0.01 || e >= 1) ? -7 : 0

        if (initialOffset) {
            const n = Math.sqrt(10 / Math.pow(a, 3))
            timeRef.current = initialOffset / n
        } else {
            timeRef.current = defaultTime
        }
    }, [initialOffset, a, e, name, resetTrigger])

    // Physics Engine - Memoized to prevent recreation
    const kepler = useMemo(() => new UniversalKepler(a, e, 10), [a, e])

    // Visual Flags
    const isVoyager = name?.includes("Voyager")
    const isGlowy = isVoyager || name?.includes("Comet") || e >= 0.9

    // Arrow Helper - Memoized
    const arrowHelper = useMemo(() => new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 0), 1, 0xffff00), [])
    const tempVec = useMemo(() => new THREE.Vector3(), [])

    useFrame((state, delta) => {
        if (paused) return;

        timeRef.current += delta * speed;

        const { x, y, vx, vy } = kepler.getState(timeRef.current)

        // 1. Move Group (Zero Allocation)
        if (groupRef.current) {
            groupRef.current.position.set(x, y, 0)
        }

        // 2. Rotate Mesh
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.5
        }

        // 3. Update Vector
        if (showVector && arrowRef.current) {
            // Re-use scratch vector to avoid GC
            tempVec.set(vx, vy, 0)
            const speedMag = Math.sqrt(vx * vx + vy * vy)
            const len = speedMag * 1.5

            arrowRef.current.setDirection(tempVec.normalize())
            arrowRef.current.setLength(len)
        }
    })

    return (
        <group ref={groupRef}>
            <group ref={meshRef}>
                {/* Trail for Voyager */}
                {isVoyager && (
                    <Trail width={2} length={20} color="#00ffff" decay={1} local={false} stride={0} interval={1} attenuation={(width) => width}>
                        <mesh visible={false} />
                    </Trail>
                )}

                <mesh>
                    {model ? (
                        <Suspense fallback={<sphereGeometry args={[radius, 16, 16]} />}>
                            <Model url={model} scale={
                                (modelScale ? modelScale : (radius * 2)) * (solarMode ? 1.5 : 1.0)
                            } />
                        </Suspense>
                    ) : (
                        <>
                            <sphereGeometry args={[radius * (solarMode ? 1.5 : 1.0), 64, 64]} />
                            <meshStandardMaterial
                                color={isVoyager ? "#00ffff" : color}
                                emissive={isVoyager ? "#00ffff" : color}
                                emissiveIntensity={isGlowy ? 2.0 : 0.1}
                                roughness={0.6} metalness={0.2}
                            />

                        </>
                    )}
                </mesh>

                {/* Voyager Spotlight */}
                {isVoyager && <pointLight distance={3} intensity={5} color="cyan" />}
            </group>

            {showVector && (
                <primitive object={arrowHelper} ref={arrowRef} />
            )}
        </group>
    )
})

export default Planet
