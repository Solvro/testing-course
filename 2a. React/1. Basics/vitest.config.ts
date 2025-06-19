import config from "./vite.config";
import { defineConfig } from "vitest/config";

export default defineConfig({
  ...config,
  test: {
    environment: "jsdom",
    globals: true,
  },
});