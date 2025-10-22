import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from 'vitest';
import ExcelJS from '../../../excel.js';

const TEST_XLSX_FILE_NAME = './spec/out/pr-1157.test.xlsx';

describe('github issues', () => {
  it('pull request 1204 - Read and write data validation should be successful', async () => {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.readFile('./spec/integration/data/test-pr-1204.xlsx');
    const expected = {
      E1: {
        type: 'textLength',
        formulae: [2],
        showInputMessage: true,
        showErrorMessage: true,
        operator: 'greaterThan',
      },
      E4: {
        type: 'textLength',
        formulae: [2],
        showInputMessage: true,
        showErrorMessage: true,
        operator: 'greaterThan',
      },
    };
    const ws = wb.getWorksheet(1);
    expect(ws.dataValidations.model).toEqual(expected);
    await wb.xlsx.writeFile(TEST_XLSX_FILE_NAME);
  });
});
