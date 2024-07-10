const tailwindcss = require('tailwindcss');
/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./app/views/**/*.{html,css,js,ejs}","./public/**/*.{css,js}"],
  theme: {
    extend: {},
  },
  plugins: [],
}
