/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#2D6A2D',
        'primary-light': '#5DB347',
        yellow: '#F5C518',
        orange: '#F57C00',
        bg: '#0F1A0F',
        surface: '#1A2E1A',
        gold: '#F5C518',
        gem: '#FF8C00',
        danger: '#E24B4A',
        'text-secondary': '#A0A878',
      },
    },
  },
  plugins: [],
}
