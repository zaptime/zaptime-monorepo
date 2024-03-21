/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          50: 'var(--c-gray-50)',
          100: 'var(--c-gray-100)',
          200: 'var(--c-gray-200)',
          300: 'var(--c-gray-300)',
          400: 'var(--c-gray-400)',
          500: 'var(--c-gray-500)',
          600: 'var(--c-gray-600)',
          700: 'var(--c-gray-700)',
          800: 'var(--c-gray-800)',
          900: 'var(--c-gray-900)',
          950: 'var(--c-gray-950)',
        },

        accent: {
          '-1': 'var(--c-accent-light)',
          0: 'var(--c-accent-base)',
          1: 'var(--c-accent-dark)',
        },
      },
      borderRadius: {
        md: 'var(--radius)',
      },
    },
  },
  plugins: [],
};
