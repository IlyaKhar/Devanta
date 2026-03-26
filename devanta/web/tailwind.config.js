/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          500: "#2563EB",
          600: "#1D4ED8"
        }
      }
    },
  },
  plugins: [],
};
