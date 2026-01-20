import React from 'react'


export default function EclipticPlane() {
    return (
        <group rotation={[Math.PI / 2, 0, 0]}> {/* Rotate to lie on XY plane */}
            <polarGridHelper
                args={[40, 16, 8, 64, 0x444444, 0x222222]}
                position={[0, 0, 0]}
            />
            {/* Optional: Add a faint plane to make it more visible or just the grid? */}
        </group>
    )
}
