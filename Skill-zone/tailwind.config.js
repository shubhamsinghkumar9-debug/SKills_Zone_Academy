/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Neue Haas Grotesk Display Pro"', '"Helvetica Neue"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        brand: {
          green: '#9EFF00',
          dark: '#0A0A0A',
          gray: '#141414',
          mid: '#1E1E1E',
          muted: '#6B6B6B',
          light: '#F0F0F0',
        },
      },
      animation: {
        marquee: 'marquee 20s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}
