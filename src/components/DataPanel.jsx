import React, { useEffect, useState } from 'react'

export default function DataPanel({ config }) {
    const { a, realA } = config

    // Use Real A for physics calculation if available, otherwise use the visual 'a' (Sandbox)
    const calcA = realA || a

    // Kepler's 3rd Law: P^2 = a^3 (assuming Solar Mass = 1)
    // a in AU, P in Years
    const P = Math.sqrt(Math.pow(calcA, 3))

    const a3 = Math.pow(calcA, 3)
    const P2 = Math.pow(P, 2)

    return (
        <div className="absolute top-4 left-4 w-80 bg-slate-900 border border-slate-700 rounded-xl p-5 text-white shadow-xl font-mono text-sm z-10">
            <h3 className="text-cyan-400 font-bold mb-3 uppercase tracking-wider border-b border-slate-700 pb-2">
                Kepler III Data Lab
            </h3>

            <div className="grid grid-cols-2 gap-y-2 mb-4">
                <div className="text-slate-400">Semi-Major (a):</div>
                <div className="text-right text-yellow-400">{calcA.toFixed(2)} AU</div>

                <div className="text-slate-400">Eccentricity (e):</div>
                <div className="text-right text-cyan-400">{config.e?.toFixed(3) || "0.000"}</div>

                <div className="text-slate-400">Period (P):</div>
                <div className="text-right text-green-400">{P.toFixed(2)} Yrs</div>
            </div>

            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-600/50">
                <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400">a³ =</span>
                    <span className="text-white">{a3.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400">P² =</span>
                    <span className="text-white">{P2.toFixed(2)}</span>
                </div>
                <div className="text-xs text-center mt-2 text-slate-500 italic">
                    Ratio (P²/a³) ≈ {(P2 / a3).toFixed(4)}
                </div>
            </div>

            <div className="mt-2 text-[10px] text-slate-500 text-center">
                * Assuming Solar Mass = 1
            </div>
        </div>
    )
}
