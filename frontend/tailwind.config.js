/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        sage: {
          50:  '#f2f7f4',
          100: '#e0ede5',
          200: '#c2daca',
          300: '#96c0a4',
          400: '#63a07c',
          500: '#40855d',
          600: '#2f6847',
          700: '#265438',
          800: '#1e4230',
          900: '#192f24',
        },
        warm: {
          50:  '#fdf8f3',
          100: '#faeedd',
          200: '#f5dabc',
          300: '#edbe8f',
          400: '#e29b5f',
          500: '#d67d3a',
          600: '#c0642a',
          700: '#9f4e23',
          800: '#803f22',
          900: '#68341e',
        },
        slate2: {
          50:  '#f8fafc',
          100: '#f0f4f8',
          200: '#dce5ef',
          300: '#b9cad9',
          400: '#8aa6be',
          500: '#6285a1',
          600: '#4a6a85',
          700: '#3b546b',
          800: '#324659',
          900: '#2c3c4b',
        },
      },
    },
  },
  plugins: [],
}
