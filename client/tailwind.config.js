/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2C3E50',
          light: '#34495E',
          dark: '#243342'
        },
        secondary: '#ECF0F1',
        accent: '#E74C3C',
        highlight: '#F1C40F',
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#2C3E50',
          muted: '#7F8C8D'
        },
        error: '#E74C3C',
        success: '#27AE60',
      },
    },
  },
  plugins: [],
}