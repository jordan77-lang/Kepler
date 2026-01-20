import { Html, Line } from '@react-three/drei'
import * as THREE from 'three'
import { useMemo, memo } from 'react'

const FociHelper = memo(function FociHelper({ a, e }) {
    const isHyperbola = e >= 1;

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
                color={new THREE.Color(4, 4, 4)} // HDR White for Glow
                transparent
                opacity={0.6}
                lineWidth={1}
                toneMapped={false}
            />

            {/* Center Point */}
            <mesh position={[centerX, 0, 0]}>
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={5} toneMapped={false} />
                <Html position={[0, 0.4, 0]} center>
                    <div className="text-xs font-bold text-white/50 font-mono whitespace-nowrap px-1 py-0.5 pointer-events-none select-none">
                        Center
                    </div>
                </Html>
            </mesh>

            {/* Empty Focus */}
            <mesh position={[emptyFocusX, 0, 0]}>
                <sphereGeometry args={[0.025, 16, 16]} />
                <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={5} toneMapped={false} />
                <Html position={[0, 0.4, 0]} center>
                    <div className="text-xs font-bold text-red-400/80 font-mono whitespace-nowrap px-1 py-0.5 pointer-events-none select-none">
                        Empty Focus
                    </div>
                </Html>
            </mesh>

            {/* Sun Label - Keep existing style but simpler */}
        </group>
    )
})

export default FociHelper
