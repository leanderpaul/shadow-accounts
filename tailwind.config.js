/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./views/**/*.hbs', './public/scripts/**/*.js'],
  theme: {
    colors: {
      success: '#10bc83',
      error: '#ff4d4d',
      warn: '#ff9900',
    },
  },
};
