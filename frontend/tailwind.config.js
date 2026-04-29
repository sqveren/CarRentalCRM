/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/index.tsx',
    './src/main.tsx',
    './src/app/**/*.{js,jsx,ts,tsx}',
    '!./src/app/components/ui/**/*',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
