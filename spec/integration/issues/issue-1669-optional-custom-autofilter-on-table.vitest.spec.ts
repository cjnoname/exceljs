import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import ExcelJS from '../../../index.js';

describe('github issues', () => {
  it('issue 1669 - optional autofilter and custom autofilter on tables', async () => {
    const wb = new ExcelJS.Workbook();
    return wb.xlsx.readFile('./spec/integration/data/test-issue-1669.xlsx');
  }, { timeout: 6000 });
});
