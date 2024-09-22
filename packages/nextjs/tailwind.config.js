/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#E2F0FF", //GM Blue - header nav bg
          "primary-content": "#000000",
          secondary: "#73B4FF", //light blue (from Shareable Asset gradient) - toggle switch, header nav btn hover
          "secondary-content": "#030A21", //deep blue (from Brand Guidlines frames)
          accent: "#0054FA", //ApeCoin Blue - btn bg, link:hover, input ring border
          "accent-content": "#030A21", //deep blue (from Brand Guidlines frames)
          neutral: "#002787", //GN Blue - btn bg hover
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#E2F0FF", //GM Blue
          "base-300": "#89D0FF", //sky blue (from holographic gradient)
          "base-content": "#000000",
          info: "#93BBFB",
          success: "#34EEB6",
          warning: "#FFEE00", //Banana Bill yellow
          error: "#EB8280", //soft red (from holographic gradient)

          "--rounded-btn": "9999rem",

          ".tooltip": {
            "--tooltip-tail": "6px",
          },
          ".link": {
            textUnderlineOffset: "2px",
          },
          ".link:hover": {
            color: "#0054FA", //ApeCoin Blue
          },
        },
      },
      {
        dark: {
          primary: "#030A21", //deep blue (from Brand Guidlines frames) - overall bg, header btn bg, toggle switch
          "primary-content": "#FFFFFF",
          secondary: "#002787", //GN Blue
          "secondary-content": "#FFFFFF",
          accent: "#0054FA", //ApeCoin Blue - btn bg, link:hover, input ring border, header nav btn hover
          "accent-content": "#FFFFFF",
          neutral: "#E2F0FF", //GM Blue
          "neutral-content": "#000000",
          "base-100": "#73B4FF", //light blue (from Shareable Asset gradient)
          "base-200": "#3875C6", //soft blue - btn bg hover
          "base-300": "#89D0FF", //sky blue (from holographic gradient) - copy icon
          "base-content": "#FFFFFF",
          info: "#325D7F",
          success: "#34EEB6",
          warning: "#FFEE00", //Banana Bill yellow
          error: "#EB8280", //soft red (from holographic gradient)

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
      backgroundImage: {
        'gradient-blue': 'linear-gradient(90deg, #0154F8 0%, #01298A 100%)',
        'gradient-holographic': 'linear-gradient(88.93deg, #A281FF 7.81%, #EB8280 31.14%, #EBBF9A 65.93%, #89D0FF 90.66%)',
        'ape-radial': "url('/images/frame-ape-radial.jpg')",

        // Dark mode background
        'dark-nav-bg': "url('/images/curtis_sprint_bg.jpg')",
      },
      boxShadow: {
        center: "0 0 12px -2px rgb(0 0 0 / 0.05)",
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
};
