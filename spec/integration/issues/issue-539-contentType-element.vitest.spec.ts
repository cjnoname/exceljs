import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import { Workbook, WorkbookWriter, WorkbookReader } from '../../../src/index.js';

describe('github issues', () => {
  describe('issue 539 - <contentType /> element', () => {
    it('Reading 1904.xlsx', () => {
      const wb = new Workbook();
      return wb.xlsx.readFile('./spec/integration/data/1519293514-KRISHNAPATNAM_LINE_UP.xlsx');
    });
  });
});
