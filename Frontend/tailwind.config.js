/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",

  theme: {
    extend: {
      colors: {
        primary: "#000000",
        secondary: "#fed7aa",
        danger: "#ef4444",
      },
      fontFamily: {
        roboto: ["Roboto", "sans-serif"],
        geist: ["Geist", "sans-serif"],
      },
    },
    fontFamily: {
      sans: ["Geist", "sans-serif"],
    },
  },

  plugins: [
    function ({ addVariant }) {
      addVariant("child", "& > *");
      addVariant("child-hover", "& > *:hover");
    },
  ],
};
