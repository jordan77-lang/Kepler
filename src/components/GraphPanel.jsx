import React, { useEffect, useState, useRef, useMemo } from 'react'
import { UniversalKepler } from '../utils/universalKepler'



export default function GraphPanel({ config }) {
    const { a, e, paused, speed } = config

    // Use Refs for direct DOM updates to avoid React Render Cycle at 60fps
    const timeRef = useRef(0)
    const requestRef = useRef()
    const pointRef = useRef()
    const textRef = useRef()

    // Cache the physics engine
    const keplerRef = useRef(new UniversalKepler(a, e, 10))

    // Dimensions
    const width = 350
    const height = 180
    const padding = 20

    // Update Physik Engine when props change
    useEffect(() => {
        keplerRef.current = new UniversalKepler(a, e, 10)
    }, [a, e])

    // 1. Calculate Theoretical Curve (Memoized purely for the background path)
    const { pathData, bounds } = useMemo(() => {
        let rMin, rMax

        if (e < 1) {
            rMin = a * (1 - e)
            rMax = a * (1 + e)
        } else {
            return { pathData: "", bounds: { minR: 0, maxR: 100, maxV: 10 } }
        }

        let minR = rMin
        let maxR = rMax

        if (maxR - minR < 0.001) {
            minR -= 0.5
            maxR += 0.5
        }

        const term = -1 / a
        const maxV = Math.sqrt(10 * (2 / rMin + term))
        const axisMaxV = maxV * 1.35

        const steps = 100
        const limit = Math.PI
        const points = []

        for (let i = 0; i <= steps; i++) {
            const nu = (i / steps) * limit
            const cosNu = Math.cos(nu)
            const r = (a * (1 - e * e)) / (1 + e * cosNu)
            const v = Math.sqrt(10 * (2 / r - 1 / a))
            points.push({ r, v })
        }

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

    // 2. Animation Loop (Updates DOM directly)
    useEffect(() => {
        const update = () => {
            if (!paused) {
                const { vx, vy, r } = keplerRef.current.getState(timeRef.current)
                timeRef.current += (1 / 60) * speed

                const v = Math.sqrt(vx * vx + vy * vy)

                // Direct DOM update - Zero React Overhead
                if (pointRef.current) {
                    const { minR, maxR, maxV } = bounds
                    const rx = padding + ((r - minR) / (maxR - minR)) * (width - 2 * padding)
                    const ry = (height - padding) - ((v / maxV) * (height - 2 * padding))

                    const cx = Math.max(padding, Math.min(width - padding, rx))
                    const cy = Math.max(padding, Math.min(height - padding, ry))

                    pointRef.current.setAttribute("cx", cx)
                    pointRef.current.setAttribute("cy", cy)
                }

                if (textRef.current) {
                    textRef.current.textContent = `r: ${r.toFixed(2)} | v: ${v.toFixed(2)}`
                }
            }
            requestRef.current = requestAnimationFrame(update)
        }

        requestRef.current = requestAnimationFrame(update)
        return () => cancelAnimationFrame(requestRef.current)
    }, [a, e, paused, speed, bounds])

    // Reset loop time
    useEffect(() => { timeRef.current = 0 }, [a, e, speed])

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

                    {/* Point (Ref Controlled) */}
                    <circle ref={pointRef} cx={padding} cy={height - padding} r="4" fill="#00ffff" />

                    {/* Labels */}
                    <text x={width / 2} y={height} fill="#64748b" fontSize="14" textAnchor="middle">r (AU)</text>
                    <text x="0" y={height / 2} fill="#64748b" fontSize="14" transform={`rotate(-90, 10, ${height / 2})`} textAnchor="middle">v (km/s)</text>
                </svg>

                {/* Value Readout (Ref Controlled) */}
                <div ref={textRef} className="absolute top-0 right-0 text-sm font-bold font-mono text-cyan-400">
                    r: 0.00 | v: 0.00
                </div>
            </div>
        </div>
    )
}
