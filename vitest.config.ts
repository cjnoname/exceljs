import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx", ".json"]
  },
  test: {
    globals: true,
    environment: "node",
    include: ["src/__test__/**/*.test.ts"],
    exclude: ["src/__test__/browser/**/*.test.ts"]
  }
});
