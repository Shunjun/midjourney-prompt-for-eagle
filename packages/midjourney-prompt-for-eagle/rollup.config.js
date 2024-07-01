import path from "node:path";
import Typescript from "@rollup/plugin-typescript";

const __dirname = path.dirname(new URL(import.meta.url).pathname);

/**
 * @type {import('rollup').RollupOptions}
 */
const config = [
  {
    input: path.resolve(__dirname, "src/xhr-intercept.ts"),
    plugins: [Typescript()],
    output: {
      dir: path.resolve(__dirname, "dist"),
    },
  },
  {
    input: path.resolve(__dirname, "src/extension.ts"),
    plugins: [Typescript()],
    output: {
      dir: path.resolve(__dirname, "dist"),
    },
  },
];

export default config;
