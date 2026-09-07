/** @type {import("tailwindcss").Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "wolf-red": "#bc1823",
      },
      fontFamily: {
        wolFlex: ["Anton SC Regular"],
      },
    },
  },
  plugins: [],
};
