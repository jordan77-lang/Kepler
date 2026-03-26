import React from 'react'
import { Play, Pause, RotateCcw } from 'lucide-react'
import { PRESETS } from '../data/presets'
import GraphPanel from './GraphPanel'

import logo from '../assets/orbital-controls-logo.png'

const SOLAR_OBJECTS = PRESETS.filter(p => p.type)

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
                realA: null, // Clear real physics data for sandbox
                i: 0, // Reset inclination
                selectedBodies: null,
                activePreset: "Sandbox",
                activeType: null,
                paused: true,
                resetTrigger: Date.now()
            }))
            return;
        }

        if (presetName === "SolarSystem") {
            setConfig(prev => ({
                ...prev,
                locked: true,
                bodies: SOLAR_OBJECTS.filter(p => p.type === "planet"),
                selectedBodies: SOLAR_OBJECTS.filter(p => p.type === "planet").map(p => p.name),
                activePreset: "SolarSystem",
                activeType: null,
                model: null,
                realA: null,
                i: 0,
                paused: true,
                resetTrigger: Date.now()
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
                selectedBodies: null,
                activePreset: presetName,
                activeType: null,
                paused: true,
                resetTrigger: Date.now()
            }))
        }
    }

    const selectedSolarNames = new Set(config.selectedBodies || (config.bodies ? config.bodies.map(b => b.name) : []))

    const toggleSolarBody = (name, checked) => {
        setConfig(prev => {
            const current = new Set(prev.selectedBodies || (prev.bodies ? prev.bodies.map(b => b.name) : []))
            if (checked) current.add(name)
            else current.delete(name)

            const updatedBodies = SOLAR_OBJECTS.filter(obj => current.has(obj.name))

            return {
                ...prev,
                bodies: updatedBodies,
                selectedBodies: Array.from(current),
                paused: true
            }
        })
    }

    const handleReset = () => {
        // If we have an active preset (e.g. Earth, or Elliptical Type), reload it
        if (config.activePreset && config.activePreset !== "Sandbox" && config.activePreset !== "SolarSystem") {
            loadPreset(config.activePreset)
            return
        }

        if (config.activePreset === "SolarSystem") {
            loadPreset("SolarSystem")
            return
        }

        // Fallback or Sandbox: Just reset time and maybe defaults if needed
        setConfig(prev => ({
            ...prev,
            resetTrigger: Date.now(),
            paused: true,
            // Optional: if in Sandbox without Type, maybe reset to defaults? 
            // Logic: "Reset to initial state of the Preset of type".
            // If Sandbox was loaded originally with a=5, e=0.5, we should probably reset to that if no Type selected.
            // But usually Sandbox preserves user changes on 'play/pause', 'reset' is time reset.
            // User Request: "resets the simulation to the intail state of thePreset of type"
            // Interpretation: If I modify 'a', Reset should revert 'a'.
            ...(config.activePreset === "Sandbox" && !config.activeType ? { a: 5, e: 0.5, i: 0 } : {})
        }))
    }

    return (
        <div className="absolute top-0 right-4 w-96 flex flex-col gap-0 max-h-screen z-50">
            {/* Logo - Separated from panel */}
            <div className="flex justify-center shrink-0 z-10 mb-[-60px] pointer-events-none">
                <img src={logo} alt="Orbital Controls" className="h-[28rem] object-contain drop-shadow-2xl" />
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
                        <label className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1.5 block">Explore Kepler's Laws</label>
                        <select
                            className="w-full bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm text-white focus:border-cyan-500 outline-none transition-colors"
                            onChange={(e) => loadPreset(e.target.value)}
                            value={config.bodies ? "SolarSystem" : (config.locked ? PRESETS.find(p => p.a === config.a && p.e === config.e)?.name || "" : "Sandbox")}
                        >
                            <option value="Sandbox">Kepler's 2nd Law</option>
                            <option value="SolarSystem">Kepler's 3rd Law</option>
                            <option disabled>── Explore Bodies ──</option>
                            {PRESETS.filter(p => !p.name.includes("Voyager")).map(p => (
                                <option key={p.name} value={p.name}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Type selector removed for Kepler's 3rd Law mode */}
                </div>

                {config.bodies && (
                    <div className="mb-5 bg-slate-800/40 p-3 rounded-lg border border-slate-700/50">
                        <p className="text-xs text-slate-300 font-semibold mb-2 uppercase tracking-widest">Solar System Objects</p>
                        <div className="space-y-2 pr-1">
                            {SOLAR_OBJECTS.map(obj => (
                                <label key={obj.name} className="flex items-center gap-2 text-sm text-slate-200">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 accent-cyan-500"
                                        checked={selectedSolarNames.has(obj.name)}
                                        onChange={(e) => toggleSolarBody(obj.name, e.target.checked)}
                                    />
                                    <span className="flex items-center gap-2">
                                        <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: obj.color }} />
                                        {obj.name}
                                    </span>
                                </label>
                            ))}
                        </div>
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

                <div className="space-y-5 mb-5">
                    {!config.bodies && !config.locked && (
                        <>
                            {/* Eccentricity */}
                            <div>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="text-slate-300">Eccentricity (e)</span>
                                    <span className="font-mono text-cyan-300">{config.e.toFixed(3)}</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="5"
                                    step="0.01"
                                    value={config.e}
                                    onChange={(e) => handleChange('e', parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-500 block"
                                />
                            </div>

                            {/* Scale */}
                            <div>
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
                            <div>
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
                                />
                            </div>
                        </>
                    )}

                    {/* Simulation Speed (always available) */}
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

                {/* Toggles - Sandbox only */}
                {!config.bodies && (
                    <div className="space-y-3 pt-4 border-t border-slate-700/50">
                        <label className="flex items-center space-x-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={config.showVector}
                                onChange={(e) => handleChange('showVector', e.target.checked)}
                                className="w-5 h-5 bg-slate-700 rounded accent-cyan-500"
                            />
                            <span className="text-xs text-slate-300 group-hover:text-white">Velocity Vector</span>
                        </label>

                        <label className={`flex items-center space-x-3 cursor-pointer group ${config.e >= 1.0 ? "opacity-40 pointer-events-none grayscale" : ""}`}>
                            <input
                                type="checkbox"
                                checked={config.showArea}
                                onChange={(e) => handleChange('showArea', e.target.checked)}
                                disabled={config.e >= 1.0}
                                className="w-5 h-5 bg-slate-700 rounded accent-cyan-500"
                            />
                            <span className="text-xs text-slate-300 group-hover:text-white">Swept Areas</span>
                        </label>

                        <label className={`flex items-center space-x-3 cursor-pointer group ${config.e >= 1.0 ? "opacity-40 pointer-events-none grayscale" : ""}`}>
                            <input
                                type="checkbox"
                                checked={config.showFoci}
                                onChange={(e) => handleChange('showFoci', e.target.checked)}
                                disabled={config.e >= 1.0}
                                className="w-5 h-5 bg-slate-700 rounded accent-cyan-500"
                            />
                            <span className="text-xs text-slate-300 group-hover:text-white">Foci & Major Axis</span>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={config.showGraph}
                                onChange={(e) => handleChange('showGraph', e.target.checked)}
                                className="w-5 h-5 bg-slate-700 rounded accent-cyan-500"
                            />
                            <span className="text-xs text-slate-300 group-hover:text-white">Phase Plot</span>
                        </label>

                        <label className={`flex items-center space-x-3 cursor-pointer group ${(config.e === 0 || config.e >= 1) ? "opacity-40 pointer-events-none grayscale" : ""}`}>
                            <input
                                type="checkbox"
                                checked={config.showApsides}
                                onChange={(e) => handleChange('showApsides', e.target.checked)}
                                disabled={config.e === 0 || config.e >= 1}
                                className="w-5 h-5 bg-slate-700 rounded accent-cyan-500"
                            />
                            <span className="text-xs text-slate-300 group-hover:text-white">Show Apsides</span>
                        </label>
                    </div>
                )}

                {/* Phase Plot under controls */}
                {!config.bodies && config.showGraph && (
                    <div className="mt-4">
                        <GraphPanel config={config} />
                    </div>
                )}
            </div>
        </div>
    )
}
