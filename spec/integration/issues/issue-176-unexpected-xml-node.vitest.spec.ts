import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { Workbook, WorkbookWriter, WorkbookReader } from '../../../src/index.js';

describe('github issues', () => {
  it('issue 176 - Unexpected xml node in parseOpen', () => {
    const wb = new Workbook();
    return wb.xlsx.readFile('./spec/integration/data/test-issue-176.xlsx').then(() => {
      // arriving here is success
      expect(true).toBe(true);
    });
  });
});
