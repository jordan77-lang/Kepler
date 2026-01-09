/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
            // Custom Sci-Fi / Space palette can go here
            space: {
                900: '#0b0d17', // Deep space
                800: '#151932',
                400: '#3d5afe', // Neon accent
            }
        },
        fontFamily: {
            sans: ['Inter', 'system-ui', 'sans-serif'],
        }
      },
    },
    plugins: [],
  }
