import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
import { Buffer } from "buffer";
import { playwright } from "@vitest/browser-playwright";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    alias: {
      // Use browser version of the library
      "./exceljs.nodejs": "./exceljs.browser",
      buffer: "buffer"
    }
  },
  optimizeDeps: {
    include: ["buffer"]
  },
  define: {
    global: "globalThis", // In browser, global equals globalThis
    "global.Buffer": Buffer,
    require: "(m => m)" // Simple require polyfill
  },
  test: {
    globals: true,
    testTimeout: 30000,
    setupFiles: ["./src/__test__/browser/setup.ts"],
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [
        {
          browser: "chromium"
        }
      ]
    },
    include: ["src/__test__/browser/**/*.test.ts"]
  }
});
