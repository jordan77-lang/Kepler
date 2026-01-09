import { useState, useRef } from 'react'
import Scene from './components/Scene'
import Controls from './components/Controls'
import DataPanel from './components/DataPanel'
import GraphPanel from './components/GraphPanel'
import MissionTimer from './components/MissionTimer'

function App() {
  const missionRef = useRef()
  const [config, setConfig] = useState({
    a: 5,        // Semi-major axis
    e: 0.5,      // Eccentricity
    speed: 1,    // Simulation speed
    paused: false,
    showVector: false,
    showArea: false,
    showFoci: false, // Law 1
    showGraph: true, // Law 3/Data
    color: "#ff00ff"
  })

  // Check if Voyager is active (either single body or in list or via Launch Trigger)
  const isVoyager = config.name?.includes("Voyager") || config.bodies?.some(b => b.name.includes("Voyager")) || !!config.launchTrigger

  return (
    <div className="w-full h-full relative bg-black font-sans">
      <Scene config={config} missionRef={missionRef} setConfig={setConfig} />
      <Controls config={config} setConfig={setConfig} />
      <Controls config={config} setConfig={setConfig} />

      {/* Hide Data and Graph in Solar System Mode */}
      {!config.bodies && (
        <>
          <DataPanel config={config} />
          {config.showGraph && <GraphPanel config={config} />}
        </>
      )}

      {/* Overlay Timer */}
      <div className={`transition-opacity duration-1000 ${isVoyager ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <MissionTimer ref={missionRef} />
      </div>
    </div>
  )
}

export default App
