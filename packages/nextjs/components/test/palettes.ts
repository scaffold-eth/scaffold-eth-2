export type PaletteValues = {
  primary: string;
  "primary-content": string;
  secondary: string;
  "secondary-content": string;
  accent: string;
  "accent-content": string;
  neutral: string;
  "neutral-content": string;
  "base-100": string;
  "base-200": string;
  "base-300": string;
  "base-content": string;
  info: string;
  success: string;
  warning: string;
  error: string;
};

export type Palette = {
  name: string;
  light: PaletteValues;
  dark: PaletteValues;
};

export const palettes: Palette[] = [
  {
    name: "Default",
    light: {
      primary: "#93bbfb",
      "primary-content": "#212638",
      secondary: "#dae8ff",
      "secondary-content": "#212638",
      accent: "#93bbfb",
      "accent-content": "#212638",
      neutral: "#212638",
      "neutral-content": "#ffffff",
      "base-100": "#ffffff",
      "base-200": "#f4f8ff",
      "base-300": "#dae8ff",
      "base-content": "#212638",
      info: "#93bbfb",
      success: "#34eeb6",
      warning: "#ffcf72",
      error: "#ff8863",
    },
    dark: {
      primary: "#212638",
      "primary-content": "#f9fbff",
      secondary: "#323f61",
      "secondary-content": "#f9fbff",
      accent: "#4969a6",
      "accent-content": "#f9fbff",
      neutral: "#f9fbff",
      "neutral-content": "#385183",
      "base-100": "#385183",
      "base-200": "#2a3655",
      "base-300": "#212638",
      "base-content": "#f9fbff",
      info: "#385183",
      success: "#34eeb6",
      warning: "#ffcf72",
      error: "#ff8863",
    },
  },
  {
    name: "Slate",
    light: {
      primary: "#0f172a",
      "primary-content": "#ffffff",
      secondary: "#dde1e6",
      "secondary-content": "#1f2937",
      accent: "#2563eb",
      "accent-content": "#ffffff",
      neutral: "#737373",
      "neutral-content": "#ffffff",
      "base-100": "#ffffff",
      "base-200": "#fafafa",
      "base-300": "#f0f0f0",
      "base-content": "#212638",
      info: "#2563eb",
      success: "#00d97e",
      warning: "#ff9500",
      error: "#ff3344",
    },
    dark: {
      primary: "#d4d4d4",
      "primary-content": "#0a0a0a",
      secondary: "#3d4250",
      "secondary-content": "#e5e7eb",
      accent: "#60a5fa",
      "accent-content": "#0a0a0a",
      neutral: "#a3a3a3",
      "neutral-content": "#0a0a0a",
      "base-100": "#171717",
      "base-200": "#0a0a0a",
      "base-300": "#262626",
      "base-content": "#e5e5e5",
      info: "#60a5fa",
      success: "#00d97e",
      warning: "#ff9500",
      error: "#ff5566",
    },
  },
  {
    name: "Slate Soft",
    light: {
      primary: "#404040",
      "primary-content": "#ffffff",
      secondary: "#dde1e6",
      "secondary-content": "#1f2937",
      accent: "#3b82f6",
      "accent-content": "#ffffff",
      neutral: "#737373",
      "neutral-content": "#ffffff",
      "base-100": "#ffffff",
      "base-200": "#fafafa",
      "base-300": "#ededed",
      "base-content": "#404040",
      info: "#3b82f6",
      success: "#00d97e",
      warning: "#ff9500",
      error: "#ff3344",
    },
    dark: {
      primary: "#b3b3b3",
      "primary-content": "#1a1a1a",
      secondary: "#3d4250",
      "secondary-content": "#e5e7eb",
      accent: "#93c5fd",
      "accent-content": "#0a0a0a",
      neutral: "#888888",
      "neutral-content": "#0a0a0a",
      "base-100": "#1c1c1c",
      "base-200": "#141414",
      "base-300": "#2a2a2a",
      "base-content": "#d4d4d4",
      info: "#93c5fd",
      success: "#00d97e",
      warning: "#ff9500",
      error: "#ff5566",
    },
  },
  {
    name: "Ethereum",
    light: {
      primary: "#6c24e0",
      "primary-content": "#ffffff",
      secondary: "#dde1e6",
      "secondary-content": "#1f2937",
      accent: "#06b6d4",
      "accent-content": "#ffffff",
      neutral: "#737373",
      "neutral-content": "#ffffff",
      "base-100": "#ffffff",
      "base-200": "#fafafa",
      "base-300": "#f0f0f0",
      "base-content": "#1f2937",
      info: "#06b6d4",
      success: "#00d97e",
      warning: "#ff9500",
      error: "#ff3344",
    },
    dark: {
      primary: "#a48aff",
      "primary-content": "#0a0a0a",
      secondary: "#3d4250",
      "secondary-content": "#e5e7eb",
      accent: "#67e8f9",
      "accent-content": "#0a0a0a",
      neutral: "#a3a3a3",
      "neutral-content": "#0a0a0a",
      "base-100": "#171717",
      "base-200": "#0a0a0a",
      "base-300": "#262626",
      "base-content": "#e5e5e5",
      info: "#67e8f9",
      success: "#00d97e",
      warning: "#ff9500",
      error: "#ff5566",
    },
  },
  {
    name: "Forest",
    light: {
      primary: "#15803d",
      "primary-content": "#ffffff",
      secondary: "#525252",
      "secondary-content": "#ffffff",
      accent: "#ca8a04",
      "accent-content": "#ffffff",
      neutral: "#737373",
      "neutral-content": "#ffffff",
      "base-100": "#ffffff",
      "base-200": "#fafafa",
      "base-300": "#f0f0f0",
      "base-content": "#1f2937",
      info: "#2563eb",
      success: "#16a34a",
      warning: "#ca8a04",
      error: "#dc2626",
    },
    dark: {
      primary: "#4ade80",
      "primary-content": "#052e16",
      secondary: "#4f4d4d",
      "secondary-content": "#fafafa",
      accent: "#fde047",
      "accent-content": "#422006",
      neutral: "#a3a3a3",
      "neutral-content": "#0a0a0a",
      "base-100": "#0c1611",
      "base-200": "#050b08",
      "base-300": "#1a2620",
      "base-content": "#d1fae5",
      info: "#60a5fa",
      success: "#4ade80",
      warning: "#fde047",
      error: "#f87171",
    },
  },
  {
    name: "Sunset",
    light: {
      primary: "#c2410c",
      "primary-content": "#ffffff",
      secondary: "#525252",
      "secondary-content": "#ffffff",
      accent: "#1e40af",
      "accent-content": "#ffffff",
      neutral: "#737373",
      "neutral-content": "#ffffff",
      "base-100": "#fffefb",
      "base-200": "#fdf8ee",
      "base-300": "#f5ebd9",
      "base-content": "#422006",
      info: "#2563eb",
      success: "#16a34a",
      warning: "#ea580c",
      error: "#dc2626",
    },
    dark: {
      primary: "#fb923c",
      "primary-content": "#431407",
      secondary: "#4f4d4d",
      "secondary-content": "#fafafa",
      accent: "#93c5fd",
      "accent-content": "#0a0a0a",
      neutral: "#a3a3a3",
      "neutral-content": "#0a0a0a",
      "base-100": "#1f1410",
      "base-200": "#150e0a",
      "base-300": "#2d1f17",
      "base-content": "#fde68a",
      info: "#60a5fa",
      success: "#4ade80",
      warning: "#fb923c",
      error: "#f87171",
    },
  },
];

export const PALETTE_STYLE_ID = "palette-override";
export const PALETTE_STORAGE_KEY = "se2-test-palette";

const buildVarsBlock = (values: PaletteValues) =>
  Object.entries(values)
    .map(([k, v]) => `  --color-${k}: ${v};`)
    .join("\n");

export const applyPalette = (palette: Palette) => {
  let style = document.getElementById(PALETTE_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement("style");
    style.id = PALETTE_STYLE_ID;
    document.head.appendChild(style);
  }
  style.dataset.palette = palette.name;
  style.textContent = `[data-theme="light"] {\n${buildVarsBlock(palette.light)}\n}\n[data-theme="dark"] {\n${buildVarsBlock(palette.dark)}\n}`;
};

export const resetPalette = () => {
  document.getElementById(PALETTE_STYLE_ID)?.remove();
};
