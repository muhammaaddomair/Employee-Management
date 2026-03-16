/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './renderer/index.html',
    './renderer/**/*.{ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        sidebar: '#1f2937',
        primary: '#2563eb'
      }
    }
  },
  plugins: []
};
