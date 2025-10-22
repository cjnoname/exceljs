import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { Workbook, WorkbookWriter, WorkbookReader } from '../../../src/index.js';

describe('github issues', () => {
  it('issue 257 - worksheet order is not respected', () => {
    const wb = new Workbook();
    return wb.xlsx.readFile('./spec/integration/data/test-issue-257.xlsx').then(() => {
      expect(wb.worksheets.map(ws => ws.name)).toEqual(['First', 'Second']);
    });
  });
});
