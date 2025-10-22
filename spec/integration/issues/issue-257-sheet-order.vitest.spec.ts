import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import ExcelJS from '../../../src/index.js';

describe('github issues', () => {
  it('issue 257 - worksheet order is not respected', () => {
    const wb = new ExcelJS.Workbook();
    return wb.xlsx.readFile('./spec/integration/data/test-issue-257.xlsx').then(() => {
      expect(wb.worksheets.map(ws => ws.name)).toEqual(['First', 'Second']);
    });
  });
});
