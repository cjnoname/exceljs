import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import inject from '@rollup/plugin-inject';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

const banner = `/*! ExcelJS ${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')} */`;

const getPlugins = (minify = false) => {
  const plugins = [
    typescript({
      tsconfig: './tsconfig.json',
      declaration: false,
      declarationMap: false,
      sourceMap: true,
      outDir: undefined, // Let Rollup handle output
      exclude: ['**/*.spec.ts', '**/*.test.ts'],
    }),
    alias({
      entries: {
        events: 'events',
        stream: 'stream-browserify',
        buffer: 'buffer',
        process: 'process',
        crypto: 'crypto-browserify',
        util: 'util',
      },
    }),
    nodeResolve({
      browser: true,
      preferBuiltins: false,
    }),
    commonjs(),
    json(),
    inject({
      Buffer: ['buffer', 'Buffer'],
      process: 'process',
    }),
    babel({
      babelHelpers: 'bundled',
      presets: ['@babel/preset-env'],
      exclude: 'node_modules/core-js/**',
    }),
  ];

  if (minify) {
    plugins.push(
      terser({
        output: {
          preamble: banner,
          ascii_only: true,
        },
      })
    );
  }

  return plugins;
};

export default [
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
      globals: {
        fs: '{}', // Stub fs for browser
      },
    },
    plugins: [
      ...getPlugins(false),
      copy({
        targets: [{ src: './LICENSE', dest: './dist' }],
        hook: 'writeBundle',
      }),
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
      globals: {
        fs: '{}', // Stub fs for browser
      },
    },
    plugins: getPlugins(true),
  },
];
