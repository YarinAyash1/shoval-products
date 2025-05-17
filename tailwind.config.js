/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Varela Round"', 'Assistant', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('tailwindcss-rtl'),
  ],
}; 