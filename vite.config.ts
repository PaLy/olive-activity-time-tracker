import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import checker from "vite-plugin-checker";

export default defineConfig({
  base: "./",
  plugins: [
    react(),
    !process.env.VITEST
      ? checker({
          typescript: true,
          eslint: {
            useFlatConfig: true,
            lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
          },
        })
      : undefined,
  ],
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "c8",
      reporter: ["text", "json", "html"],
    },
    setupFiles: ["src/setupTests.ts"],
    testTimeout: 10000,
    retry: 2,
  },
});
