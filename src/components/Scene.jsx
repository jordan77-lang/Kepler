import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei'
import Star from './Star'
import Planet from './Planet'
import OrbitPath from './OrbitPath'
import SweptArea from './SweptArea'
import FociHelper from './FociHelper'
import AutoZoom from './AutoZoom'
import EclipticPlane from './EclipticPlane'
import ApsidesHelper from './ApsidesHelper'
import * as THREE from 'three'

const DEG2RAD = Math.PI / 180;
const SOLAR_CLASSIC_START_OFFSET = 0

// Locked presets also use the classical orbital-element orientation.
// Ω sets the node line, i tilts the plane, and ω rotates periapsis within that plane.
function orbitalRotation(i_deg, Ω_deg, ω_deg = 0) {
    const i = (i_deg ?? 0) * DEG2RAD
    const Ω = (Ω_deg ?? 0) * DEG2RAD
    const ω = (ω_deg ?? 0) * DEG2RAD
    const rZ1 = new THREE.Matrix4().makeRotationZ(Ω)
    const rX = new THREE.Matrix4().makeRotationX(i)
    const rZ2 = new THREE.Matrix4().makeRotationZ(ω)
    return new THREE.Euler().setFromRotationMatrix(rZ1.multiply(rX).multiply(rZ2), 'XYZ')
}

// Sandbox rotation using the standard ZXZ Euler sequence for orbital mechanics:
//   R_Z(Ω)  — spins ascending node in the ecliptic plane
//   R_X(i)  — tilts the orbital plane relative to the ecliptic
//   R_Z(ω)  — rotates periapsis within the (now tilted) orbital plane
//
// With i=0, Ω and ω are degenerate (both spin in-plane) — physically correct.
// With i>0 they become distinct: Ω moves the nodal line, ω moves periapsis within the plane.
// Applied right-to-left: R_Z(Ω) * R_X(i) * R_Z(ω)
function sandboxRotation(i_deg, Ω_deg, ω_deg) {
    const i = (i_deg ?? 0) * DEG2RAD
    const Ω = (Ω_deg ?? 0) * DEG2RAD
    const ω = (ω_deg ?? 0) * DEG2RAD
    const rZ1 = new THREE.Matrix4().makeRotationZ(Ω)  // ascending node
    const rX  = new THREE.Matrix4().makeRotationX(i)  // inclination
    const rZ2 = new THREE.Matrix4().makeRotationZ(ω)  // argument of periapsis
    // Compose: rZ1 * rX * rZ2 (rightmost applied first)
    return new THREE.Euler().setFromRotationMatrix(rZ1.multiply(rX).multiply(rZ2), 'XYZ')
}

function AnimatedOrbitGroup({ showSolarElements, body, children }) {
    const groupRef = useRef()
    const targetQuaternion = useMemo(() => {
        const rotation = showSolarElements
            ? orbitalRotation(body.i, body.raan, body.argp)
            : new THREE.Euler(0, 0, 0)
        return new THREE.Quaternion().setFromEuler(rotation)
    }, [showSolarElements, body.i, body.raan, body.argp])

    useFrame((_, delta) => {
        if (!groupRef.current) return
        const t = 1 - Math.exp(-5 * delta)
        groupRef.current.quaternion.slerp(targetQuaternion, t)
    })

    return <group ref={groupRef}>{children}</group>
}

function SceneContent({ config }) {
    const { a, e, speed, paused, showVector, showArea, showFoci, showRadius } = config
    const showSolarElements = !!config.showSolarElements
    const showSolarGrid = config.showSolarGrid ?? false

    const effectiveSpeed = speed

    return (
        <>
            <ambientLight intensity={0.1} />
            {/* Star component has its own PointLight */}

            <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade={false} />

            {/* Brighter Sun for Solar System to illuminate distant planets */}
            <Star radius={0.2} intensity={config.bodies ? 20 : 6} />

            {/* Orbit Visuals */}

            {/* Multi-Body Mode */}
            {config.bodies ? (
                config.bodies.map((body, idx) => (
                    <AnimatedOrbitGroup key={idx} body={body} showSolarElements={showSolarElements}>
                        <OrbitPath a={body.a} e={body.e} color={body.color} opacity={0.3} />
                        <Planet
                            a={body.a}
                            e={body.e}
                            speed={effectiveSpeed}
                            paused={paused}
                            radius={body.radius}
                            color={body.color}
                            model={body.model}
                            modelScale={body.scale}
                            name={body.name} // Pass name for detection
                            initialOffset={SOLAR_CLASSIC_START_OFFSET}
                            resetTrigger={config.resetTrigger}
                            showVector={false}
                            solarMode={true} // Enhance visibility for solar system preset
                        />
                    </AnimatedOrbitGroup>
                ))
            ) : (
                /* Single Body Mode */
                <group rotation={config.locked
                    ? orbitalRotation(config.i, config.raan, config.argp)
                    : sandboxRotation(config.i, config.raan, config.argp)
                }>
                    {(config.showApsides && e > 0 && e < 1) && <ApsidesHelper a={a} e={e} />}
                    {showArea && <SweptArea a={a} e={e} showApsides={config.showApsides} />}
                    {((showFoci || config.showAxes) && e < 1) && <FociHelper a={a} e={e} showFoci={showFoci} showAxes={config.showAxes} />}
                    <OrbitPath a={a} e={e} color="#4caf50" />

                    <Planet
                        a={a}
                        e={e}
                        speed={effectiveSpeed}
                        paused={paused}
                        showVector={showVector}
                        radius={config.radius || 0.25}
                        color={config.color || "#4caf50"}
                        model={config.model}
                        modelScale={config.modelScale}
                        resetTrigger={config.resetTrigger}
                        showRadius={showRadius}
                    />
                </group>
            )}

            {config.bodies && showSolarGrid && <EclipticPlane />}

            {/* Show Ecliptic Plane if inclined */}
            {(!config.bodies && ((config.i ?? 0) > 0 || (config.raan ?? 0) > 0)) && <EclipticPlane />}

            <OrbitControls makeDefault />

            <AutoZoom config={config} />
        </>
    )
}

export default function Scene({ config }) {
    return (
        <div className="w-full h-full bg-black">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 45]} up={[0, 1, 0]} fov={50} />
                <SceneContent config={config} />
            </Canvas>
        </div>
    )
}
