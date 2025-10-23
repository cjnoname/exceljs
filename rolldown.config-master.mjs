import { defineConfig } from 'rolldown';

export default defineConfig({
  input: 'src/index-master.ts',
  output: {
    file: 'dist/exceljs-master.mjs',
    format: 'esm',
  },
  external: [
    'fs',
    'stream',
    'events',
    'tmp',
    'unzipper',
    'saxes',
    'readable-stream',
  ],
});
