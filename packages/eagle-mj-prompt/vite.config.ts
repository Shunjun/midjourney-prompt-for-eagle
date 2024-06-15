import { defineConfig } from "vite";

export default defineConfig({
  build: {
    minify: false,
    lib: {
      entry: ["src/xhr-intercept.ts", "src/ws.ts"],
      name: "eagle-mj-prompt",
      formats: ["es"],
    },
    // rollupOptions: {
    //   output: {
    //     format: "es",
    //     intro: "(()=>{",
    //     outro: "})()",
    //   },
    // },
  },
});
