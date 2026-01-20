import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { UniversalKepler } from '../utils/universalKepler'

export default function SweptArea({ a, e, count = 12, color = "#ff00dd", opacity = 0.2, showApsides = false }) {
    const shapes = useMemo(() => {
        // e >= 1 logic: Area sweeping is complex (Hyperbolic sector).
        // For now, let's limit swept area tool to Elliptic only to avoid crashes or infinite areas.
        if (e >= 1) return [];

        const body = new UniversalKepler(a, e, 1)
        const period = 2 * Math.PI * Math.sqrt(Math.pow(a, 3))
        const dt = period / count

        const shapesList = []

        for (let i = 0; i < count; i++) {
            const tStart = i * dt
            const tEnd = (i + 1) * dt

            // Create shape
            const shape = new THREE.Shape()
            shape.moveTo(0, 0)

            // Sample points
            const samples = 10
            for (let j = 0; j <= samples; j++) {
                const t = tStart + (tEnd - tStart) * (j / samples)
                const { x, y } = body.getState(t)
                shape.lineTo(x, y)
            }

            shape.lineTo(0, 0)

            // Store points for labeling
            // Start point is at tStart
            const startState = body.getState(tStart)
            const endState = body.getState(tEnd)

            shapesList.push({
                shape,
                startPoint: new THREE.Vector3(startState.x, startState.y, 0),
                endPoint: new THREE.Vector3(endState.x, endState.y, 0)
            })
        }
        return shapesList
    }, [a, e, count])

    return (
        <group position={[0, 0, -0.01]}>
            {shapes.map((shape, index) => {
                // The last point in the shape definition is the point on the orbit (before closing to 0,0)
                // Actually in our loop: lineTo(x,y) happens 10 times. 
                // We want the Start point of this sector and the End point.
                // But since sectors are contiguous, Sector i's start is Sector i-1's end.
                // Let's label the START point of each sector.
                // shape.curves is not easy to parse directly in R3F.
                // Let's pass the points out of useMemo or just re-calculate for labels?
                // Better: return objects with { shape, startPoint, endPoint } from useMemo.

                // For now, let's use the 'getPoint(1)' approach roughly, or better yet, refactor useMemo below.
                return (
                    <mesh key={index}>
                        <shapeGeometry args={[shape.shape]} />
                        <meshBasicMaterial
                            color={index % 2 === 0 ? color : lighten(color)}
                            opacity={opacity}
                            transparent
                            side={THREE.DoubleSide}
                        />
                        {/* Label at the orbital point (End of the sector) */}
                        {/* If Apsides are shown, hide the label that lands on Apoapsis (index + 1 == count/2) */}
                        {/* Actually, count is usually even (12). t_6 is at Apoapsis. index=5 -> t_6. */}
                        {!(showApsides && (index + 1) === count / 2) && (
                            <Html position={[shape.endPoint.x, shape.endPoint.y, 0]} center zIndexRange={[100, 0]}>
                                <div className="text-base font-bold text-white font-mono pointer-events-none select-none drop-shadow-md bg-black/60 px-2 py-0.5 rounded border border-white/20">
                                    t<sub>{index + 1}</sub>
                                </div>
                            </Html>
                        )}

                        {/* Also label t0 for the very first one */}
                        {/* Hide t0 if Apsides shown (overlaps Periapsis) */}
                        {(index === 0 && !showApsides) && (
                            <Html position={[shape.startPoint.x, shape.startPoint.y, 0]} center zIndexRange={[100, 0]}>
                                <div className="text-base font-bold text-white font-mono pointer-events-none select-none drop-shadow-md bg-black/60 px-2 py-0.5 rounded border border-white/20">
                                    t<sub>0</sub>
                                </div>
                            </Html>
                        )}
                    </mesh>
                )
            })}
        </group>
    )
}

function lighten(color) {
    const c = new THREE.Color(color)
    c.offsetHSL(0, 0, 0.2)
    return c
}
