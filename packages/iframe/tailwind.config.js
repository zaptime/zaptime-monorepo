/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          25: 'var(--c-gray-25)',
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
        },

        accent: {
          '-1': 'var(--c-accent--1)',
          0: 'var(--c-accent-0)',
          1: 'var(--c-accent-1)',
        },
      },
      borderRadius: {
        md: 'var(--radius)',
      },
    },
  },
  plugins: [],
};
