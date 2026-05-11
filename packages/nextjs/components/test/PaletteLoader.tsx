"use client";

import { useEffect } from "react";
import { PALETTE_STORAGE_KEY, applyPalette, palettes } from "./palettes";

export const PaletteLoader = () => {
  useEffect(() => {
    const name = localStorage.getItem(PALETTE_STORAGE_KEY);
    if (!name) return;
    const palette = palettes.find(p => p.name === name);
    if (palette) applyPalette(palette);
  }, []);

  return null;
};
