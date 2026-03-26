import { useState } from 'react'
import Scene from './components/Scene'
import Controls from './components/Controls'

function App() {
  const [config, setConfig] = useState({
    a: 5,        // Semi-major axis
    e: 0.5,      // Eccentricity
    speed: 1,    // Simulation speed
    paused: true,
    showVector: false,
    showArea: false,
    showApsides: false, // Perigee/Apogee label toggle
    showFoci: false, // Law 1
    showGraph: true, // Law 3/Data
    color: "#ff00ff",
    i: 0 // Inclination (degrees)
  })

  return (
    <div className="w-full h-full relative bg-black font-sans">
      <Scene config={config} />
      <Controls config={config} setConfig={setConfig} />


    </div>
  )
}

export default App
