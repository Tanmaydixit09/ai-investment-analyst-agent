/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B1220',
          900: '#121A2B',
          800: '#1B2740',
        },
        fog: {
          200: '#C9D2E3',
        },
        paper: {
          50: '#F3F5FA',
        },
        signal: {
          amber: '#D8A73D',
          green: '#34D399',
          red: '#F0575A',
          slate: '#8B96AE',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
};
