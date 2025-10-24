import { beforeAll } from "vitest";

beforeAll(async () => {
  const script = document.createElement("script");
  script.src = "/dist/browser/exceljs.iife.min.js";

  await new Promise((resolve, reject) => {
    script.onload = resolve;
    script.onerror = e => {
      console.error("Failed to load ExcelJS:", e);
      reject(e);
    };
    document.head.appendChild(script);
  });

  console.log("ExcelJS loaded:", typeof (globalThis as any).ExcelJS);
});
