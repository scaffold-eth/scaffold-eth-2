/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./utils/**/*.{js,ts,jsx,tsx}"],
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("daisyui")],
  darkTheme: "dark",
  darkMode: ["selector", "[data-theme='dark']"],
  // DaisyUI theme colors
  daisyui: {
    themes: [
      {
        light: {
          primary: "#2563eb",          // Rich blue
          "primary-content": "#ffffff",
          secondary: "#4b5563",        // Cool gray
          "secondary-content": "#ffffff",
          accent: "#8b5cf6",           // Purple
          "accent-content": "#ffffff",
          neutral: "#1f2937",          // Dark gray
          "neutral-content": "#ffffff",
          "base-100": "#ffffff",
          "base-200": "#f3f4f6",       // Light gray
          "base-300": "#e5e7eb",       // Lighter gray
          "base-content": "#1f2937",
          info: "#3b82f6",             // Blue
          success: "#10b981",          // Green
          warning: "#f59e0b",          // Amber
          error: "#ef4444", 

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
        dark: {
          primary: "#3b82f6",          // Bright blue
          "primary-content": "#ffffff",
          secondary: "#6b7280",        // Gray
          "secondary-content": "#ffffff",
          accent: "#8b5cf6",           // Purple
          "accent-content": "#ffffff",
          neutral: "#f3f4f6",          // Light gray
          "neutral-content": "#1f2937",
          "base-100": "#1f2937",       // Dark gray
          "base-200": "#111827",       // Darker gray
          "base-300": "#0f172a",       // Darkest gray/blue
          "base-content": "#f3f4f6",
          info: "#60a5fa",             // Light blue
          success: "#34d399",          // Green
          warning: "#fbbf24",          // Amber
          error: "#f87171",            // Red

          "--rounded-btn": "0.5rem",    // Less extreme rounding

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
