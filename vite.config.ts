import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: "KinetixCharts",
      fileName: "kinetix-charts",
    },
  },
  test: {
    environment: "happy-dom",
  },
});
