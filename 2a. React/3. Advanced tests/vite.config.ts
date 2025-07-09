/// <reference types="vitest/config" />
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    coverage: {
      reportOnFailure: true,
      reporter: ["text", "json-summary", "json"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "src/tests",
        "src/main.tsx",
        "src/App.tsx",
        "src/api/api-z-planer-mock-api-dla-ciekawskich.ts",
        "src/components/ui",
        "**/*.d.ts",
      ],
    },
    environment: "jsdom",
    setupFiles: "./src/tests/setup.ts",
    globals: true,
  },
});
