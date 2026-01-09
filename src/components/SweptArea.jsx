import { useMemo } from 'react'
import * as THREE from 'three'
import { UniversalKepler } from '../utils/universalKepler'

export default function SweptArea({ a, e, count = 12, color = "#ff00dd", opacity = 0.2 }) {
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
            shapesList.push(shape)
        }
        return shapesList
    }, [a, e, count])

    return (
        <group position={[0, 0, -0.01]}>
            {shapes.map((shape, index) => (
                <mesh key={index}>
                    <shapeGeometry args={[shape]} />
                    <meshBasicMaterial
                        color={index % 2 === 0 ? color : lighten(color)}
                        opacity={opacity}
                        transparent
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}
        </group>
    )
}

function lighten(color) {
    const c = new THREE.Color(color)
    c.offsetHSL(0, 0, 0.2)
    return c
}
