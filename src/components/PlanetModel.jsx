import React, { useLayoutEffect } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

export default function PlanetModel({ modelPath, scale = 1, rotation }) {
    const { scene } = useGLTF(modelPath)

    // Manual Geometry Centering
    useLayoutEffect(() => {
        scene.traverse((child) => {
            if (child.isMesh) {
                // Center the geometry's bounding box to (0,0,0)
                child.geometry.center()

                // Reset the mesh's local offset so it sits at the parent's origin
                child.position.set(0, 0, 0)
                child.rotation.set(0, 0, 0)
                child.scale.set(1, 1, 1)
            }
        })
    }, [scene])

    return <primitive object={scene} scale={[scale, scale, scale]} rotation={rotation} />
}
