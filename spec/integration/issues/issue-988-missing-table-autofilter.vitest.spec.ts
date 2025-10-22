import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { Workbook, WorkbookWriter, WorkbookReader } from '../../../src/index.js';

describe('github issues', () => {
  it(
    'issue 988 - table without autofilter model',
    () => {
      const wb = new Workbook();
      return wb.xlsx.readFile('./spec/integration/data/test-issue-988.xlsx');
    },
    { timeout: 6000 }
  );
});
