// 浏览器测试 setup - 加载 UMD bundle
import { beforeAll } from 'vitest';

beforeAll(async () => {
  // 通过 script 标签加载 ExcelJS UMD bundle
  const script = document.createElement('script');
  script.src = '/dist/exceljs.iife.js';

  await new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = e => {
      console.error('Failed to load ExcelJS:', e);
      reject(e);
    };
    document.head.appendChild(script);
  });

  console.log('ExcelJS loaded:', typeof (globalThis as any).ExcelJS);
});
