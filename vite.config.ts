import { defineConfig } from "vite";

export default defineConfig({
  root: "demo", // Serve demo folder at root for dev server
  build: {
    lib: {
      entry: "../src/index.ts",
      name: "KinetixCharts",
      fileName: "kinetix-charts",
    },
    outDir: "../dist",
  },
});
