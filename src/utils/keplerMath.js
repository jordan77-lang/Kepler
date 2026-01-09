import * as THREE from 'three';

/**
 * Kepler Physics Utility
 * Calculates position and velocity for an orbiting body.
 */
export class KeplerBody {
    constructor(a = 1, e = 0, mu = 1) {
        this.a = a; // Semi-major axis
        this.e = e; // Eccentricity
        this.mu = mu; // Standard gravitational parameter (G*M)
    }

    /**
     * Solve Kepler's Equation M = E - e*sin(E) for E (Eccentric Anomaly)
     * using Newton-Raphson iteration.
     * @param {number} M Mean Anomaly (radians)
     * @returns {number} Eccentric Anomaly (radians)
     */
    solveKepler(M) {
        let E = M;
        for (let i = 0; i < 10; i++) {
            const dE = (E - this.e * Math.sin(E) - M) / (1 - this.e * Math.cos(E));
            E -= dE;
            if (Math.abs(dE) < 1e-6) break;
        }
        return E;
    }

    /**
     * Get position and velocity at a specific time t.
     * @param {number} t Time
     * @returns {Object} { position: Vector3, velocity: Vector3 }
     */
    getState(t) {
        // Mean motion n = sqrt(mu / a^3)
        const n = Math.sqrt(this.mu / Math.pow(this.a, 3));

        // Mean Anomaly M = n * t
        const M = n * t;

        // Eccentric Anomaly E
        const E = this.solveKepler(M);

        // True Anomaly nu
        const cosNu = (Math.cos(E) - this.e) / (1 - this.e * Math.cos(E));
        const sinNu = (Math.sqrt(1 - this.e * this.e) * Math.sin(E)) / (1 - this.e * Math.cos(E));
        const nu = Math.atan2(sinNu, cosNu);

        // Radius r
        const r = this.a * (1 - this.e * Math.cos(E));

        // Position in orbital plane (z=0)
        // x = r * cos(nu)
        // y = r * sin(nu)
        const x = r * Math.cos(nu);
        const y = r * Math.sin(nu);

        const position = new THREE.Vector3(x, y, 0);

        // Velocity (Vis-viva equation components or derivative)
        // v = sqrt(mu * (2/r - 1/a)) magnitude
        // But we need vector. 
        // r_dot = (n * a * e * sin(E)) / (1 - e * cos(E))
        // nu_dot = (n * sqrt(1 - e^2)) / (1 - e * cos(E))^2
        // v_radial = r_dot
        // v_tangential = r * nu_dot

        // Cartesian velocity:
        // vx = - (sqrt(mu * a) / r) * sin(E)
        // vy = (sqrt(mu * a * (1-e^2)) / r) * cos(E)

        const scalar = Math.sqrt(this.mu * this.a) / r;
        const vx = -scalar * Math.sin(E);
        const vy = scalar * Math.sqrt(1 - this.e * this.e) * Math.cos(E);

        const velocity = new THREE.Vector3(vx, vy, 0);

        return { position, velocity, r, E, nu };
    }

    getPeriod() {
        return 2 * Math.PI * Math.sqrt(Math.pow(this.a, 3) / this.mu);
    }
}
