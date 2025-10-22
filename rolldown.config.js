import { defineConfig } from 'rolldown';
import fs from 'fs';

const banner = `/*! ExcelJS ${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')} */`;

const getPlugins = (_minify = false) => {
  const plugins = [];

  return plugins;
};

export default defineConfig([
  // Browser: exceljs.js (for development/debugging with <script> tag)
  {
    input: './lib/exceljs.bare.ts',
    external: ['fs'],
    output: {
      file: './dist/exceljs.js',
      format: 'iife',
      name: 'ExcelJS',
      sourcemap: true,
      banner,
      exports: 'named',
      globals: {
        fs: '{}', // Stub fs for browser
      },
    },
    resolve: {
      alias: {
        events: 'events',
        stream: 'stream-browserify',
        buffer: 'buffer',
        process: 'process',
        crypto: 'crypto-browserify',
        util: 'util',
      },
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
  // Browser: exceljs.min.js (for production with <script> tag)
  {
    input: './lib/exceljs.bare.ts',
    external: ['fs'],
    output: {
      file: './dist/exceljs.min.js',
      format: 'iife',
      name: 'ExcelJS',
      sourcemap: true,
      banner,
      exports: 'named',
      globals: {
        fs: '{}', // Stub fs for browser
      },
      minify: true,
    },
    resolve: {
      alias: {
        events: 'events',
        stream: 'stream-browserify',
        buffer: 'buffer',
        process: 'process',
        crypto: 'crypto-browserify',
        util: 'util',
      },
    },
    transform: {
      inject: {
        Buffer: ['buffer', 'Buffer'],
        process: 'process',
      },
    },
    plugins: getPlugins(true),
  },
  // Node.js: CJS bundle for CommonJS projects
  {
    input: './lib/exceljs.nodejs.ts',
    output: {
      file: './dist/cjs/index.js',
      format: 'cjs',
      sourcemap: true,
      banner,
      exports: 'named',
    },
    plugins: getPlugins(false),
  },
]);
