import * as THREE from 'three';

/**
 * Universal Kepler Physics Utility
 * Solves for Elliptic (e < 1), Parabolic (e = 1), and Hyperbolic (e > 1) orbits.
 */
export class UniversalKepler {
    constructor(a = 1, e = 0, mu = 10) {
        this.a = Math.abs(a);
        this.e = e;
        this.mu = mu;

        // Derive Periapsis Distance q
        // For Parabola (e~1), we treat input 'a' as 'q' directly to avoid collapse.
        if (Math.abs(this.e - 1.0) < 0.005) {
            this.q = this.a; // User intention: "Size" = Closest Approach
            this.isParabolic = true;
        } else if (this.e < 1) {
            this.q = this.a * (1 - this.e);
            this.isParabolic = false;
        } else {
            this.q = this.a * (this.e - 1);
            this.isParabolic = false;
        }
    }

    /**
     * Solve Anomaly for a given time t.
     * t is time since periapsis passage.
     */
    getState(t) {
        // 1. PARABOLIC (Barker's Equation)
        if (this.isParabolic) {
            // Mean motion for parabola logic
            // Mp = 1/2 * sqrt(mu / q^3) * t
            const Mp = 0.5 * Math.sqrt(this.mu / Math.pow(this.q, 3)) * t;

            // Solve D + D^3/3 = Mp => 3D + D^3 = 3Mp (Barker's Eq)
            // Use Cardano's method / Cube root solution for cubic x^3 + px + q = 0
            // Here x=D, p=3, q=-3Mp.
            const W = 3 * Mp;
            const Y = Math.cbrt(W + Math.sqrt(W * W + 1));
            const D = Y - 1 / Y;

            // r = q(1 + D^2)
            const r = this.q * (1 + D * D);

            // True Anomaly tan(nu/2) = D
            const nu = 2 * Math.atan(D);
            const cosNu = Math.cos(nu);
            const sinNu = Math.sin(nu);

            // Velocity state
            const h = Math.sqrt(2 * this.mu * this.q);
            const vr = (this.mu / h) * sinNu;
            const vt = (this.mu / h) * (1 + cosNu);

            // Cartesian Position
            const x = r * cosNu;
            const y = r * sinNu;

            // Cartesian Velocity (Radial + Tangential components rotated)
            const vx = vr * cosNu - vt * sinNu;
            const vy = vr * sinNu + vt * cosNu;

            return { x, y, vx, vy, r };
        }

        // 2. ELLIPTIC (e < 1)
        if (this.e < 1.0) {
            const a = this.a;
            const n = Math.sqrt(this.mu / Math.pow(a, 3));
            const M = n * t;

            let E = M;
            for (let i = 0; i < 15; i++) {
                E = E - (E - this.e * Math.sin(E) - M) / (1 - this.e * Math.cos(E));
            }

            const r = a * (1 - this.e * Math.cos(E));

            // Allow r to be calculated, check for invalid state (optional but good for stability)
            if (isNaN(r)) return { x: 0, y: 0, vx: 0, vy: 0, r: 0 };

            const vx = -Math.sqrt(this.mu * a) / r * Math.sin(E);
            const vy = Math.sqrt(this.mu * a * (1 - this.e * this.e)) / r * Math.cos(E);

            // Position
            const cosNu = (Math.cos(E) - this.e) / (1 - this.e * Math.cos(E));
            const sinNu = (Math.sqrt(1 - this.e * this.e) * Math.sin(E)) / (1 - this.e * Math.cos(E));

            return {
                x: r * cosNu,
                y: r * sinNu,
                vx: vx,
                vy: vy,
                r: r
            };
        }

        // 3. HYPERBOLIC (e > 1)
        else {
            const a = this.a;
            const n = Math.sqrt(this.mu / Math.pow(a, 3));
            const M = n * t;

            let H = M;
            // Initial guess
            if (this.e > 1.0) H = M / (this.e - 1);

            for (let i = 0; i < 15; i++) {
                const f = this.e * Math.sinh(H) - H - M;
                const df = this.e * Math.cosh(H) - 1;
                if (Math.abs(df) < 0.00001) break;
                H = H - f / df;
            }

            const r = a * (this.e * Math.cosh(H) - 1);
            const x = a * (this.e - Math.cosh(H));
            const y = a * Math.sqrt(this.e * this.e - 1) * Math.sinh(H);

            const H_dot = n / (this.e * Math.cosh(H) - 1);
            const vx = -a * Math.sinh(H) * H_dot;
            const vy = a * Math.sqrt(this.e * this.e - 1) * Math.cosh(H) * H_dot;

            return { x, y, vx, vy, r };
        }
    }

    /**
     * Generate points for the orbit line.
     */
    getOrbitPoints(segments = 200) {
        if (this.isParabolic) {
            const pts = [];
            // D = tan(nu/2). Max D determines length of arms.
            // r = q(1+D^2). visible range ~ 100 * q? => D ~ 10.
            const maxD = 6.0;
            for (let i = -segments / 2; i <= segments / 2; i++) {
                const D = (i / (segments / 2)) * maxD;
                const r = this.q * (1 + D * D);

                const nu = 2 * Math.atan(D);
                const x = r * Math.cos(nu);
                const y = r * Math.sin(nu);
                pts.push(new THREE.Vector3(x, y, 0));
            }
            return pts;
        }
        else if (this.e >= 1.0) {
            // Hyperbola
            const limit = Math.acos(-1 / this.e);
            const maxNu = limit * 0.92; // 92% to asymptote

            const pts = [];
            for (let i = -segments / 2; i <= segments / 2; i++) {
                const nu = (i / (segments / 2)) * maxNu;
                const r = (this.a * (this.e * this.e - 1)) / (1 + this.e * Math.cos(nu));
                const x = r * Math.cos(nu);
                const y = r * Math.sin(nu);
                pts.push(new THREE.Vector3(x, y, 0));
            }
            return pts;

        } else {
            // Ellipse (e < 1)
            const pts = [];
            for (let i = 0; i <= segments; i++) {
                const nu = (i / segments) * 2 * Math.PI;
                const r = (this.a * (1 - this.e * this.e)) / (1 + this.e * Math.cos(nu));
                const x = r * Math.cos(nu);
                const y = r * Math.sin(nu);
                pts.push(new THREE.Vector3(x, y, 0));
            }
            return pts;
        }
    }
}
