import path from 'path';

/**
 * Generate unique output filename for tests to avoid file conflicts during parallel testing
 * @param testFilePath - Path to the test file (use import.meta.url)
 * @param extension - File extension, defaults to '.xlsx'
 * @returns Unique test file path
 */
export function getUniqueTestFilePath(testFilePath: string, extension = '.xlsx'): string {
  const fileName = path.basename(testFilePath, '.vitest.spec');
  return `./spec/out/${fileName}${extension}`;
}


export function getUniqueTestFilePathCJS(filename: string, extension = '.xlsx'): string {
  const fileName = path.basename(filename, '.vitest.spec');
  return `./spec/out/${fileName}${extension}`;
}
