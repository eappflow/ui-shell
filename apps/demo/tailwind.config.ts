/** @type {import('tailwindcss').Config} */

export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,ts,js,jsx}",
    "../../packages/**/src/**/*.{vue,ts,js,jsx}",
    "../../modules/**/src/**/*.{vue,ts,js,jsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
