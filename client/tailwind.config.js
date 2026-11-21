/** @type {import('tailwindcss').Config} */

// Semantic color tokens backed by CSS variables (see src/index.css).
// Light/dark values live in one place, so components never need `dark:` variants.
const token = (name) => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
      },
      colors: {
        canvas: token("canvas"),
        surface: token("surface"),
        subtle: token("subtle"),
        line: token("line"),
        "line-strong": token("line-strong"),
        ink: token("ink"),
        muted: token("muted"),
        faint: token("faint"),
        primary: {
          DEFAULT: token("primary"),
          hover: token("primary-hover"),
          soft: token("primary-soft"),
          ink: token("primary-ink"),
        },
        status: {
          todo: token("status-todo"),
          progress: token("status-progress"),
          done: token("status-done"),
        },
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        card: "0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.03)",
        pop: "0 12px 32px -8px rgb(0 0 0 / 0.18), 0 4px 8px -4px rgb(0 0 0 / 0.08)",
      },
    },
  },
  plugins: [],
};
