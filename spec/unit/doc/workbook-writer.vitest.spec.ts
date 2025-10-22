import { describe, it, expect } from 'vitest';
import Stream from 'stream';
import Excel from '../../../src/index.js';

describe('Workbook Writer', () => {
  it('returns undefined for non-existant sheet', () => {
    const stream = new Stream.Writable({
      write: function noop() {},
    });
    const wb = new Excel.WorkbookWriter({
      stream,
    });
    wb.addWorksheet('first');
    expect(wb.getWorksheet('w00t')).toBeUndefined();
  });
});
