import { describe, it, expect } from 'vitest';
import Stream from 'readable-stream';
import Excel from '../../../lib/exceljs.nodejs.js';

describe('Workbook Writer', () => {
  it('returns undefined for non-existant sheet', () => {
    const stream = new Stream.Writable({
      write: function noop() {},
    });
    const wb = new Excel.stream.xlsx.WorkbookWriter({
      stream,
    });
    wb.addWorksheet('first');
    expect(wb.getWorksheet('w00t')).toBeUndefined();
  });
});
