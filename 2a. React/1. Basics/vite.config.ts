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
  // @ts-expect-error: test config is recognised by vitest here
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./setup-tests.ts",
  },
});
