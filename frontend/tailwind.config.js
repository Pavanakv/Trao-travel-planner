/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAFAF9',
        ink: '#1F2A44',
        stamp: '#C75D3D',
        teal: '#3F6B62',
        mustard: '#D9A441',
        indigo: '#4B3B6B',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};