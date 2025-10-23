import { describe, it } from 'vitest';
import { Workbook } from '../../../src/index.js';

describe('github issues', () => {
  it(
    'issue 988 - table without autofilter model',
    () => {
      const wb = new Workbook();
      return wb.xlsx.readFile('./spec/integration/data/test-issue-988.xlsx');
    },
    6000
  );
});
