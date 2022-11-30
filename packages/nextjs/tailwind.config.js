/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        scaffoldEth: {
          primary: "#93BBFB",
          "primary-content": "#000000",
          "primary-focus": "#7eaaef",
          secondary: "#f000b8",
          "secondary-content": "#ffffff",
          accent: "#37cdbe",
          "accent-content": "#163835",
          neutral: "#3d4451",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#F2F2F2",
          "base-300": "#E5E6E6",
          "base-content": "#1f2937",

          "--rounded-btn": "0.2rem",
        },
      },
    ],
  },
};
