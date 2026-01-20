import React, { useEffect, useState, useRef, useMemo } from 'react'
import { UniversalKepler } from '../utils/universalKepler'

export default function GraphPanel({ config }) {
    const { a, e, paused, speed } = config
    const [currentPoint, setCurrentPoint] = useState({ r: 0, v: 0 })
    const timeRef = useRef(0)
    const requestRef = useRef()

    // Dimensions
    const width = 350
    const height = 180
    const padding = 20

    // 1. Calculate Theoretical Curve
    const { pathData, bounds } = useMemo(() => {
        // Analytical Bounds ensures stable scaling even if sampling misses peaks
        let rMin, rMax

        if (e < 1) {
            rMin = a * (1 - e)
            rMax = a * (1 + e)
        } else {
            // Escape Orbit: Graph is handled differently or disabled
            return { pathData: "", bounds: { minR: 0, maxR: 100, maxV: 10 } }
        }

        let minR = rMin
        let maxR = rMax

        // Prevent division by zero for circular orbits (e=0 -> minR == maxR)
        if (maxR - minR < 0.001) {
            minR -= 0.5
            maxR += 0.5
        }

        // Max Velocity at Periapsis
        const term = -1 / a
        const maxV = Math.sqrt(10 * (2 / rMin + term))
        const axisMaxV = maxV * 1.35 // Add 35% headroom

        // Generate Path Points
        const steps = 100 // Smooth curve
        const limit = Math.PI

        const points = []

        for (let i = 0; i <= steps; i++) {
            const nu = (i / steps) * limit
            const cosNu = Math.cos(nu)

            const r = (a * (1 - e * e)) / (1 + e * cosNu)
            const v = Math.sqrt(10 * (2 / r - 1 / a))

            points.push({ r, v })
        }

        // scaling functions
        const scaleX = (r) => padding + ((r - minR) / (maxR - minR)) * (width - 2 * padding)
        const scaleY = (v) => (height - padding) - ((v / axisMaxV) * (height - 2 * padding))

        let d = ""
        if (points.length > 0) {
            d = `M ${scaleX(points[0].r)} ${scaleY(points[0].v)}`
            for (let i = 1; i < points.length; i++) {
                d += ` L ${scaleX(points[i].r)} ${scaleY(points[i].v)}`
            }
        }

        return { pathData: d, bounds: { minR, maxR, maxV: axisMaxV } }
    }, [a, e, width, height])

    // 2. Animation Loop (60fps SVG update is cheap)
    useEffect(() => {
        const update = () => {
            if (!paused) {
                const kepler = new UniversalKepler(a, e, 10)
                const { vx, vy, r } = kepler.getState(timeRef.current)

                timeRef.current += (1 / 60) * speed // Match Scene delta (assuming 60fps)

                const v = Math.sqrt(vx * vx + vy * vy)
                setCurrentPoint({ r, v })
            }
            requestRef.current = requestAnimationFrame(update)
        }

        requestRef.current = requestAnimationFrame(update)
        return () => cancelAnimationFrame(requestRef.current)
    }, [a, e, paused, speed])

    // Reset
    useEffect(() => { timeRef.current = 0 }, [a, e, speed])

    // Scale current point
    const { minR, maxR, maxV } = bounds
    const rx = padding + ((currentPoint.r - minR) / (maxR - minR)) * (width - 2 * padding)
    const ry = (height - padding) - ((currentPoint.v / maxV) * (height - 2 * padding))

    // Clamp to graph area
    const cx = Math.max(padding, Math.min(width - padding, rx))
    const cy = Math.max(padding, Math.min(height - padding, ry))

    return (
        <div className="absolute bottom-4 left-4 w-96 h-64 bg-slate-900 border border-slate-700 rounded-xl p-4 text-white shadow-xl z-10">
            <h3 className="text-sm font-bold text-slate-300 mb-2 flex justify-between">
                <span>Phase Plot (v vs r)</span>
            </h3>

            <div className="relative w-full h-full">
                <svg width="100%" height="85%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
                    {/* Axes */}
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#334155" />
                    <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="#334155" />

                    {/* Curve */}
                    <path d={pathData} fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />

                    {/* Point */}
                    <circle cx={cx || padding} cy={cy || height - padding} r="4" fill="#00ffff" />

                    {/* Labels */}
                    <text x={width / 2} y={height} fill="#64748b" fontSize="14" textAnchor="middle">r (AU)</text>
                    <text x="0" y={height / 2} fill="#64748b" fontSize="14" transform={`rotate(-90, 10, ${height / 2})`} textAnchor="middle">v (km/s)</text>
                </svg>

                {/* Value Readout */}
                <div className="absolute top-0 right-0 text-sm font-bold font-mono text-cyan-400">
                    r: {currentPoint.r.toFixed(2)} | v: {currentPoint.v.toFixed(2)}
                </div>
            </div>
        </div>
    )
}
