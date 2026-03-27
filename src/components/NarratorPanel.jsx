import { useEffect, useRef, useState, useMemo } from 'react'
import { UniversalKepler } from '../utils/universalKepler'

// ---- Description generators ----

function describeEccentricity(e) {
    if (e === 0)       return 'perfectly circular'
    if (e < 0.1)       return 'nearly circular'
    if (e < 0.4)       return 'slightly elliptical'
    if (e < 0.7)       return 'elliptical'
    if (e < 0.95)      return 'highly elliptical'
    if (e < 1.0)       return 'near-parabolic (long-period comet-like)'
    if (e === 1.0)     return 'parabolic — exactly at escape velocity'
    return 'hyperbolic — unbound, escape trajectory'
}

function describePosition(r, rMin, rMax) {
    if (rMax - rMin < 0.01) return 'in a circular orbit at constant distance'
    const fraction = (r - rMin) / (rMax - rMin)
    if (fraction < 0.15) return 'near perihelion — closest approach to the star'
    if (fraction > 0.85) return 'near aphelion — farthest point from the star'
    return 'in mid-orbit'
}

function describeLaw(config, time) {
    if (config.bodies) {
        const names = config.bodies.map(b => b.name).join(', ')
        
        // Calculate dynamic speeds for all active bodies
        const speeds = config.bodies.map(b => {
            const kepler = new UniversalKepler(b.a, b.e, 10)
            const n = Math.sqrt(10 / Math.pow(b.a, 3))
            const startTime = b.initialOffset ? (n > 0 ? b.initialOffset / n : 0) : 0
            const state = kepler.getState(startTime + time)
            const v = Math.sqrt(state.vx * state.vx + state.vy * state.vy)
            return { name: b.name, a: b.realA || b.a, v: v }
        })
        
        // Sort by distance (a)
        speeds.sort((x, y) => x.a - y.a)
        const speedText = speeds.map(s => `\u2022 ${s.name}: ${s.v.toFixed(2)} km/s at ${s.a.toFixed(2)} AU`).join('\n')

        return {
            mode: "Kepler's 3rd Law",
            bodies: names,
            law: `Live Orbital Speeds:\n${speedText}`
        }
    }
    return null
}

function buildDescription(config, time, r, v, rMin, rMax) {
    // Multi-body (3rd Law) mode
    const lawData = describeLaw(config, time)
    if (lawData) {
        const lines = [
            `Mode: ${lawData.mode}`,
            `Bodies: ${lawData.bodies}`,
            '',
            lawData.law,
        ]
        if (config.paused) lines.push('', 'The simulation is currently paused.')
        return lines.join('\n')
    }

    // Single-body (2nd Law / Explore) mode
    const bodyName = config.activePreset && config.activePreset !== 'Sandbox'
        ? config.activePreset
        : 'custom body'

    const eDesc = describeEccentricity(config.e)
    const posDesc = config.e < 1 ? describePosition(r, rMin, rMax) : 'on a one-way hyperbolic flyby'

    const speedQual = config.e < 1
        ? (r <= rMin * 1.15 ? 'near its maximum velocity' :
           r >= rMax * 0.85 ? 'near its minimum velocity' :
           'at moderate velocity')
        : 'accelerating as it approaches perihelion'

    const overlays = []
    if (config.showVector) overlays.push('velocity vector')
    if (config.showArea)   overlays.push('swept areas')
    if (config.showFoci)   overlays.push('foci and major axis')
    if (config.showApsides) overlays.push('perihelion/aphelion labels')

    const lines = [
        `Mode: Explore Body \u2014 ${bodyName}`,
        `Orbit type: ${eDesc} (e = ${config.e.toFixed(3)})`,
    ]

    if (config.e < 1) {
        lines.push(`Semi-major axis: ${(config.realA || config.a).toFixed(2)} AU`)
        lines.push(`Position: ${posDesc}`)
        lines.push(`Speed: ${v.toFixed(2)} \u2014 ${speedQual}`)
    } else {
        lines.push(`Position: ${posDesc}`)
        lines.push(`Current radius: ${r.toFixed(2)} (simulation units)`)
    }

    if (overlays.length > 0) {
        lines.push('')
        lines.push(`Active overlays: ${overlays.join(', ')}.`)
    }

    if (config.paused) lines.push('', 'The simulation is currently paused.')

    return lines.join('\n')
}

// ---- Component ----

export default function NarratorPanel({ config }) {
    const { a, e, speed, paused } = config

    const keplerRef = useRef(new UniversalKepler(a, e, 10))
    const timeRef   = useRef(0)
    const rafRef    = useRef()

    const [description, setDescription] = useState('')

    // Recalculate bounds for position description
    const { rMin, rMax } = useMemo(() => {
        if (e >= 1 || config.bodies) return { rMin: 0, rMax: 1 }
        return { rMin: a * (1 - e), rMax: a * (1 + e) }
    }, [a, e, config.bodies])

    // Rebuild physics engine on param change
    useEffect(() => {
        keplerRef.current = new UniversalKepler(a, e, 10)
        timeRef.current   = 0
    }, [a, e])

    // Advance time and update description every 4 seconds
    useEffect(() => {
        let lastUpdate = 0

        const tick = (timestamp) => {
            if (!paused) {
                timeRef.current += (1 / 60) * speed
            }

            if (timestamp - lastUpdate >= 4000) {
                lastUpdate = timestamp
                const { r, vx, vy } = keplerRef.current.getState(timeRef.current)
                const v = Math.sqrt(vx * vx + vy * vy)
                setDescription(buildDescription(config, timeRef.current, r, v, rMin, rMax))
            }

            rafRef.current = requestAnimationFrame(tick)
        }

        // Generate immediately on mount / config change
        const { r, vx, vy } = keplerRef.current.getState(timeRef.current)
        const v = Math.sqrt(vx * vx + vy * vy)
        setDescription(buildDescription(config, timeRef.current, r, v, rMin, rMax))

        rafRef.current = requestAnimationFrame(tick)
        return () => cancelAnimationFrame(rafRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [a, e, speed, paused, rMin, rMax, config.bodies, config.showVector,
        config.showArea, config.showFoci, config.showApsides, config.activePreset])

    return (
        <div
            className="absolute bottom-4 left-4 z-40 max-w-sm w-[calc(100vw-2rem)] md:w-80 bg-slate-900/80 backdrop-blur-md border border-slate-700/60 rounded-xl p-4 text-white shadow-2xl"
            role="region"
            aria-label="Simulation narrator"
        >
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">
                Simulation Narrator
            </p>

            <div
                aria-live="polite"
                aria-atomic="true"
                className="text-xs text-slate-200 leading-relaxed whitespace-pre-line"
            >
                {description || 'Loading description…'}
            </div>
        </div>
    )
}
