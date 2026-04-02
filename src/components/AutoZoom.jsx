import { useThree, useFrame } from '@react-three/fiber'
import { useEffect, useRef, useMemo } from 'react'
import * as THREE from 'three'

const DEAD_BAND = 0.08
const LOCKED_PRESET_VIEW_DIRECTION = new THREE.Vector3(0, -0.95, 0.32).normalize()

export default function AutoZoom({ config }) {
    const { camera, controls } = useThree()
    const committedDist = useRef(null)
    const isZooming = useRef(false)
    const isFirstMount = useRef(true)
    const forceResetOrientation = useRef(false)

    const getCameraDirection = () => {
        const target = controls?.target ?? new THREE.Vector3(0, 0, 0)
        const direction = camera.position.clone().sub(target)
        if (direction.lengthSq() < 1e-6) {
            return new THREE.Vector3(0, 0, 1)
        }
        return direction.normalize()
    }

    // Keyed on boolean + inclination + longitude of ascending node — toggling individual planets never changes these,
    // so this never produces a new object on planet checkbox clicks.
    const isSolar = !!config.bodies
    const normal = useMemo(() => {
        if (isSolar) return new THREE.Vector3(0, 0, 1)
        if (config.locked) return LOCKED_PRESET_VIEW_DIRECTION.clone()
        const iRad = (config.i || 0) * Math.PI / 180
        const raanRad = (config.raan || 0) * Math.PI / 180
        const rZ = new THREE.Matrix4().makeRotationZ(raanRad)
        // Matches sandboxRotation(): rZ * rX applied to Z-axis
        const rX = new THREE.Matrix4().makeRotationX(iRad)
        return new THREE.Vector3(0, 0, 1).applyMatrix4(rZ.multiply(rX))
    }, [isSolar, config.i, config.raan, config.locked])

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

    // Reposition camera when orbital plane orientation changes, but only for
    // locked presets (real bodies). In sandbox the user positions the camera freely.
    useEffect(() => {
        if (committedDist.current !== null && config.locked) {
            isZooming.current = true
        }
    }, [normal, config.locked])

    useEffect(() => {
        if (committedDist.current !== null) {
            if (controls) controls.target.set(0, 0, 0)
            forceResetOrientation.current = !!config.bodies
            isZooming.current = true
        }
    }, [config.resetTrigger, controls, config.bodies])

    // Orient camera when mode or inclination actually switches.
    // Never fires on play/pause, planet checkboxes, or slider changes.
    useEffect(() => {
        camera.up.set(0, 1, 0)
        if (controls) controls.target.set(0, 0, 0)
    }, [camera, controls])

    useEffect(() => {
        if (!controls) return

        const handleControlStart = () => {
            if (!isZooming.current) return
            committedDist.current = camera.position.distanceTo(controls.target)
            isZooming.current = false
        }

        controls.addEventListener('start', handleControlStart)
        return () => controls.removeEventListener('start', handleControlStart)
    }, [camera, controls])

    useFrame((_, delta) => {
        if (!isZooming.current) return

        const targetDirection = (isSolar && !forceResetOrientation.current)
            ? getCameraDirection()
            : normal.clone().normalize()
        const target = targetDirection.setLength(committedDist.current)

        if (isFirstMount.current) {
            // Snap immediately on first mount — no fly-in animation on page load.
            camera.position.copy(target)
            camera.up.set(0, 1, 0)
            camera.lookAt(0, 0, 0)
            if (controls) controls.update()
            isZooming.current = false
            forceResetOrientation.current = false
            isFirstMount.current = false
            return
        }

        // Smooth lerp for subsequent mode/scale changes.
        const t = 1 - Math.exp(-3 * delta)
        camera.position.lerp(target, t)
        camera.up.set(0, 1, 0)
        camera.lookAt(0, 0, 0)
        if (controls) controls.update()

        if (camera.position.distanceTo(target) < 0.1) {
            camera.position.copy(target)
            camera.lookAt(0, 0, 0)
            if (controls) controls.update()
            isZooming.current = false
            forceResetOrientation.current = false
        }
    })

    return null
}
