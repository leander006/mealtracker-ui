/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        // A considered palette instead of default Tailwind blue/gray -
        // warm off-black background, a distinctive lime-forward accent
        // that reads as "fresh/healthy" rather than generic SaaS teal.
        ink: {
          950: '#0c0e0d',
          900: '#141613',
          850: '#191c19',
          800: '#20241f',
          700: '#2c322a',
          600: '#3b4238',
          500: '#5c6656',
        },
        accent: {
          400: '#a6e35b',
          500: '#8fd639',
          600: '#72b428',
        },
        peach: {
          400: '#ffb088',
          500: '#ff9466',
        },
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(143, 214, 57, 0.15), 0 8px 24px -8px rgba(143, 214, 57, 0.25)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.4'/%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
}
