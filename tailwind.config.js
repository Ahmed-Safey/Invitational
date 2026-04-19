/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        crimson: { DEFAULT: '#8e191c', dark: '#6a1215' },
        gold: { DEFAULT: '#c6ba8e', dark: '#a89d74' },
        cream: { DEFAULT: '#f9f8f4', mid: '#ece7d0' },
        charcoal: '#222222',
      },
      fontFamily: {
        oswald: ['Oswald', 'sans-serif'],
        crimsonPro: ['Crimson Pro', 'serif'],
        roboto: ['Roboto Condensed', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
