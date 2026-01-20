import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import Star from './Star'
import Planet from './Planet'
import OrbitPath from './OrbitPath'
import SweptArea from './SweptArea'
import FociHelper from './FociHelper'
import VelocityArrow from './VelocityArrow'

import VoyagerManager from './VoyagerManager'
import VoyagerTrajectory from './VoyagerTrajectory'
import AutoZoom from './AutoZoom'
import EclipticPlane from './EclipticPlane'
import ApsidesHelper from './ApsidesHelper'

const DEG2RAD = Math.PI / 180;

function SceneContent({ config, missionRef, setConfig }) {
    const { a, e, speed, paused, showVector, showArea, showFoci } = config

    const isVoyager = config.name?.includes("Voyager") || !!config.launchTrigger

    // Cinematic Speed for Voyager: Slow down everything by 3x so 1x Slider = 3 real seconds/year
    const effectiveSpeed = isVoyager ? speed / 3.0 : speed

    const handlePhaseChange = (phase) => {
        // Updates the orbit during the mission
        // Phase logic:
        // Launch: a=6, e=0.8
        // Jupiter: a=9, e=1.2
        // Saturn: a=15, e=1.5
        // Uranus: a=22, e=2.0
        // Neptune: a=30, e=2.5

        let newA, newE;
        if (phase === 'parked') { newA = 4.5; newE = 0.017 } // Match Earth
        else if (phase === 'launch') { newA = 7; newE = 0.8 } // Start trajectory
        else if (phase === 'jupiter') { newA = 9; newE = 1.2 }
        else if (phase === 'saturn') { newA = 15; newE = 1.5 }
        else if (phase === 'uranus') { newA = 22; newE = 2.0 }
        else if (phase === 'neptune') { newA = 30; newE = 2.5 }

        if (newA) {
            // We need to update the specific body if in multi-mode
            if (config.bodies) {
                setConfig(prev => ({
                    ...prev,
                    bodies: prev.bodies.map(b => b.name.includes("Voyager") ? { ...b, a: newA, e: newE } : b)
                }))
            } else {
                setConfig(prev => ({ ...prev, a: newA, e: newE }))
            }
        }
    }

    return (
        <>
            <ambientLight intensity={0.1} />
            {/* Star component has its own PointLight */}

            <Stars radius={100} depth={50} count={2000} factor={4} saturation={0} fade={false} />

            <Star radius={0.8} />

            {/* Orbit Visuals */}

            {/* Multi-Body Mode */}
            {config.bodies ? (
                config.bodies.map((body, i) => (
                    <group key={i}>
                        {!body.name.includes("Voyager") && (
                            <OrbitPath a={body.a} e={body.e} color={body.color} opacity={0.3} />
                        )}
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
                            initialOffset={body.initialOffset} // Pass 1977 alignment
                            resetTrigger={config.resetTrigger}
                            showVector={false}
                        />
                    </group>
                ))
            ) : (
                /* Single Body Mode */
                <group rotation={[0, config.i * DEG2RAD, 0]}>
                    {(config.showApsides && e > 0 && e < 1) && <ApsidesHelper a={a} e={e} name={config.name} />}
                    {showArea && <SweptArea a={a} e={e} showApsides={config.showApsides} />}
                    {(showFoci && e < 1) && <FociHelper a={a} e={e} />}
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
                    />
                </group>
            )}

            {/* Show Ecliptic Plane if inclined */}
            {(!config.bodies && config.i > 0) && <EclipticPlane />}

            <OrbitControls makeDefault />

            <VoyagerTrajectory
                launchTrigger={config.launchTrigger}
                speed={effectiveSpeed}
                paused={paused}
            />

            <VoyagerManager
                isVoyager={isVoyager}
                onPhaseChange={handlePhaseChange}
                timerRef={missionRef}
                speed={paused ? 0 : effectiveSpeed}
                launchTrigger={config.launchTrigger}
            />

            <AutoZoom config={config} />
        </>
    )
}

export default function Scene({ config, missionRef, setConfig }) {
    return (
        <div className="w-full h-full bg-black">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, -20, 10]} fov={50} />
                <SceneContent config={config} missionRef={missionRef} setConfig={setConfig} />
            </Canvas>
        </div>
    )
}
