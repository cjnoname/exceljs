import { defineConfig } from "rolldown";
import fs from "fs";
import { visualizer } from "rollup-plugin-visualizer";
import nodePolyfills from "node-stdlib-browser";

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * ${pkg.description}
 * (c) ${new Date().getFullYear()} ${pkg.author.name}
 * Released under the ${pkg.license} License
 */`;

const browserPolyfills = {
  ...nodePolyfills,
  vm: false
};

const createAnalyzePlugin = (filename, open = false) =>
  process.env.ANALYZE
    ? [
        visualizer({
          filename,
          open,
          gzipSize: true,
          brotliSize: true
        })
      ]
    : [];

export default defineConfig([
  // Browser: exceljs.iife.js (for development/debugging with <script> tag)
  {
    input: "./src/index.browser.ts",
    external: ["@aws-sdk/client-s3"],
    platform: "browser",
    tsconfig: "./tsconfig.json",
    output: {
      dir: "./dist/browser",
      format: "iife",
      name: "ExcelJS",
      sourcemap: true,
      banner,
      exports: "named",
      entryFileNames: "exceljs.iife.js"
    },
    resolve: {
      alias: browserPolyfills
    },
    transform: {
      inject: {
        Buffer: ["buffer", "Buffer"],
        process: "process"
      }
    },
    plugins: [
      {
        name: "copy-license",
        writeBundle() {
          if (!fs.existsSync("./dist")) {
            fs.mkdirSync("./dist", { recursive: true });
          }
          fs.copyFileSync("./LICENSE", "./dist/LICENSE");
        }
      },
      ...createAnalyzePlugin("./dist/stats-iife.html")
    ]
  },
  // Browser: exceljs.iife.min.js (for production with <script> tag)
  {
    input: "./src/index.browser.ts",
    external: ["@aws-sdk/client-s3"],
    platform: "browser",
    tsconfig: "./tsconfig.json",
    output: {
      dir: "./dist/browser",
      format: "iife",
      name: "ExcelJS",
      sourcemap: false,
      banner,
      exports: "named",
      minify: true,
      entryFileNames: "exceljs.iife.min.js"
    },
    resolve: {
      alias: browserPolyfills
    },
    transform: {
      inject: {
        Buffer: ["buffer", "Buffer"],
        process: "process"
      }
    },
    plugins: createAnalyzePlugin("./dist/stats-iife-min.html", true)
  }
]);
