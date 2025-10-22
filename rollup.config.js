import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import inject from '@rollup/plugin-inject';
import alias from '@rollup/plugin-alias';
import json from '@rollup/plugin-json';
import stdLibBrowser from 'node-stdlib-browser';

const banner = `/*! ExcelJS ${new Date().toLocaleDateString('en-GB').replace(/\//g, '-')} */`;

// 共享的插件配置
const getPlugins = (minify = false) => {
  const plugins = [
    alias({
      entries: stdLibBrowser,
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
  // Bundle: exceljs.js (full bundle)
  {
    input: './lib/exceljs.browser.js',
    output: {
      file: './dist/exceljs.js',
      format: 'umd',
      name: 'ExcelJS',
      sourcemap: true,
      banner,
    },
    plugins: getPlugins(false),
  },
  // Bundle: exceljs.min.js (minified)
  {
    input: './lib/exceljs.browser.js',
    output: {
      file: './dist/exceljs.min.js',
      format: 'umd',
      name: 'ExcelJS',
      sourcemap: true,
      banner,
    },
    plugins: getPlugins(true),
  },
  // Bare: exceljs.bare.js
  {
    input: './lib/exceljs.bare.js',
    output: {
      file: './dist/exceljs.bare.js',
      format: 'umd',
      name: 'ExcelJS',
      sourcemap: true,
      banner,
    },
    plugins: [
      ...getPlugins(false),
      copy({
        targets: [{ src: './LICENSE', dest: './dist' }],
        hook: 'writeBundle',
      }),
    ],
  },
  // Bare: exceljs.bare.min.js (minified)
  {
    input: './lib/exceljs.bare.js',
    output: {
      file: './dist/exceljs.bare.min.js',
      format: 'umd',
      name: 'ExcelJS',
      sourcemap: true,
      banner,
    },
    plugins: getPlugins(true),
  },
];
