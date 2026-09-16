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
          50: '#F5F8F5',
          100: '#E9EFE8',
          200: '#D3DFD2',
          300: '#B4C7B3',
          400: '#8EAA8C',
          500: '#6B8569', // Calm, trustworthy Sage Green
          600: '#566E54',
          700: '#425541',
          800: '#314030',
          900: '#222D22',
        },
        sage: {
          50: '#F5F8F5',
          100: '#E9EFE8',
          200: '#D3DFD2',
          300: '#B4C7B3',
          400: '#8EAA8C',
          500: '#6B8569',
          600: '#566E54',
          700: '#425541',
        },
        terracotta: {
          50: '#FCF7F4',
          100: '#F8ECE6',
          200: '#F0D7CD',
          300: '#E4BDB0',
          400: '#D39C8C',
          500: '#BF745F', // Warm artisanal terracotta
          600: '#A65E4A',
          700: '#874937',
        },
        peach: {
          50: '#FFF9F5',
          100: '#FFF1E8',
          200: '#FFE2D1',
          300: '#FFCEB2',
          400: '#F7A882',
          500: '#E68555',
        },
        blush: {
          50: '#FCF7F8',
          100: '#FAEEF0',
          200: '#F4DBDF',
          300: '#E8BAC2',
          400: '#D994A0',
          500: '#C57180',
        },
        lavender: {
          50: '#F9F8FC',
          100: '#F2F0F8',
          200: '#E3DFEF',
          300: '#C8C2DE',
          400: '#A8A0C7',
          500: '#877EB0',
        },
        sand: {
          50: '#FDFBF7',
          100: '#FAF7F2', // Primary app canvas background
          200: '#F3EDE3',
          300: '#EAE0D2',
          400: '#DACBB8',
          500: '#C3B099',
        },
        charcoal: {
          50: '#F7F6F5',
          100: '#EBE9E7',
          200: '#D7D3D0',
          300: '#BBB4AF',
          400: '#9A938E',
          500: '#7C746F',
          600: '#605955',
          700: '#48433F',
          800: '#342F2D',
          900: '#231F1D',
        },
        pastel: {
          mint: '#E9EFE8',
          mintText: '#3B4D3A',
          peach: '#F8ECE6',
          peachText: '#874937',
          rose: '#FAEEF0',
          roseText: '#8A3846',
          cream: '#FAF7F2',
          sand: '#F3EDE3',
          sky: '#EEF4F8',
          skyText: '#355469',
          lavender: '#F2F0F8',
          lavenderText: '#554C78',
          amber: '#FDF5E6',
          amberText: '#7D5716',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(80, 65, 50, 0.05)',
        'soft-md': '0 8px 26px -3px rgba(80, 65, 50, 0.07)',
        'soft-lg': '0 14px 34px -4px rgba(80, 65, 50, 0.09)',
        'pastel': '0 8px 24px -4px rgba(107, 133, 105, 0.16)',
        'pastel-terracotta': '0 8px 24px -4px rgba(191, 116, 95, 0.16)',
      }
    },
  },
  plugins: [],
}
