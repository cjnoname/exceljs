import path from 'path';

/**
 * 为测试生成唯一的输出文件名，避免并行测试时的文件冲突
 * @param testFilePath - 测试文件的路径 (使用 import.meta.url)
 * @param extension - 文件扩展名，默认 '.xlsx'
 * @returns 唯一的测试文件路径
 */
export function getUniqueTestFilePath(testFilePath: string, extension = '.xlsx'): string {
  // 从测试文件路径提取文件名
  const fileName = path.basename(testFilePath, '.vitest.spec.ts');
  return `./spec/out/${fileName}${extension}`;
}

/**
 * 为 CommonJS 环境生成唯一的测试文件路径
 * @param filename - __filename
 * @param extension - 文件扩展名，默认 '.xlsx'  
 * @returns 唯一的测试文件路径
 */
export function getUniqueTestFilePathCJS(filename: string, extension = '.xlsx'): string {
  const fileName = path.basename(filename, '.vitest.spec.ts');
  return `./spec/out/${fileName}${extension}`;
}
