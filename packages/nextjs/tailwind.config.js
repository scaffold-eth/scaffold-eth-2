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
          secondary: "#D0E2FF",
          "secondary-content": "#000000",
          accent: "#37cdbe",
          "accent-content": "#163835",
          neutral: "#3d4451",
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#F2F2F2",
          "base-300": "#F5F7FB",
          "base-content": "#1f2937",

          "--rounded-btn": "0.25rem",
          "--navbar-padding": "0",
        },
      },
    ],
  },
};
