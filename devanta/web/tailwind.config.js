/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#FFF7ED",
          500: "#F97316",
          600: "#EA580C",
          700: "#C2410C"
        },
        // Нейтральный «чистый» тёмный фон без синего хвоста у дефолтного slate.
        slate: {
          600: "#525252",
          700: "#3f3f3f",
          800: "#1f1f1f",
          900: "#121212",
          950: "#000000"
        }
      }
    },
  },
  plugins: [],
};
