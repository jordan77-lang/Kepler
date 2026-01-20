import React from 'react'
import { Play, Pause, RotateCcw, Boxes } from 'lucide-react'
import { PRESETS, ORBIT_TYPES } from '../data/presets'

import logo from '../assets/orbital-controls-logo.png'

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
                color: "#4caf50",
                model: null,
                bodies: null,
                realA: null, // Clear real physics data for sandbox
                i: 0, // Reset inclination
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
                bodies: null,
                realA: null, // Clear real physics data
                i: 0, // Reset
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
            bodies: null,
            realA: null, // Clear real data
            i: 0, // Reset
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
        <div className="absolute top-0 right-4 w-96 flex flex-col gap-0 max-h-screen z-50">
            {/* Logo - Separated from panel */}
            <div className="flex justify-center shrink-0 z-10 mb-[-60px] pointer-events-none">
                <img src={logo} alt="Orbital Controls" className="h-80 object-contain drop-shadow-2xl" />
            </div>

            {/* Control Panel - Larger Mode */}
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-xl p-4 text-white shadow-2xl flex-1 overflow-y-auto custom-scrollbar pt-6">

                {/* Header Row */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Controls</span>
                </div>

                {/* Presets Dropdowns */}
                <div className="mb-5 space-y-4 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                    <div>
                        <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1.5 block">Preset</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
                            onChange={(e) => loadPreset(e.target.value)}
                            value={config.bodies ? "SolarSystem" : (config.locked ? PRESETS.find(p => p.a === config.a && p.e === config.e)?.name || "" : "Sandbox")}
                        >
                            <option value="Sandbox">✨ Sandbox</option>
                            <option value="SolarSystem">🪐 Solar System</option>
                            <option disabled>── Real ──</option>
                            {PRESETS.filter(p => !p.name.includes("Voyager")).map(p => (
                                <option key={p.name} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Reset & Types */}
                    <div className={config.locked ? "opacity-40 pointer-events-none grayscale transition-opacity" : "transition-opacity"}>
                        <div className="flex justify-between items-end mb-1.5">
                            <label className="text-xs text-slate-400 uppercase tracking-widest font-bold block">Type</label>
                            {!config.locked && (
                                <button
                                    onClick={setSandboxMode}
                                    className="text-[10px] flex items-center gap-1 bg-slate-700 hover:bg-slate-600 px-2 py-1 rounded text-green-300 transition-colors"
                                >
                                    <Boxes size={12} /> Reset
                                </button>
                            )}
                        </div>
                        <select
                            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
                            onChange={(e) => loadType(e.target.value)}
                            defaultValue=""
                            disabled={config.locked}
                        >
                            <option value="" disabled>Physics Case...</option>
                            {ORBIT_TYPES.map(t => (
                                <option key={t.label} value={t.label}>{t.label}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Launch Button */}
                {config.bodies && config.bodies.some(b => b.name === "Earth") && !config.launchTrigger && (
                    <div className="mb-5">
                        <button
                            onClick={() => {
                                const alignedBodies = PRESETS.filter(p => !p.name.includes("Voyager")).map(p => {
                                    let offset = 0
                                    if (p.name === "Earth") offset = 5.71
                                    if (p.name === "Jupiter") offset = 1.57
                                    if (p.name === "Saturn") offset = 2.46
                                    if (p.name === "Uranus") offset = 3.80
                                    if (p.name === "Neptune") offset = 4.41
                                    return { ...p, initialOffset: offset }
                                })
                                setConfig(prev => ({ ...prev, bodies: alignedBodies, launchTrigger: Date.now() }))
                            }}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-400 to-red-600 hover:from-orange-500 hover:to-red-700 py-3 rounded-lg text-white font-bold text-sm tracking-wider shadow-lg transition-all"
                        >
                            🚀 LAUNCH
                        </button>
                    </div>
                )}

                {/* Playback */}
                <div className="flex gap-3 mb-5">
                    <button
                        onClick={() => handleChange('paused', !config.paused)}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                        {config.paused ? <Play size={16} /> : <Pause size={16} />}
                        {config.paused ? 'Play' : 'Pause'}
                    </button>
                    <button
                        onClick={handleReset}
                        className="flex-1 flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 py-2 rounded-lg transition-colors text-slate-200 text-sm font-medium"
                    >
                        <RotateCcw size={16} /> Reset
                    </button>
                </div>

                {/* Sliders - Larger */}
                <div className="space-y-5 mb-5">
                    {/* Eccentricity */}
                    <div className={config.locked ? "opacity-50 pointer-events-none grayscale" : ""}>
                        <div className="flex justify-between text-xs mb-1.5">
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
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 block"
                        />
                    </div>

                    {/* Scale */}
                    <div className={config.locked ? "opacity-50 pointer-events-none grayscale" : ""}>
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-300">Semi-major axis (a)</span>
                            <span className="font-mono text-cyan-300">{(config.realA || config.a).toFixed(2)} AU</span>
                        </div>
                        <input
                            type="range"
                            min="0.5"
                            max="40"
                            step="0.1"
                            value={config.a}
                            onChange={(e) => handleChange('a', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 block"
                        />
                    </div>

                    {/* Inclination first, Speed last as requested */}

                    {/* Inclination */}
                    <div className={config.locked ? "opacity-50 pointer-events-none grayscale" : ""}>
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-300">Inclination (i)</span>
                            <span className="font-mono text-cyan-300">{config.i}°</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="180"
                            step="1"
                            value={config.i}
                            onChange={(e) => handleChange('i', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 block"
                            disabled={config.locked}
                        />
                    </div>

                    {/* Simulation Speed (Moved to bottom) */}
                    <div>
                        <div className="flex justify-between text-xs mb-1.5">
                            <span className="text-slate-300">Simulation Speed</span>
                            <span className="font-mono text-cyan-300">{config.speed.toFixed(1)}x</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="5"
                            step="0.1"
                            value={config.speed}
                            onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
                            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 block"
                        />
                    </div>
                </div>

                {/* Toggles - Larger */}
                <div className="space-y-3 pt-4 border-t border-slate-700/50">
                    <label className={`flex items-center space-x-3 cursor-pointer group ${config.bodies ? "opacity-40 pointer-events-none grayscale" : ""}`}>
                        <input
                            type="checkbox"
                            checked={config.showVector}
                            onChange={(e) => handleChange('showVector', e.target.checked)}
                            disabled={!!config.bodies}
                            className="w-5 h-5 bg-slate-700 rounded accent-cyan-500"
                        />
                        <span className="text-xs text-slate-300 group-hover:text-white">Velocity Vector</span>
                    </label>

                    <label className={`flex items-center space-x-3 cursor-pointer group ${(config.bodies || config.e >= 1.0) ? "opacity-40 pointer-events-none grayscale" : ""}`}>
                        <input
                            type="checkbox"
                            checked={config.showArea}
                            onChange={(e) => handleChange('showArea', e.target.checked)}
                            disabled={!!config.bodies || config.e >= 1.0}
                            className="w-5 h-5 bg-slate-700 rounded accent-cyan-500"
                        />
                        <span className="text-xs text-slate-300 group-hover:text-white">Swept Areas</span>
                    </label>

                    <label className={`flex items-center space-x-3 cursor-pointer group ${(config.bodies || config.e >= 1.0) ? "opacity-40 pointer-events-none grayscale" : ""}`}>
                        <input
                            type="checkbox"
                            checked={config.showFoci}
                            onChange={(e) => handleChange('showFoci', e.target.checked)}
                            disabled={!!config.bodies || config.e >= 1.0}
                            className="w-5 h-5 bg-slate-700 rounded accent-cyan-500"
                        />
                        <span className="text-xs text-slate-300 group-hover:text-white">Foci & Major Axis</span>
                    </label>

                    <label className={`flex items-center space-x-3 cursor-pointer group ${config.bodies ? "opacity-40 pointer-events-none grayscale" : ""}`}>
                        <input
                            type="checkbox"
                            checked={config.showGraph}
                            onChange={(e) => handleChange('showGraph', e.target.checked)}
                            disabled={!!config.bodies}
                            className="w-5 h-5 bg-slate-700 rounded accent-cyan-500"
                        />
                        <span className="text-xs text-slate-300 group-hover:text-white">Velocity Graph</span>
                    </label>

                    <label className={`flex items-center space-x-3 cursor-pointer group ${(config.bodies || config.e === 0 || config.e >= 1) ? "opacity-40 pointer-events-none grayscale" : ""}`}>
                        <input
                            type="checkbox"
                            checked={config.showApsides}
                            onChange={(e) => handleChange('showApsides', e.target.checked)}
                            disabled={!!config.bodies || config.e === 0 || config.e >= 1}
                            className="w-5 h-5 bg-slate-700 rounded accent-cyan-500"
                        />
                        <span className="text-xs text-slate-300 group-hover:text-white">Show Apsides</span>
                    </label>
                </div>
            </div>
        </div>
    )
}
