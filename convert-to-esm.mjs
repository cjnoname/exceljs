#!/usr/bin/env node

/**
 * 将所有 TypeScript 文件从 CommonJS 转换为 ESM
 * - 将相对路径的 import 添加 .js 扩展名
 * - 将 export = 转换为 export default
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = __dirname;

// 需要转换的目录
const dirsToConvert = [
  'lib',
];

// 需要转换的根目录文件
const rootFilesToConvert = [
  'index.ts',
  'excel.ts',
];

/**
 * 转换单个 TypeScript 文件
 */
function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // 1. 转换相对路径的 import，添加 .js 扩展名
  // 匹配: import ... from './xxx' 或 '../xxx'
  content = content.replace(
    /^(import\s+(?:[\w\s{},*]+\s+from\s+)?['"])(\.[^'"]+)(['"])/gm,
    (match, prefix, importPath, suffix) => {
      // 跳过已经有扩展名的
      if (importPath.endsWith('.js') || importPath.endsWith('.json')) {
        return match;
      }
      
      // 添加 .js 扩展名
      modified = true;
      return `${prefix}${importPath}.js${suffix}`;
    }
  );

  // 2. 转换 export = 为 export default
  content = content.replace(
    /^export\s*=\s*(.+);?$/gm,
    (match, exportName) => {
      modified = true;
      return `export default ${exportName};`;
    }
  );

  // 3. 如果文件被修改，写回
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Converted: ${path.relative(rootDir, filePath)}`);
    return true;
  }
  
  return false;
}

/**
 * 递归遍历目录并转换所有 .ts 文件
 */
function convertDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  let count = 0;

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      count += convertDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      if (convertFile(fullPath)) {
        count++;
      }
    }
  }

  return count;
}

/**
 * 主函数
 */
function main() {
  console.log('开始转换 TypeScript 文件为 ESM...\n');
  
  let totalConverted = 0;

  // 转换根目录的指定文件
  console.log('转换根目录文件:');
  for (const file of rootFilesToConvert) {
    const filePath = path.join(rootDir, file);
    if (fs.existsSync(filePath)) {
      if (convertFile(filePath)) {
        totalConverted++;
      }
    }
  }

  // 转换指定目录
  for (const dir of dirsToConvert) {
    const dirPath = path.join(rootDir, dir);
    if (fs.existsSync(dirPath)) {
      console.log(`\n转换 ${dir}/ 目录:`);
      const count = convertDirectory(dirPath);
      totalConverted += count;
    }
  }

  console.log(`\n转换完成! 共转换 ${totalConverted} 个文件。`);
}

main();
