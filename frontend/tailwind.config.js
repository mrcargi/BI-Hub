/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        },
        surface: {
          0:   '#ffffff',
          50:  '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          300: '#d6d3d1',
        },
        ink: {
          900: '#1c1917',
          700: '#44403c',
          500: '#78716c',
          400: '#a8a29e',
          300: '#d6d3d1',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Geist Mono', 'monospace'],
      },
      boxShadow: {
        soft:   '0 1px 3px rgba(0,0,0,.04), 0 4px 12px rgba(0,0,0,.03)',
        card:   '0 2px 8px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.03)',
        float:  '0 4px 16px rgba(0,0,0,.08), 0 12px 40px rgba(0,0,0,.04)',
        glow:   '0 0 20px rgba(22,163,74,.12)',
      },
      borderRadius: {
        xl:  '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      fontSize: {
        '2xs': ['10px', '14px'],
      },
    },
  },
  plugins: [],
}
