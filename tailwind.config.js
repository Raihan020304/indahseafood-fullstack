/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ocean: {
          50:  '#e6f4f8',
          100: '#b3dce8',
          200: '#80c4d8',
          300: '#4dacc8',
          400: '#2a94b5',
          500: '#1a7a9a',
          600: '#126080',
          700: '#0a4866',
          800: '#04304d',
          900: '#011833',
        },
        coral: {
          50:  '#fff1ee',
          100: '#ffd5c8',
          200: '#ffb8a1',
          300: '#ff9b7a',
          400: '#ff7e54',
          500: '#e5622e',
          600: '#cc4b1e',
          700: '#a33615',
          800: '#7a220c',
          900: '#521004',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
