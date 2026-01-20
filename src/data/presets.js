export const PRESETS = [
    { name: "Mercury", a: 2.5, realA: 0.39, e: 0.206, color: "#a5a5a5", radius: 0.1 },
    { name: "Venus", a: 3.5, realA: 0.72, e: 0.007, color: "#e3bb76", radius: 0.2 },
    { name: "Earth", a: 4.5, realA: 1.00, e: 0.017, color: "#2288EE", radius: 0.2 },
    { name: "Mars", a: 6.0, realA: 1.52, e: 0.093, color: "#dd4524", radius: 0.15 },
    { name: "Jupiter", a: 12.0, realA: 5.20, e: 0.049, color: "#d9ae6f", radius: 0.5 },
    { name: "Saturn", a: 18.0, realA: 9.58, e: 0.056, color: "#ead6b8", radius: 0.45 },
    { name: "Uranus", a: 26.0, realA: 19.22, e: 0.046, color: "#d1e7e7", radius: 0.4 },
    { name: "Neptune", a: 35.0, realA: 30.05, e: 0.009, color: "#5b5ddf", radius: 0.4 },
    { name: "Halley's Comet", a: 32.0, realA: 17.8, e: 0.967, color: "#ffffff", radius: 0.15 }, // Adjusted (q ~ 1.05 > 0.8)
    { name: "Voyager 2 (Launch)", a: 5, realA: 1.0, e: 2.5, color: "#ff00ff", radius: 0.1 },
]

export const ORBIT_TYPES = [
    { label: "Circular", a: 5, e: 0 },
    { label: "Elliptical", a: 5, e: 0.5 },
    { label: "High Eccentricity", a: 5, e: 0.8 },
    { label: "Hohmann Transfer", a: 5, e: 0.7 },
    { label: "Parabolic (Escape)", a: 5, e: 1.0 },
    { label: "Hyperbolic (Escape)", a: 5, e: 1.3 },
]
