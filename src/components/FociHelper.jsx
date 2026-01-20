import { Html } from '@react-three/drei'
import * as THREE from 'three'

export default function FociHelper({ a, e }) {
    // Ellipse: Focus at (0,0) and (-2ae, 0) IF perihelion is at +x?
    // Our UniversalKepler puts perihelion at +x.
    // Ellipse center at (-ae, 0).
    const isHyperbola = e >= 1;

    // For ellipse: c = ae. Center = -ae (since focus is at origin). Empty focus at -2ae.
    // For hyperbola: Center is at +ae?
    // Standard hyperbola x^2/a^2 - y^2/b^2 = 1. Center (0,0). Foci (+- ae, 0).
    // Our solver puts Sun at (0,0). So Center is at (-ae, 0) or (+ae, 0)?
    // x = a(e - cosh H). Periapsis (H=0) x = a(e-1).
    // Center of hyperbola is "behind" the periapsis by 'a'. 
    // Distance from Center to Periapsis is 'a'.
    // Distance from Center to Focus is 'ae'.
    // So Sun (Focus) is at (0,0).
    // Periapsis at x = a(e-1).
    // Center is at x = a(e-1) + a = ae? No.
    // Center to Focus = ae.
    // Focus is (0,0).
    // Center is at (ae, 0) or (-ae, 0)?
    // If Center is (ae, 0), then Focus1 at (0,0), Focus2 at (2ae, 0).
    // Vertex1 at (ae-a, 0) = (a(e-1), 0). Matches solver!
    // So Center is at (ae, 0).
    // Empty Focus is at (2ae, 0).

    // Ellipse: Center (-ae, 0). Empty Focus (-2ae, 0).

    const centerX = isHyperbola ? (a * e) : (-a * e);
    const emptyFocusX = isHyperbola ? (2 * a * e) : (-2 * a * e);

    return (
        <group>
            {/* Major Axis Line */}
            {/* Length: Infinite for Hyperbola ideally, but let's draw a long line */}
            <mesh position={[centerX, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[0.05, 0.05, isHyperbola ? a * 10 : 2 * a, 8]} />
                <meshBasicMaterial color="#ffffff" opacity={0.6} transparent />
            </mesh>

            {/* Center Point */}
            <mesh position={[centerX, 0, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#aaaaaa" emissive="#aaaaaa" emissiveIntensity={2} toneMapped={false} />
                <Html position={[0, 0.6, 0]} center>
                    <div className="text-sm font-bold text-white font-mono whitespace-nowrap px-2 py-1 bg-black/60 rounded border border-white/20 backdrop-blur-sm">
                        Center
                    </div>
                </Html>
            </mesh>

            {/* Empty Focus */}
            <mesh position={[emptyFocusX, 0, 0]}>
                <sphereGeometry args={[0.08, 16, 16]} />
                <meshStandardMaterial color="#ff4444" emissive="#ff4444" emissiveIntensity={2} toneMapped={false} />
                <Html position={[0, 0.6, 0]} center>
                    <div className="text-sm font-bold text-red-400 font-mono whitespace-nowrap px-2 py-1 bg-black/60 rounded border border-red-500/30 backdrop-blur-sm">
                        Empty Focus
                    </div>
                </Html>
            </mesh>

            {/* Sun Label */}
            <Html position={[0, -0.6, 0]} center>
                <div className="text-sm font-bold text-yellow-300 font-mono whitespace-nowrap px-2 py-1 bg-black/60 rounded border border-yellow-500/30 backdrop-blur-sm">
                    Focus 1 (Sun)
                </div>
            </Html>
        </group>
    )
}
