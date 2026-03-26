import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo, memo } from 'react'
import { useThree } from '@react-three/fiber'

const FociHelper = memo(function FociHelper({ a, e }) {
    const isHyperbola = e >= 1;
    const { camera } = useThree()
    const camDist = camera.position.length()
    const dotR = Math.max(0.02, camDist * 0.003)

    // Line Points calculation
    // Ellipse: from periapsis (a(1-e), 0, 0) to apoapsis (-a(1+e), 0, 0)
    // Hyperbola: from periapsis to... well, infinite. Let's draw a segment.

    const linePoints = useMemo(() => {
        if (isHyperbola) {
            // Draw from finite distance behind focus to periapsis
            // Center is at (ae, 0). Periapsis is at (a(e-1), 0).
            // Let's draw a nice axis line through the focus.
            return [new THREE.Vector3(-a * 2, 0, 0), new THREE.Vector3(a * 5, 0, 0)]
        } else {
            // Periapsis at x = a(1-e) ? No, in our Kepler solver, periapsis is at x=a(e-1)?
            // Wait, let's check UniversalKepler orientation for e<1.
            // At t=0, x = a(cos(E)-e). If E=0 -> x = a(1-e). This is periapsis. Valid.
            // At E=PI -> x = a(-1-e) = -a(1+e). This is apoapsis. Valid.

            return [new THREE.Vector3(a * (1 - e), 0, 0), new THREE.Vector3(-a * (1 + e), 0, 0)]
        }
    }, [a, e, isHyperbola])

    const centerX = isHyperbola ? (a * e) : (-a * e);
    const emptyFocusX = isHyperbola ? (2 * a * e) : (-2 * a * e);

    return (
        <group>
            {/* Major Axis Line */}
            <Line
                points={linePoints}
                color="#ffffff"
                transparent
                opacity={0.8}
                lineWidth={1.5}
                toneMapped={false}
            />
            <Html position={[0, 0.35, 0]} center>
                <div className="text-sm font-bold text-white bg-black/70 px-2 py-0.5 rounded pointer-events-none select-none border border-white/30">
                    Major Axis
                </div>
            </Html>

            {/* Center Point */}
            <mesh position={[centerX, 0, 0]}>
                <sphereGeometry args={[dotR, 16, 16]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={5} toneMapped={false} />
                <Html position={[0, 0.4, 0]} center>
                    <div className="text-sm font-bold text-white bg-black/70 px-2 py-0.5 rounded pointer-events-none select-none border border-white/30">
                        Center
                    </div>
                </Html>
            </mesh>

            {/* Empty Focus */}
            <mesh position={[emptyFocusX, 0, 0]}>
                <sphereGeometry args={[dotR, 16, 16]} />
                <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={5} toneMapped={false} />
                <Html position={[0, 0.4, 0]} center>
                    <div className="text-sm font-bold text-white bg-black/70 px-2 py-0.5 rounded pointer-events-none select-none border border-red-400/40">
                        Focus
                    </div>
                </Html>
            </mesh>

            {/* Sun Label - Keep existing style but simpler */}
        </group>
    )
})

export default FociHelper
