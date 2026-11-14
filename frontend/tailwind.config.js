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
          bgSoft: '#F7F9F7',
          navy: '#17324D',
          deepGreen: '#176B4D',
          darkNavy: '#17324D',
          lightMint: '#DDF2EA',
          offWhite: '#F7F9F7',
          charcoal: '#263238',
          navyMuted: '#263238',
          navyLight: '#52636B',
          cardPale: '#EEF7F2',
          cardBorder: '#D6E4DC',
          blueAccent: '#176B4D',
          blueHover: '#12563E',
          blueLight: '#DDF2EA',
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
        sans: ['Inter', 'Noto Sans Devanagari', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
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
