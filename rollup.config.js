import path from "node:path";
import Typescript from "@rollup/plugin-typescript";
import Terser from "@rollup/plugin-terser";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const commonConfig = {
  plugins: [Typescript(), Terser()],
  output: {
    dir: path.resolve(__dirname, "dist"),
  },
};

/**
 * @type {import('rollup').RollupOptions}
 */
const config = [
  {
    input: path.resolve(__dirname, "src/scripts/main.ts"),
    ...commonConfig,
  },
  {
    input: path.resolve(__dirname, "src/scripts/extension.ts"),
    ...commonConfig,
  },
  {
    input: path.resolve(__dirname, "src/scripts/sw.ts"),
    ...commonConfig,
  },
];

export default config;
