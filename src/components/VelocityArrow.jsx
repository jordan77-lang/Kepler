import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ArrowHelper, Vector3 } from 'three'
import { UniversalKepler } from '../utils/universalKepler'

export default function VelocityArrow({ a, e, speed, paused }) {
    const arrowRef = useRef()
    const timeRef = useRef(0)
    const kepler = new UniversalKepler(a, e, 10)

    useFrame((state, delta) => {
        if (paused) return;
        timeRef.current += delta * speed;

        const { position, velocity } = kepler.getState(timeRef.current)

        if (arrowRef.current) {
            // Position arrow at planet
            arrowRef.current.position.copy(position)

            // Set direction
            const dir = velocity.clone().normalize()
            const len = velocity.length() * 1.5

            arrowRef.current.setDirection(dir)
            arrowRef.current.setLength(len)
        }
    })

    return (
        <primitive
            object={new ArrowHelper(new Vector3(1, 0, 0), new Vector3(0, 0, 0), 1, 0xffff00)}
            ref={arrowRef}
        />
    )
}
