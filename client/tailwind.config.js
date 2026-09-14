/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F4FBF7',
          100: '#E6F7ED',
          200: '#C8EEDB',
          300: '#9CE0C1',
          400: '#62CC9E',
          500: '#2EAF7D', // Trustworthy warm emerald
          600: '#1E8F63',
          700: '#176F4E',
          800: '#13583E',
          900: '#0E4430',
        },
        pastel: {
          mint: '#E8F5E9',
          mintText: '#1B5E20',
          peach: '#FFF3E0',
          peachText: '#E65100',
          rose: '#FCE8E6',
          roseText: '#B71C1C',
          cream: '#FFFDF9',
          sand: '#F7F4EB',
          sky: '#E3F2FD',
          skyText: '#0D47A1',
          lavender: '#EDE7F6',
          lavenderText: '#4A148C',
          amber: '#FEF7E0',
          amberText: '#B06000',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        'soft-lg': '0 10px 30px -4px rgba(0, 0, 0, 0.08)',
        'pastel': '0 8px 24px -4px rgba(46, 175, 125, 0.12)',
      }
    },
  },
  plugins: [],
}
