/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        health: {
          bg: '#FFFFFF',
          bgSoft: '#F8FAFC',
          navy: '#0A192F',
          navyMuted: '#1E293B',
          navyLight: '#334155',
          cardPale: '#F0F7FF',
          cardBorder: '#D0E3F7',
          blueAccent: '#1D4ED8',
          blueHover: '#1E40AF',
          blueLight: '#E0F2FE',
          danger: '#DC2626',
          dangerSoft: '#FEF2F2',
          dangerBorder: '#FECACA',
          warning: '#D97706',
          warningSoft: '#FFFBEB',
          success: '#16A34A',
          successSoft: '#F0FDF4',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'card-subtle': '0 1px 3px 0 rgba(10, 25, 47, 0.05), 0 1px 2px 0 rgba(10, 25, 47, 0.03)',
        'card-hover': '0 4px 6px -1px rgba(10, 25, 47, 0.08), 0 2px 4px -1px rgba(10, 25, 47, 0.04)',
        'glow-blue': '0 0 15px rgba(29, 78, 216, 0.35)',
      }
    },
  },
  plugins: [],
}
