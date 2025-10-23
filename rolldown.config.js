import { defineConfig } from 'rolldown';
import fs from 'fs';
import { visualizer } from 'rollup-plugin-visualizer';
import nodePolyfills from 'node-stdlib-browser';

const banner = `/*! ExcelJS ${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')} */`;

const browserPolyfills = {
  ...nodePolyfills,
  vm: false,
};

const createAnalyzePlugin = (filename, open = false) =>
  process.env.ANALYZE
    ? [
        visualizer({
          filename,
          open,
          gzipSize: true,
          brotliSize: true,
        }),
      ]
    : [];

export default defineConfig([
  // Browser: exceljs.iife.js (for development/debugging with <script> tag)
  {
    input: './src/index.browser.ts',
    external: ['@aws-sdk/client-s3'],
    output: {
      file: './dist/exceljs.iife.js',
      format: 'iife',
      name: 'ExcelJS',
      sourcemap: true,
      banner,
      exports: 'named',
    },
    resolve: {
      alias: browserPolyfills,
    },
    transform: {
      inject: {
        Buffer: ['buffer', 'Buffer'],
        process: 'process',
      },
    },
    plugins: [
      {
        name: 'copy-license',
        writeBundle() {
          if (!fs.existsSync('./dist')) {
            fs.mkdirSync('./dist', { recursive: true });
          }
          fs.copyFileSync('./LICENSE', './dist/LICENSE');
        },
      },
      ...createAnalyzePlugin('./dist/stats-iife.html'),
    ],
  },
  // Browser: exceljs.iife.min.js (for production with <script> tag)
  {
    input: './src/index.browser.ts',
    external: ['@aws-sdk/client-s3'],
    output: {
      file: './dist/exceljs.iife.min.js',
      format: 'iife',
      name: 'ExcelJS',
      sourcemap: true,
      banner,
      exports: 'named',
      minify: true,
    },
    resolve: {
      alias: browserPolyfills,
    },
    transform: {
      inject: {
        Buffer: ['buffer', 'Buffer'],
        process: 'process',
      },
    },
    plugins: createAnalyzePlugin('./dist/stats-iife-min.html'),
  },
  // Browser: exceljs.browser.mjs (ESM for modern bundlers like Webpack/Vite)
  {
    input: './src/index.browser.ts',
    external: ['@aws-sdk/client-s3'],
    output: {
      file: './dist/exceljs.browser.mjs',
      format: 'esm',
      sourcemap: true,
      banner,
    },
    resolve: {
      alias: browserPolyfills,
    },
    transform: {
      inject: {
        Buffer: ['buffer', 'Buffer'],
        process: 'process',
      },
    },
    plugins: createAnalyzePlugin('./dist/stats-browser.html'),
  },
  // Node.js: exceljs.node.cjs (CJS bundle for CommonJS projects)
  {
    input: './src/index.ts',
    platform: 'node',
    external: ['@aws-sdk/client-s3'],
    output: {
      file: './dist/exceljs.node.cjs',
      format: 'cjs',
      sourcemap: true,
      banner,
      exports: 'named',
    },
    plugins: createAnalyzePlugin('./dist/stats-node-cjs.html'),
  },
  // Node.js: exceljs.node.mjs (ESM bundle for ES modules projects)
  {
    input: './src/index.ts',
    platform: 'node',
    external: ['@aws-sdk/client-s3'],
    output: {
      file: './dist/exceljs.node.mjs',
      format: 'esm',
      sourcemap: true,
      banner,
    },
    plugins: createAnalyzePlugin('./dist/stats-node-esm.html', true),
  },
  // Node.js: exceljs.node-master.mjs (ESM bundle with master's WorkbookReader for benchmarking)
  {
    input: './src/index-master.ts',
    platform: 'node',
    external: ['@aws-sdk/client-s3'],
    output: {
      file: './dist/exceljs.node-master.mjs',
      format: 'esm',
      sourcemap: true,
      banner,
    },
    plugins: [],
  },
]);
