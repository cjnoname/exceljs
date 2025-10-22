import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import ExcelJS from '../../../excel.js';

describe('github issues', () => {
  it('issue 988 - table without autofilter model', () => {
    const wb = new ExcelJS.Workbook();
    return wb.xlsx.readFile('./spec/integration/data/test-issue-988.xlsx');
  }, { timeout: 6000 });
});
