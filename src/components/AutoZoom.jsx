import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function AutoZoom({ config }) {
    const { camera, controls } = useThree()
    const targetPos = useRef(new THREE.Vector3(0, -20, 10))
    const isZooming = useRef(false)

    useEffect(() => {
        // Calculate target camera position based on selection
        let dist = 30 // Default

        if (config.bodies) {
            // Full Solar System -> Wide View
            dist = 90
        } else {
            // Single body -> Scale based on 'a'
            dist = Math.max(15, config.a * 3.5)
        }

        // We position camera at [0, -dist, dist/2] roughly to look down at angle
        // Current default is [0, -20, 10] looking at 0,0,0
        // Let's look from [0, -dist * 0.8, dist * 0.4]
        targetPos.current.set(0, -dist * 0.8, dist * 0.4)
        isZooming.current = true

        // Stop zooming after 2 seconds
        const timeout = setTimeout(() => { isZooming.current = false }, 2000)
        return () => clearTimeout(timeout)

    }, [config.a, config.bodies, config.name]) // Trigger on these changes

    useFrame((state, delta) => {
        if (isZooming.current) {
            camera.position.lerp(targetPos.current, delta * 2)
            if (controls) controls.update()
        }
    })

    return null
}
