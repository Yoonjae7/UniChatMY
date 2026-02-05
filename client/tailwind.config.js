/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: {
          50: '#f0f4ff',
          100: '#e0e8ff',
          200: '#c7d4fe',
          300: '#a5b8fc',
          400: '#8193f8',
          500: '#636ef1',
          600: '#4f4de5',
          700: '#423eca',
          800: '#3735a3',
          900: '#313381',
          950: '#0f0f23',
        },
        neon: {
          cyan: '#00fff5',
          pink: '#ff00ff',
          purple: '#9d00ff',
          green: '#00ff88',
        }
      },
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px #00fff5, 0 0 10px #00fff5, 0 0 15px #00fff5' },
          '100%': { boxShadow: '0 0 10px #00fff5, 0 0 20px #00fff5, 0 0 30px #00fff5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        }
      }
    },
  },
  plugins: [],
}
