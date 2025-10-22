import { describe, it, beforeAll, afterAll } from 'vitest';
import { PassThrough } from 'stream';
import express from 'express';
import got from 'got';
import testutils from '../utils/index';
import ExcelJS from '../../excel';

describe('Express', () => {
  let server: any;
  
  beforeAll(() => {
    const app: any = express();
    app.get('/workbook', (req: any, res: any) => {
      const wb = testutils.createTestBook(new ExcelJS.Workbook(), 'xlsx', undefined);
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader('Content-Disposition', 'attachment; filename=Report.xlsx');
      wb.xlsx.write(res).then(() => {
        res.end();
      });
    });
    server = app.listen(3003);
  });

  afterAll(() => {
    server.close();
  });

  it('downloads a workbook', async () => {
    const res = got.stream('http://127.0.0.1:3003/workbook', {
      decompress: false,
    });
    const wb2 = new ExcelJS.Workbook();
    // TODO: Remove passThrough with got 10+ (requires node v10+)
    await wb2.xlsx.read(res.pipe(new PassThrough()));
    testutils.checkTestBook(wb2, 'xlsx', undefined, {});
  }, 5000);
});
