/** @type {import('tailwindcss').Config} */

const colors = require('tailwindcss/colors');

module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  important: '#zaptime-calendar',
  prefix: 'cal-',
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          25: '#FCFCFD',
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D2D6DB',
          400: '#9DA4AE',
          500: '#6C737F',
          600: '#4D5761',
          700: '#384250',
          800: '#1F2A37',
          900: '#111927',
        },

        theme: {
          25: 'var(--c-zaptime-25)',
          50: 'var(--c-zaptime-50)',
          100: 'var(--c-zaptime-100)',
          200: 'var(--c-zaptime-200)',
          300: 'var(--c-zaptime-300)',
          400: 'var(--c-zaptime-400)',
          500: 'var(--c-zaptime-500)',
          600: 'var(--c-zaptime-600)',
          700: 'var(--c-zaptime-700)',
          800: 'var(--c-zaptime-800)',
          900: 'var(--c-zaptime-900)',
        },

        accent: {
          light: 'var(--c-zaptime-accent-light)',
          base: 'var(--c-zaptime-accent-base)',
          dark: 'var(--c-zaptime-accent-dark)',
        },

        // accent: {
        //   "-1": "#2ED3B7",
        //   0: "#15B79E",
        //   1: "#0E9384",
        // },
      },

      borderRadius: {
        md: 'var(--radius-zaptime)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
  ],
  corePlugins: {
    preflight: false,
  },
};
