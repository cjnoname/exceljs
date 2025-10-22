import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { Buffer } from 'buffer';

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      // 使用浏览器版本的库
      './exceljs.nodejs': './exceljs.browser',
      buffer: 'buffer',
    },
  },
  optimizeDeps: {
    exclude: ['@aws-sdk/client-s3'], // 排除 AWS SDK
    include: ['buffer'],
  },
  define: {
    global: 'globalThis', // 在浏览器中 global 等同于 globalThis
    'global.Buffer': Buffer,
    require: '(m => m)', // 简单的 require polyfill
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
