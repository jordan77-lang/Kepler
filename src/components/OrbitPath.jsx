import { useMemo, memo } from 'react'
import { Line } from '@react-three/drei'
import * as THREE from 'three'
import { UniversalKepler } from '../utils/universalKepler'

const OrbitPath = memo(function OrbitPath({ a, e, color = "#4caf50" }) {
    const points = useMemo(() => {
        const body = new UniversalKepler(a, e, 1)
        try {
            const pts = body.getOrbitPoints(250) // More segments for smoothness
            return pts
        } catch (err) {
            console.error("Orbit generation failed", err)
            return []
        }
    }, [a, e])

    return (
        <Line
            points={points}
            color={color}
            lineWidth={2}
            opacity={0.6}
            transparent
        />
    )
})

export default OrbitPath
