import React from 'react'
import { Play, Pause, RotateCcw, Info, Boxes } from 'lucide-react'
import { PRESETS, ORBIT_TYPES } from '../data/presets'

export default function Controls({ config, setConfig }) {
    const handleChange = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }))
    }

    const loadPreset = (presetName) => {
        if (presetName === "Sandbox") {
            setConfig(prev => ({
                ...prev,
                a: 5,
                e: 0.5,
                locked: false,
                radius: 0.25,
                color: "#4caf50",
                model: null,
                bodies: null,
                launchTrigger: null // Reset launch
            }))
            return;
        }

        if (presetName === "SolarSystem") {
            setConfig(prev => ({
                ...prev,
                locked: true,
                bodies: PRESETS.filter(p => !p.name.includes("Voyager")), // Exclude physics-based Voyager
                launchTrigger: null // Reset launch state
            }))
            return;
        }

        const p = PRESETS.find(x => x.name === presetName)
        if (p) {
            setConfig(prev => ({
                ...prev,
                a: p.a,
                e: p.e,
                radius: p.radius,
                color: p.color,
                model: p.model,
                modelScale: p.scale, // Pass scale if present
                locked: true,
                realA: p.realA, // Pass real data
                bodies: null,
                launchTrigger: null // Reset launch
            }))
        }
    }

    const loadType = (typeName) => {
        const t = ORBIT_TYPES.find(x => x.label === typeName)
        if (t) {
            // "When they select a trajectory type, lets have it be the generic sandbox planet."
            setConfig(prev => ({
                ...prev,
                a: t.a,
                e: t.e,
                locked: false, // Unlock for sandbox
                radius: 0.25,
                color: "#4caf50",
                model: null,
                bodies: null,
                launchTrigger: null // Reset launch
            }))
        }
    }

    const setSandboxMode = () => {
        setConfig(prev => ({
            ...prev,
            a: 5,
            e: 0.5,
            locked: false,
            radius: 0.25,
            color: "#4caf50",
            bodies: null,
            launchTrigger: null
        }))
    }

    const handleReset = () => {
        if (config.launchTrigger) {
            // Return to clean Solar System
            loadPreset("SolarSystem")
        } else {
            // Just reset time for current view
            setConfig(prev => ({ ...prev, resetTrigger: Date.now() }))
        }
    }

    return (
        <div className="absolute top-4 right-4 w-80 bg-slate-900/50 backdrop-blur-md border border-slate-700 rounded-xl p-5 text-white shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Orbital Controls V2
                </h2>
                <Info className="w-5 h-5 text-slate-400 cursor-pointer hover:text-white" />
            </div>

            {/* Presets Dropdowns */}
            <div className="mb-6 space-y-3 bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mb-1 block">Solar System Preset</label>
                    <select
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
                        onChange={(e) => loadPreset(e.target.value)}
                        value={config.bodies ? "SolarSystem" : (config.locked ? PRESETS.find(p => p.a === config.a && p.e === config.e)?.name || "" : "Sandbox")}
                    >
                        <option value="Sandbox">✨ Sandbox Mode (Custom)</option>
                        <option value="SolarSystem">🪐 Full Solar System</option>
                        <option disabled>── Real Solar System ──</option>
                        {PRESETS.filter(p => !p.name.includes("Voyager")).map(p => (
                            <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                    </select>
                </div>

                {/* Sandbox Reset Button & Trajectory Type */}
                <div className={config.locked ? "opacity-40 pointer-events-none grayscale transition-opacity" : "transition-opacity"}>
                    <div className="flex justify-between items-end mb-1">
                        <label className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Trajectory Type</label>
                        {!config.locked && (
                            <button
                                onClick={setSandboxMode}
                                className="text-[10px] flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2 py-0.5 rounded text-green-300 transition-colors"
                                title="Reset to Generic Sandbox Planet"
                            >
                                <Boxes size={10} /> Reset Sandbox
                            </button>
                        )}
                    </div>
                    <select
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
                        onChange={(e) => loadType(e.target.value)}
                        defaultValue=""
                        disabled={config.locked}
                    >
                        <option value="" disabled>Select Physics Case...</option>
                        {ORBIT_TYPES.map(t => (
                            <option key={t.label} value={t.label}>{t.label}</option>
                        ))}
                    </select>
                    {config.locked && <div className="text-[9px] text-yellow-500/80 mt-1 italic text-right">Switch to Sandbox to use presets</div>}
                </div>
            </div>

            {/* Voyager Launch Control - Only in Solar System Mode */}
            {config.bodies && config.bodies.some(b => b.name === "Earth") && !config.launchTrigger && (
                <div className="mb-4">
                    <button
                        onClick={() => {
                            // Reset Planets to Aug 1977 Positions
                            const alignedBodies = PRESETS.filter(p => !p.name.includes("Voyager")).map(p => {
                                let offset = 0
                                if (p.name === "Earth") offset = 5.71
                                if (p.name === "Jupiter") offset = 1.57
                                if (p.name === "Saturn") offset = 2.46
                                if (p.name === "Uranus") offset = 3.80
                                if (p.name === "Neptune") offset = 4.41
                                return { ...p, initialOffset: offset }
                            })

                            setConfig(prev => ({
                                ...prev,
                                bodies: alignedBodies,
                                launchTrigger: Date.now()
                            }))
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-red-600 hover:from-orange-500 hover:to-red-700 py-3 rounded-lg text-white font-bold tracking-wider shadow-lg shadow-orange-900/40 transition-all active:scale-95"
                    >
                        🚀 LAUNCH VOYAGER
                    </button>
                </div>
            )}

            {/* Playback Controls */}
            {/* Playback Controls */}
            <div className="flex gap-2 mb-2">
                <button
                    onClick={() => handleChange('paused', !config.paused)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg transition-colors font-medium shadow-lg shadow-blue-500/20"
                >
                    {config.paused ? <Play size={18} /> : <Pause size={18} />}
                    {config.paused ? 'Play' : 'Pause'}
                </button>
            </div>
            <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg transition-colors text-slate-200 font-medium mb-6"
                title="Reset Current Simulation"
            >
                <RotateCcw size={16} /> Reset Simulation
            </button>

            {/* Sliders */}
            <div className="space-y-5">

                {/* Eccentricity (e) */}
                <div className={config.locked ? "opacity-50 pointer-events-none grayscale" : ""}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">Eccentricity (e)</span>
                        <span className="font-mono text-cyan-300">{config.e.toFixed(3)}</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1.5"
                        step="0.01"
                        value={config.e}
                        onChange={(e) => handleChange('e', parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                        <span>Circle (0)</span>
                        <span>Parabola (1)</span>
                        <span>Hyperbola (&gt;1)</span>
                    </div>
                </div>

                {/* Semi-Major Axis (a) */}
                <div className={config.locked ? "opacity-50 pointer-events-none grayscale" : ""}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">Scale (a)</span>
                        <span className="font-mono text-cyan-300">{(config.realA || config.a).toFixed(2)} AU</span>
                    </div>
                    <input
                        type="range"
                        min="0.5"
                        max="40"
                        step="0.1"
                        value={config.a}
                        onChange={(e) => handleChange('a', parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                    {config.locked && <div className="text-[10px] text-yellow-500 mt-1 flex items-center gap-1">🔒 Real Planet (Read-Only)</div>}
                </div>

                {/* Simulation Speed */}
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-300">Sim Speed</span>
                        <span className="font-mono text-cyan-300">{config.speed.toFixed(1)}x</span>
                    </div>
                    <input
                        type="range"
                        min="0.1"
                        max="5"
                        step="0.1"
                        value={config.speed}
                        onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                </div>
            </div>

            {/* Toggles */}
            <div className="mt-6 space-y-3 pt-4 border-t border-slate-700/50">
                {/* Velocity Vector (Disabled for System) */}
                <label className={`flex items-center space-x-3 cursor-pointer group ${config.bodies ? "opacity-40 pointer-events-none grayscale" : ""}`}>
                    <input
                        type="checkbox"
                        checked={config.showVector}
                        onChange={(e) => handleChange('showVector', e.target.checked)}
                        disabled={!!config.bodies}
                        className="w-5 h-5 bg-slate-700 rounded border-none accent-cyan-500 cursor-pointer"
                    />
                    <span className="text-slate-300 group-hover:text-white transition-colors">Show Velocity Vector</span>
                </label>

                {/* Swept Areas (Disabled for System OR Escape) */}
                <label className={`flex items-center space-x-3 cursor-pointer group ${(config.bodies || config.e >= 1.0) ? "opacity-40 pointer-events-none grayscale" : ""}`}>
                    <input
                        type="checkbox"
                        checked={config.showArea}
                        onChange={(e) => handleChange('showArea', e.target.checked)}
                        disabled={!!config.bodies || config.e >= 1.0}
                        className="w-5 h-5 bg-slate-700 rounded border-none accent-cyan-500 cursor-pointer"
                    />
                    <span className="text-slate-300 group-hover:text-white transition-colors">Show Swept Areas (Kepler II)</span>
                </label>

                {/* Foci (Disabled for System OR Escape) */}
                <label className={`flex items-center space-x-3 cursor-pointer group ${(config.bodies || config.e >= 1.0) ? "opacity-40 pointer-events-none grayscale" : ""}`}>
                    <input
                        type="checkbox"
                        checked={config.showFoci}
                        onChange={(e) => handleChange('showFoci', e.target.checked)}
                        disabled={!!config.bodies || config.e >= 1.0}
                        className="w-5 h-5 bg-slate-700 rounded border-none accent-cyan-500 cursor-pointer"
                    />
                    <span className="text-slate-300 group-hover:text-white transition-colors">Show Foci & Major Axis (Kepler I)</span>
                </label>

                {/* Velocity Graph (Disabled for System) */}
                <label className={`flex items-center space-x-3 cursor-pointer group ${config.bodies ? "opacity-40 pointer-events-none grayscale" : ""}`}>
                    <input
                        type="checkbox"
                        checked={config.showGraph}
                        onChange={(e) => handleChange('showGraph', e.target.checked)}
                        disabled={!!config.bodies}
                        className="w-5 h-5 bg-slate-700 rounded border-none accent-cyan-500 cursor-pointer"
                    />
                    <span className="text-slate-300 group-hover:text-white transition-colors">Show Velocity Graph</span>
                </label>
            </div>

            {/* Footer / Stats */}
            <div className="mt-6 pt-4 border-t border-slate-700/50 text-xs text-slate-500 text-center">
                Kepler 3D Sandbox v2.0
            </div>
        </div>
    )
}
