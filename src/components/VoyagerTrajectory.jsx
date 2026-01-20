import { useMemo, useRef, useEffect, memo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Line, useGLTF, Trail } from '@react-three/drei'
import * as THREE from 'three'
import { UniversalKepler } from '../utils/universalKepler'
import { PRESETS } from '../data/presets'

// Mission Timeline (Years from Launch)
const EVENTS = [
    { t: 0.0, body: 'Earth' },
    { t: 1.7, body: 'Jupiter' }, // Adjusted for visual timing
    { t: 3.5, body: 'Saturn' },
    { t: 8.0, body: 'Uranus' },
    { t: 12.0, body: 'Neptune' },
    { t: 18.0, body: 'Exit' } // Deep space
]

const VoyagerTrajectory = memo(function VoyagerTrajectory({ launchTrigger, speed, paused }) {
    const meshRef = useRef()
    const timeRef = useRef(0)

    // OPTIMIZATION: Reusable Vector3 objects to avoid per-frame allocation
    const posRef = useRef(new THREE.Vector3())
    const lookTargetRef = useRef(new THREE.Vector3())

    const SEC_PER_YEAR = 1.0 // Normalized

    // Reset Time when Launch Triggers
    useEffect(() => {
        if (launchTrigger) {
            timeRef.current = 0
        }
    }, [launchTrigger])

    // 1. Calculate the Target Points for the Spline
    const pathPoints = useMemo(() => {
        // We need to simulate where the planets WILL be at the encounter times.
        // We replicate the logic from Planet.jsx

        const getPlanetPos = (name, time) => {
            const p = PRESETS.find(x => x.name === name)
            if (!p) return new THREE.Vector3(20, 20, 0) // Fallback for Exit

            // Hardcoded initial offsets from Controls.jsx "LAUNCH" logic
            let offset = 0
            if (name === "Earth") offset = 5.71
            if (name === "Jupiter") offset = 1.57
            if (name === "Saturn") offset = 2.46
            if (name === "Uranus") offset = 3.80
            if (name === "Neptune") offset = 4.41

            const kepler = new UniversalKepler(p.a, p.e, 10)

            // n = sqrt(mu / a^3)
            const n = Math.sqrt(10 / Math.pow(p.a, 3))

            // Current Time logic in Planet.jsx: timeRef.current += delta * speed
            // Here `time` IS the simulation time (years).
            // But Planet starts with `timeRef.current = initialOffset / n`.
            // So M = n * t_sim. 
            // Actually Planet.jsx logic:
            // timeRef initial = offset / n.
            // timeRef += delta.
            // state = getState(timeRef).
            // So M = n * timeRef = n * (offset/n + delta_acc) = offset + n * delta_acc.
            // Correct.

            const totalTime = (offset / n) + time
            const state = kepler.getState(totalTime)
            return new THREE.Vector3(state.x, state.y, 0)
        }

        const points = EVENTS.map(e => {
            if (e.body === 'Exit') {
                // Extrapolate past Neptune
                const nep = getPlanetPos('Neptune', 12.0)
                return nep.clone().multiplyScalar(1.5)
            }
            return getPlanetPos(e.body, e.t)
        })

        return points
    }, [])

    // 2. Create Curve
    const curve = useMemo(() => {
        // CatmullRom for smooth interpolation
        return new THREE.CatmullRomCurve3(pathPoints, false, 'catmullrom', 0.5)
    }, [pathPoints])

    // 3. Render Points (Debug/Path)
    const linePoints = useMemo(() => curve.getPoints(200), [curve])

    // 4. Animation Frame
    useFrame((state, delta) => {
        if (!launchTrigger || paused) return

        // Time since launch (in simulation years)
        timeRef.current += (delta * speed) / SEC_PER_YEAR

        const duration = 18.0
        const t = timeRef.current

        // OPTIMIZATION: Reuse cached Vector3 objects
        const pos = posRef.current
        const lookTarget = lookTargetRef.current

        if (t <= duration) {
            // Map Sim Time to Spline T (Piecewise Linear) to match exact Encounters
            let progress = 0

            if (t < 1.7) {
                progress = (t / 1.7) * 0.2
            } else if (t < 3.5) {
                progress = 0.2 + ((t - 1.7) / (3.5 - 1.7)) * 0.2
            } else if (t < 8.0) {
                progress = 0.4 + ((t - 3.5) / (8.0 - 3.5)) * 0.2
            } else if (t < 12.0) {
                progress = 0.6 + ((t - 8.0) / (12.0 - 8.0)) * 0.2
            } else {
                progress = 0.8 + ((t - 12.0) / (18.0 - 12.0)) * 0.2
            }

            // getPoint with target parameter mutates the target instead of creating new Vector3
            curve.getPoint(Math.min(progress, 1), pos)
            curve.getPoint(Math.min(progress + 0.01, 1), lookTarget)
        } else {
            // Extrapolate Linearly into Interstellar Space
            // Note: getPoint/getTangent without target create new Vector3, but this path is rare
            curve.getPoint(1, pos)
            const tangent = curve.getTangent(1) // This still allocates but only in "exit" phase
            const tOver = t - duration
            const speedAU = 2.5

            pos.add(tangent.multiplyScalar(tOver * speedAU))
            lookTarget.copy(pos).add(tangent)
        }

        if (meshRef.current) {
            meshRef.current.position.copy(pos)
            meshRef.current.lookAt(lookTarget)
        }
    })

    if (!launchTrigger) return null

    return (
        <group>
            {/* The Flight Path */}
            <Line points={linePoints} color="#00ffff" opacity={0.3} transparent lineWidth={1} dashed dashSize={0.2} gapSize={0.1} />

            {/* The Voyager Probe */}
            <group ref={meshRef}>
                <Trail width={2} length={20} color="#00ffff" decay={1} local={false} stride={0} interval={1}>
                    <mesh>
                        <sphereGeometry args={[0.15, 16, 16]} />
                        <meshBasicMaterial color="#00ffff" />
                    </mesh>
                </Trail>
                <pointLight distance={3} intensity={5} color="cyan" />

                {/* Halo */}
                <mesh scale={[2, 2, 2]}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshBasicMaterial color="#00ffff" opacity={0.4} transparent side={THREE.DoubleSide} />
                </mesh>
            </group>
        </group>
    )
})

export default VoyagerTrajectory
