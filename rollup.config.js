import typescript from "@rollup/plugin-typescript";
import autoExternal from "rollup-plugin-auto-external";

export default {
  input: "src/cli.ts",
  output: {
    dir: "dist",
    format: "es",
    sourcemap: true,
  },
  plugins: [autoExternal(), typescript({ exclude: ["templates/**"] })],
};
