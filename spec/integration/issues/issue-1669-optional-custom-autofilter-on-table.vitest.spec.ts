import { describe, it } from 'vitest';
import { Workbook } from '../../../src/index.js';

describe('github issues', () => {
  it(
    'issue 1669 - optional autofilter and custom autofilter on tables',
    async () => {
      const wb = new Workbook();
      return wb.xlsx.readFile('./spec/integration/data/test-issue-1669.xlsx');
    },
    6000
  );
});
