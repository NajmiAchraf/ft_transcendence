/** @type {import('tailwindcss').Config} */
const colors = require('tailwindcss/colors')

module.exports = {
  content: ["./app/**/*.{html,js,ts,jsx,tsx}"],
  theme: {
    mode: 'jit',
    extend: {
      backgroundSize: {
        'size-200': '200% 200%',
      },
      backgroundPosition: {
        'pos-0': '0% 0%',
        'pos-100': '100% 100%',
      },
    },
    fontfamily: {
      monsterrat: ["Montserrat", "sans-serif"],
    },
  },
  plugins: [require("daisyui"), require('tailwindcss-debug-screens'),]
    
};

