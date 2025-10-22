import { describe, it, expect } from 'vitest';
import fs from 'fs';
import { promisify } from 'util';

const exists = promisify(fs.exists);

describe('ExcelJS', () => {
  describe('dist folder', () => {
    it('should include LICENSE', async () => {
      expect(await exists('./dist/LICENSE')).toBe(true);
    });
    
    it('should include exceljs.js', async () => {
      expect(await exists('./dist/exceljs.js')).toBe(true);
    });
    
    it('should include exceljs.min.js', async () => {
      expect(await exists('./dist/exceljs.min.js')).toBe(true);
    });
    
    it('should include exceljs.bare.js', async () => {
      expect(await exists('./dist/exceljs.bare.js')).toBe(true);
    });
    
    it('should include exceljs.bare.min.js', async () => {
      expect(await exists('./dist/exceljs.bare.min.js')).toBe(true);
    });
  });
});
