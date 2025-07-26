/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'sketch-white': '#FFFFFF',
        'pen-black': '#000000',
        'grid-lines': '#E5E5E5',
        'sticky-default': '#FFDC97',
        'sticky-pink': '#FFDEEA',
        'sticky-blue': '#BEE3F8',
        'sticky-green': '#C6F6D5',
        'text-primary': '#2D3748',
        'text-accent': '#4A5568',
      },
      fontFamily: {
        'primary': ['Roboto', 'sans-serif'],
        'code': ['Fira Code', 'Monaco', 'monospace'],
      },
      boxShadow: {
        'sticky': '2px 2px 8px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}