/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {
    extend: {
      colors: {
        primary: '#CD1C18',
        secondary: '#FFA896',
        accent: '#9B1313',
        dark: '#38000A',
      }
    },
  },
  plugins: [],
}