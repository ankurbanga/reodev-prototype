/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#5B5BD6',
          light: 'rgba(91, 91, 214, 0.15)',
          hover: 'rgba(91, 91, 214, 0.08)',
        },
      },
    },
  },
  plugins: [],
}
