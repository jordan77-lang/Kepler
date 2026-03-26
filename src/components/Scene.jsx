import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars, PerspectiveCamera } from '@react-three/drei'
import Star from './Star'
import Planet from './Planet'
import OrbitPath from './OrbitPath'
import SweptArea from './SweptArea'
import FociHelper from './FociHelper'
import AutoZoom from './AutoZoom'
import EclipticPlane from './EclipticPlane'
import ApsidesHelper from './ApsidesHelper'

const DEG2RAD = Math.PI / 180;

function SceneContent({ config }) {
    const { a, e, speed, paused, showVector, showArea, showFoci } = config

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
                config.bodies.map((body, i) => (
                    <group key={i}>
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
                            initialOffset={body.initialOffset}
                            resetTrigger={config.resetTrigger}
                            showVector={false}
                            solarMode={true} // Enhance visibility for solar system preset
                        />
                    </group>
                ))
            ) : (
                /* Single Body Mode */
                <group rotation={[0, config.i * DEG2RAD, 0]}>
                    {(config.showApsides && e > 0 && e < 1) && <ApsidesHelper a={a} e={e} />}
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

            <AutoZoom config={config} />
        </>
    )
}

export default function Scene({ config }) {
    return (
        <div className="w-full h-full bg-black">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 45]} up={[0, 0, 1]} fov={50} />
                <SceneContent config={config} />
            </Canvas>
        </div>
    )
}
