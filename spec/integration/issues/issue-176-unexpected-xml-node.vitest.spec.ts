import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import ExcelJS from '../../../src/index.js';

describe('github issues', () => {
  it('issue 176 - Unexpected xml node in parseOpen', () => {
    const wb = new ExcelJS.Workbook();
    return wb.xlsx.readFile('./spec/integration/data/test-issue-176.xlsx').then(() => {
      // arriving here is success
      expect(true).toBe(true);
    });
  });
});
