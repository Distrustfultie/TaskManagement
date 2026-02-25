/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  darkMode: "class",

  theme: {
    extend: {
      colors: {
        primary: "#CD1C18",
        secondary: "#FFA896",
        accent: "#9B1313",
        dark: "#38000A",
      },

      /* ---------- Animated Gradient ---------- */
      animation: {
        gradient: "gradient 8s ease infinite",
      },

      keyframes: {
        gradient: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
    },
  },

  plugins: [],
};