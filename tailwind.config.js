const tailwindcss = require('tailwindcss');
/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./app/views/**/*.{html,css,js,ejs}","./public/**/*.{css,js}"],
  theme: {
    extend: {
      fontFamily: {
        title_font: ['title_font', 'sans-serif'],
        body_font: ['body_font', 'serif']
      },
    },
  },
  plugins: [],
}
