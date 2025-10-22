import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { Workbook, WorkbookWriter, WorkbookReader } from '../../../src/index.js';

describe('github issues', () => {
  describe('pull request 1487 - lastColumn with an empty column', () => {
    it('Reading 1904.xlsx', () => {
      const wb = new Workbook();
      return wb.xlsx.readFile('./spec/integration/data/1904.xlsx').then(() => {
        const ws = wb.getWorksheet('Sheet1');
        expect(ws.lastColumn).toBe(ws.getColumn(2));
      });
    });
  });
  // the new property is also tested in gold.spec.js
});
