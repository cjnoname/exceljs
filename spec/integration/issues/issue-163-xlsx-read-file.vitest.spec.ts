import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import ExcelJS from '../../../excel.js';

describe('github issues', () => {
  it('issue 163 - Error while using xslx readFile method', () => {
    const wb = new ExcelJS.Workbook();
    return wb.xlsx
      .readFile('./spec/integration/data/test-issue-163.xlsx')
      .then(() => {
        // arriving here is success
        expect(true).toBe(true);
      });
  });
});
