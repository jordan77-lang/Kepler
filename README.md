# Kepler's Laws of Motion — Interactive 3D Simulation

An interactive 3D orbital mechanics simulator built for the **Center for Planetary Observation (CPO)**. Students can explore all three of Kepler's Laws through real-time simulation, presets, and hands-on controls.

---

## Features

### Kepler's 2nd Law — Sandbox Mode
- Freely adjust **semi-major axis (a)**, **eccentricity (e)**, and **orbital inclination (i)**
- Toggle **velocity vector**, **swept areas**, **foci & major axis**, **apsides**, and a **phase plot**
- Supports circular, elliptical, high-eccentricity, parabolic, and hyperbolic trajectories

### Kepler's 3rd Law — Solar System Mode
- Full solar system with Mercury through Neptune and Halley's Comet
- Toggle individual bodies on/off — camera automatically reframes to fit the current selection
- Orbit periods scale realistically relative to semi-major axis

### Body Presets
- Pre-configured orbital parameters for each planet and Halley's Comet
- Locked parameters reflect real astronomical data (semi-major axis in AU)

---

## Controls

| Control | Description |
|---|---|
| **Explore Kepler's Laws** dropdown | Switch between 2nd Law sandbox, 3rd Law solar system, or a specific body |
| **Play / Pause** | Start or pause the simulation |
| **Reset** | Return all planets to their starting positions |
| **Simulation Speed** | Scale time from 0.1× to 5× |
| **Eccentricity / Semi-major axis / Inclination** | Sandbox sliders (hidden in locked presets) |
| **Solar System Objects** | Checkboxes to add/remove individual planets |
| **Velocity Vector** | Show instantaneous velocity arrow |
| **Swept Areas** | Visualise equal-area sweeps (Kepler's 2nd Law) |
| **Foci & Major Axis** | Show orbital foci and major axis line |
| **Show Apsides** | Label perihelion and aphelion |
| **Phase Plot** | Live position–velocity phase space graph |

---

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- [@react-three/fiber](https://docs.pmnd.rs/react-three-fiber) — React renderer for Three.js
- [@react-three/drei](https://github.com/pmndrs/drei) — Helpers (OrbitControls, Html labels, Stars, Trail)
- [Three.js](https://threejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) — Phase plot graph
- Custom Universal Kepler solver (`src/utils/universalKepler.js`) supporting all conic sections

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The dev server runs at `http://localhost:5173/Kepler/` (or the next available port).

---

## Project Structure

```
src/
  components/
    AutoZoom.jsx        # Camera framing — reacts only to real distance changes
    ApsidesHelper.jsx   # Perihelion / Aphelion markers
    Controls.jsx        # Full control panel UI
    FociHelper.jsx      # Foci & major axis overlay
    GraphPanel.jsx      # Phase plot (position vs velocity)
    OrbitPath.jsx       # Rendered orbit ellipse/hyperbola
    Planet.jsx          # Orbital body with physics integration
    Scene.jsx           # Three.js canvas & scene composition
    Star.jsx            # Central star / sun
    SweptArea.jsx       # Equal-area sweep visualisation
    VelocityArrow.jsx   # Velocity vector arrow
  data/
    presets.js          # Planet & comet orbital parameters
  utils/
    keplerMath.js       # Kepler equation utilities
    universalKepler.js  # Universal variable Kepler solver (all conics)
```

---

*Built for CPO educational outreach.*
