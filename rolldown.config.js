import { defineConfig } from 'rolldown';
import fs from 'fs';
import { visualizer } from 'rollup-plugin-visualizer';
import nodePolyfills from 'node-stdlib-browser';

const banner = `/*! ExcelJS ${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')} */`;

const browserPolyfills = {
  ...nodePolyfills,
  vm: false,
};

const getPlugins = (_minify = false) => {
  const plugins = [];

  return plugins;
};

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
      ...getPlugins(false),
      {
        name: 'copy-license',
        writeBundle() {
          if (!fs.existsSync('./dist')) {
            fs.mkdirSync('./dist', { recursive: true });
          }
          fs.copyFileSync('./LICENSE', './dist/LICENSE');
        },
      },
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
    plugins: getPlugins(true),
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
    plugins: getPlugins(false),
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
    plugins: getPlugins(false),
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
    plugins: [
      ...getPlugins(false),
      visualizer({
        filename: './dist/stats.html',
        open: true,
        gzipSize: true,
        brotliSize: true,
      }),
    ],
  },
]);
