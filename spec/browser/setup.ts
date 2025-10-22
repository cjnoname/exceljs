// 浏览器测试 setup - 加载编译后的 ExcelJS 全局变量
import { beforeAll } from 'vitest';

beforeAll(async () => {
  // 在浏览器环境中，通过 script 标签加载 ExcelJS
  const script = document.createElement('script');
  script.src = '/dist/exceljs.js';
  
  // 等待脚本加载完成
  await new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
});
