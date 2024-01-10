/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./pages/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "scaffoldEthDark",
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        scaffoldEth: {
          primary: "#FF00FF",
          "primary-content": "#FFFFFF",
          secondary: "#0000FF",
          "secondary-content": "#FFFFFF",
          accent: "#00FFFF",
          "accent-content": "#000000",
          neutral: "#444444",
          "neutral-content": "#ffffff",
          "base-100": "#FFFFFF",
          "base-200": "#FFFFFF",
          "base-300": "#DDEEF7",
          "base-400": "#CCDDE7",
          "base-800": "#000000",
          "base-content": "#444444",
          info: "#93BBFB",
          success: "#FFFF00",
          "success-content": "#000000",
          warning: "#FFCF72",
          error: "#FF0000",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          },
        },
      },
      {
        scaffoldEthDark: {
          primary: "#00F",
          "primary-content": "#FFFFFF",
          secondary: "#FF00FF",
          "secondary-content": "#FFFFFF",
          accent: "#00FFFF",
          "accent-content": "#000000",
          neutral: "#444",
          "neutral-content": "#FFF",
          "base-100": "#111111",
          "base-200": "#141414",
          "base-300": "#222222",
          "base-400": "#333333",
          "base-500": "#555555",
          "base-800": "#FFFFFF",
          "base-content": "#F9FBFF",
          info: "#385183",
          success: "#FF00FF",
          warning: "#FFCF72",
          error: "#FF0000",

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
            "--tooltip-color": "oklch(var(--p))",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            opacity: "80%",
          }, 
        },
      },
    ],
  },
  theme: {
    extend: {
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
};
