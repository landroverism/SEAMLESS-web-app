/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          light: 'var(--color-primary-light)',
          dark: 'var(--color-primary)'
        },
        secondary: 'var(--color-background)',
        accent: 'var(--color-accent)',
        highlight: 'var(--color-accent-light)',
        surface: 'var(--color-card)',
        text: {
          DEFAULT: 'var(--color-text)',
          muted: 'var(--color-text-muted)'
        },
        error: 'var(--color-danger)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
      },
      backgroundColor: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-background)',
        card: 'var(--color-card)',
      },
      textColor: {
        primary: 'var(--color-text)',
        secondary: 'var(--color-text-muted)',
      },
      borderColor: {
        primary: 'var(--color-border)',
      },
      boxShadow: {
        primary: '0 4px 6px var(--color-shadow)',
        lg: '0 10px 15px -3px var(--color-shadow), 0 4px 6px -2px var(--color-shadow)',
      },
    },
  },
  plugins: [],
}