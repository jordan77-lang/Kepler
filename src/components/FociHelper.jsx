import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo, memo } from 'react'
import { useThree } from '@react-three/fiber'

const FociHelper = memo(function FociHelper({ a, e, showFoci, showAxes }) {
    const isHyperbola = e >= 1;
    const { camera } = useThree()
    const camDist = camera.position.length()
    const dotR = Math.max(0.02, camDist * 0.003)

    // Calculate b (Semi-minor axis)
    const b = isHyperbola ? a * Math.sqrt(e * e - 1) : a * Math.sqrt(1 - e * e);

    // Center and empty focus positions for Kepler equation where Sun is at origin
    const centerX = isHyperbola ? (a * e) : (-a * e);
    const emptyFocusX = isHyperbola ? (2 * a * e) : (-2 * a * e);

    // Semi-Major Axis Line (Center to Periapsis)
    // For ellipse, periapsis is at a(1-e). Center is at -ae.
    const semiMajorPoints = useMemo(() => {
        if (isHyperbola) return []; 
        return [new THREE.Vector3(centerX, 0, 0), new THREE.Vector3(a * (1 - e), 0, 0)]
    }, [a, e, centerX, isHyperbola])

    // Semi-Minor Axis Line (Center to top edge)
    const semiMinorPoints = useMemo(() => {
        if (isHyperbola) return [];
        return [new THREE.Vector3(centerX, 0, 0), new THREE.Vector3(centerX, b, 0)]
    }, [centerX, b, isHyperbola])

    return (
        <group>
            {/* --- SEMI-AXES MEASUREMENTS --- */}
            {showAxes && !isHyperbola && (
                <>
                    {/* Semi-Major Axis Line */}
                    <Line
                        points={semiMajorPoints}
                        color="#00ffff"
                        transparent
                        opacity={0.8}
                        lineWidth={2}
                        dashed={true}
                        dashScale={2}
                        dashSize={0.5}
                        gapSize={0.3}
                        toneMapped={false}
                    />
                    {/* Semi-Minor Axis Line */}
                    <Line
                        points={semiMinorPoints}
                        color="#d946ef"
                        transparent
                        opacity={0.8}
                        lineWidth={2}
                        dashed={true}
                        dashScale={2}
                        dashSize={0.5}
                        gapSize={0.3}
                        toneMapped={false}
                    />
                </>
            )}

            {/* --- FOCI AND CENTER POINTS --- */}
            {showFoci && (
                <>
                    {/* Sun Focus Point (Black dot so it's visible on the bright Sun) */}
                    <mesh position={[0, 0, 0]} renderOrder={1}>
                        <sphereGeometry args={[dotR * 1.5, 16, 16]} />
                        <meshBasicMaterial color="#000000" depthTest={false} />
                    </mesh>

                    {/* Sun Focus Label */}
                    <Html position={[0, 0.4, 0]} center>
                        <div className="text-sm font-bold text-white bg-black/70 px-2 py-0.5 rounded pointer-events-none select-none border border-orange-400/40 whitespace-nowrap" style={{ zIndex: 10 }}>
                            Focus
                        </div>
                    </Html>

                    {/* Center Point */}
                    <mesh position={[centerX, 0, 0]}>
                        <sphereGeometry args={[dotR, 16, 16]} />
                        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={5} toneMapped={false} />
                        <Html position={[0, 0.4, 0]} center>
                            <div className="text-sm font-bold text-white bg-black/70 px-2 py-0.5 rounded pointer-events-none select-none border border-white/30 whitespace-nowrap">
                                Center
                            </div>
                        </Html>
                    </mesh>

                    {/* Empty Focus */}
                    <mesh position={[emptyFocusX, 0, 0]}>
                        <sphereGeometry args={[dotR, 16, 16]} />
                        <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={5} toneMapped={false} />
                        <Html position={[0, 0.4, 0]} center>
                            <div className="text-sm font-bold text-white bg-black/70 px-2 py-0.5 rounded pointer-events-none select-none border border-red-400/40 whitespace-nowrap">
                                Empty Focus
                            </div>
                        </Html>
                    </mesh>
                </>
            )}
        </group>
    )
})

export default FociHelper
