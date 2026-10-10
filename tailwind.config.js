/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#8B6F47",
        secondary: "#F4231E",
        background: "#0A0A0A",
        surface: "#1A1A1A",
        text: "#F5F5F5",
        "text-muted": "#D4C5B9",
      },
    },
  },
  plugins: [],
}
