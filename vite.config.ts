import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    !process.env.VITEST
      ? checker({
          typescript: true,
          oxlint: {
            lintCommand: "oxlint src",
            watchPath: "src",
          },
        })
      : undefined,
  ],
  build: {
    chunkSizeWarningLimit: 600,
    sourcemap: true,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["fake-indexeddb/auto", "blob-polyfill", "src/setupTests.ts"],
    testTimeout: 20000,
    retry: 2,
  },
});
