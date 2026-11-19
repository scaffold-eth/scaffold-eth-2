import typescript from "@rollup/plugin-typescript";
import autoExternal from "rollup-plugin-auto-external";

export default {
  input: "src/dev/create-extension.ts",
  output: {
    dir: "dist/create-extension",
    format: "es",
    sourcemap: true,
  },
  plugins: [autoExternal(), typescript({ exclude: ["templates/**", "externalExtensions/**"] })],
};
