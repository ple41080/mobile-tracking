/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#59B292',
        'primary-light': '#7ECBA9',
        yellow: '#FFC94D',
        orange: '#FFC94D',
        accent: '#FFC94D',
        bg: '#0F2820',
        background: '#0F2820',
        surface: '#1A3D2E',
        gold: '#FFC94D',
        gem: '#FA6781',
        danger: '#FA6781',
        'text-secondary': '#FAE7CB',
      },
    },
  },
  plugins: [],
}
