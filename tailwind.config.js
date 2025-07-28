/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
    "./services/**/*.{js,ts,jsx,tsx}",
    "./utils/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      colors: {
        "brand-background": "#171E2B",
        "brand-panel": "#242B40",
        "brand-card": "#2D374F",
        "brand-primary": "#4A55C7",
        "brand-secondary": "#38A169",
        "brand-accent": "#805AD5",
        "brand-text-primary": "#F7FAFC",
        "brand-text-secondary": "#A0AEC0",
        "brand-text-tertiary": "#718096",
        "brand-border": "#4A5568",
        "brand-danger": "#E53E3E",
        "brand-input-bg": "#2D374F",
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(to right, #805AD5, #4A55C7)",
      },
    },
  },
  plugins: [],
};
