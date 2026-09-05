/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eefdf3', 100: '#d7f9e2', 300: '#7ce8ac',
          500: '#1db954', 600: '#159643', 700: '#127538'
        }
      }
    },
  },
  plugins: [],
}
