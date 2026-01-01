/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",

  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'blanco-roto': '#FDFBF7', 
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

