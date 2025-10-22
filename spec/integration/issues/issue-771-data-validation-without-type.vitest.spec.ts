import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { Workbook, WorkbookWriter, WorkbookReader } from '../../../src/index.js';

describe('github issues', () => {
  it('issue 771 - Issue with dataValidation without type and with formula1 or formula2', () => {
    const wb = new Workbook();
    return wb.xlsx.readFile('./spec/integration/data/test-issue-771.xlsx');
  });
});
