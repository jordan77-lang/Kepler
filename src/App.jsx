import { useState } from 'react'
import Scene from './components/Scene'
import Controls from './components/Controls'
import NarratorPanel from './components/NarratorPanel'

function App() {
  const [config, setConfig] = useState({
    a: 5,        // Semi-major axis
    e: 0.5,      // Eccentricity
    speed: 1,    // Simulation speed
    paused: true,
    showVector: false,
    showArea: false,
    showApsides: false, // Perigee/Apogee label toggle
    showFoci: false, // Law 1: Foci points
    showAxes: false, // Law 1: Semi-Major/Minor Axes
    showRadius: false, // Law 2: Dynamic Orbital Radius
    showGraph: false, // Law 3/Data
    showNarrator: false, // Accessibility narrator
    color: "#ff00ff",
    i: 0, // Inclination (degrees)
    raan: 0, // Longitude of ascending node (degrees)
    argp: 0, // Argument of periapsis (degrees)
    showSolarGrid: false,
    showSolarElements: false,
    activePreset: "Sandbox",
    activeType: null
  })

  return (
    <div className="w-full h-full relative bg-black font-sans">
      <Scene config={config} />
      <Controls config={config} setConfig={setConfig} />
      {config.showNarrator && <NarratorPanel config={config} />}
    </div>
  )
}

export default App
