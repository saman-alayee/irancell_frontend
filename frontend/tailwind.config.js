/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './app.vue',
  ],
  theme: {
    extend: {
      colors: {
        irancell: {
          yellow: '#FFCC00',
          'yellow-dark': '#E6B800',
          black: '#1A1A1A',
          gray: '#F5F5F5',
          'gray-dark': '#666666',
        },
      },
      fontFamily: {
        sans: ['Vazirmatn', 'Tahoma', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
