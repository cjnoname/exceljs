import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import ExcelJS from '../../../src/index.js';

const TEST_XLSX_FILE_NAME = './spec/integration/data/test-issue-1364.xlsx';

describe('github issues', () => {
  it('issue 1364 - Incorrect Worksheet Name on Streaming XLSX Reader', async () => {
    const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(TEST_XLSX_FILE_NAME, {});
    workbookReader.read();
    workbookReader.on('worksheet', worksheet => {
      expect(worksheet.name).toBe('Sum Worksheet');
    });
  });
});
