import { defineConfig } from "vite";

import path from "node:path";

import UnoCSS from "unocss/vite";
import Vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [
    UnoCSS(),
    Vue(),
    {
      name: "html-name",
      generateBundle: {
        order: "post",
        handler(options, bundle) {
          if ("index.html" in bundle) {
            bundle["index.html"].fileName = "popup.html";
          }
        },
      },
    },
  ],
  build: {
    emptyOutDir: false,
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
  },
});
