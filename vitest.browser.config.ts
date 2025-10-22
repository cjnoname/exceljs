import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { Buffer } from 'buffer';

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      // Use browser version of the library
      './exceljs.nodejs': './exceljs.browser',
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    exclude: ['@aws-sdk/client-s3'], // Exclude AWS SDK
    include: ['buffer'],
  },
  define: {
    global: 'globalThis', // In browser, global equals globalThis
    'global.Buffer': Buffer,
    require: '(m => m)', // Simple require polyfill
  },
  test: {
    globals: true,
    setupFiles: ['./spec/browser/setup.ts'],
    browser: {
      enabled: true,
      provider: 'playwright',
      headless: true,
      instances: [
        {
          browser: 'chromium',
        },
      ],
    },
    include: ['spec/browser/**/*.vitest.spec.ts'],
  },
});
