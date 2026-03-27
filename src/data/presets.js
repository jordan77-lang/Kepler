export const PRESETS = [
    { name: "Mercury", a: 2.5, realA: 0.39, e: 0.206, color: "#a5a5a5", radius: 0.1, type: "planet", initialOffset: 0 },
    { name: "Venus", a: 3.5, realA: 0.72, e: 0.007, color: "#e3bb76", radius: 0.2, type: "planet", initialOffset: 0 },
    { name: "Earth", a: 4.5, realA: 1.00, e: 0.017, color: "#2288EE", radius: 0.2, type: "planet", initialOffset: 0 },
    { name: "Mars", a: 6.0, realA: 1.52, e: 0.093, color: "#dd4524", radius: 0.15, type: "planet", initialOffset: 0 },
    { name: "Jupiter", a: 12.0, realA: 5.20, e: 0.049, color: "#d9ae6f", radius: 0.5, type: "planet", initialOffset: 0 },
    { name: "Saturn", a: 18.0, realA: 9.58, e: 0.056, color: "#ead6b8", radius: 0.45, type: "planet", initialOffset: 0 },
    { name: "Uranus", a: 26.0, realA: 19.22, e: 0.046, color: "#d1e7e7", radius: 0.4, type: "planet", initialOffset: 0 },
    { name: "Neptune", a: 35.0, realA: 30.05, e: 0.009, color: "#5b5ddf", radius: 0.4, type: "planet", initialOffset: 0 },
    { name: "Halley's Comet", a: 32.0, realA: 17.8, e: 0.967, color: "#ffffff", radius: 0.15, type: "comet", initialOffset: 0 }, // Adjusted (q ~ 1.05 > 0.8)
    // Dwarf Planets
    { name: "Pluto", a: 45, realA: 39.48, e: 0.249, color: "#c4a882", radius: 0.09, type: "dwarf", initialOffset: 0 },
    { name: "Ceres", a: 8.0, realA: 2.77, e: 0.076, color: "#9e9e9e", radius: 0.08, type: "dwarf", initialOffset: 0 },
    // Asteroids
    { name: "Bennu", a: 3.8, realA: 1.13, e: 0.204, color: "#7a6655", radius: 0.07, type: "asteroid", initialOffset: 0 },
    // Comets
    { name: "Comet 67P", a: 4.5, realA: 3.46, e: 0.641, color: "#5a5a5a", radius: 0.1, type: "comet", initialOffset: 0 },
    // Interstellar
    { name: "3I/Atlas", a: 0.31, realA: null, e: 6.14, color: "#00e5ff", radius: 0.11, type: "interstellar", initialOffset: 0 },
]

export const OBSERVATIONS = [
    { label: "Observation 1 — Neptune & Saturn", bodies: ["Neptune", "Saturn"] },
    { label: "Observation 2 — Jupiter & Uranus", bodies: ["Jupiter", "Uranus"] },
]

export const ORBIT_TYPES = [
    { label: "Circular", a: 5, e: 0 },
    { label: "Elliptical", a: 5, e: 0.5 },
    { label: "High Eccentricity", a: 5, e: 0.8 },
    { label: "Hohmann Transfer", a: 5, e: 0.7 },
    { label: "Parabolic (Escape)", a: 5, e: 1.0 },
    { label: "Hyperbolic (Escape)", a: 5, e: 1.3 },
]
