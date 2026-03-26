import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'

const DEAD_BAND = 0.08

export default function AutoZoom({ config }) {
    const { camera, controls } = useThree()
    const committedDist = useRef(null)
    const isZooming = useRef(false)
    const isFirstMount = useRef(true)

    // Keyed on boolean + inclination only — toggling individual planets never changes these,
    // so this never produces a new object on planet checkbox clicks.
    const isSolar = !!config.bodies
    const normal = useMemo(() => {
        if (isSolar) return new THREE.Vector3(0, 0, 1)
        const rad = (config.i || 0) * Math.PI / 180
        return new THREE.Vector3(Math.sin(rad), 0, Math.cos(rad))
    }, [isSolar, config.i])

    // Returns a stable primitive number. Only changes when maxA or 'a' actually changes.
    // Because this is a number (not an object), the zoom-trigger effect below only
    // fires when the value genuinely changes — toggling Earth with Neptune present
    // keeps maxA=35 → desiredDist=105 → effect never fires → no camera movement.
    const desiredDist = useMemo(() => {
        if (isSolar && config.bodies && config.bodies.length > 0) {
            const maxA = Math.max(...config.bodies.map(b => b.a || 0))
            return Math.max(60, maxA * 3.0)
        }
        if (!isSolar) return Math.max(20, (config.a || 5) * 3.5)
        return 60
    }, [isSolar, config.bodies, config.a])

    // Fires ONLY when desiredDist (a number) actually changes.
    // paused, showVector, resetTrigger, color — none of these ever change desiredDist,
    // so none of them trigger a camera move.
    useEffect(() => {
        const prev = committedDist.current
        const changed = prev === null || Math.abs(desiredDist - prev) / desiredDist > DEAD_BAND
        if (changed) {
            committedDist.current = desiredDist
            isZooming.current = true
        }
    }, [desiredDist])

    // Orient camera when mode or inclination actually switches.
    // Never fires on play/pause, planet checkboxes, or slider changes.
    useEffect(() => {
        camera.up.copy(normal)
        if (controls) controls.target.set(0, 0, 0)
    }, [normal, camera, controls])

    useFrame((_, delta) => {
        if (!isZooming.current) return

        const target = normal.clone().setLength(committedDist.current)

        if (isFirstMount.current) {
            // Snap immediately on first mount — no fly-in animation on page load.
            camera.position.copy(target)
            camera.up.copy(normal)
            camera.lookAt(0, 0, 0)
            if (controls) controls.update()
            isZooming.current = false
            isFirstMount.current = false
            return
        }

        // Smooth lerp for subsequent mode/scale changes.
        const t = 1 - Math.exp(-3 * delta)
        camera.position.lerp(target, t)
        camera.up.copy(normal)
        camera.lookAt(0, 0, 0)
        if (controls) controls.update()

        if (camera.position.distanceTo(target) < 0.1) {
            camera.position.copy(target)
            camera.lookAt(0, 0, 0)
            if (controls) controls.update()
            isZooming.current = false
        }
    })

    return null
}
