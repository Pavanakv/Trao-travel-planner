/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F2E8D5',   // aged paper background
        ink: '#1F2A44',     // navy ink for text/headers
        stamp: '#C75D3D',   // postage-stamp terracotta, primary accent
        teal: '#3F6B62',    // muted teal, secondary accent
        mustard: '#D9A441', // mustard, tertiary/highlight
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
