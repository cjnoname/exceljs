import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import ExcelJS from '../../../excel.js';

describe('github issues', () => {
  it('issue 771 - Issue with dataValidation without type and with formula1 or formula2', () => {
    const wb = new ExcelJS.Workbook();
    return wb.xlsx.readFile('./spec/integration/data/test-issue-771.xlsx');
  });
});
