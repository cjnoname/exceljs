import { describe, it, expect } from 'vitest';
import { styles } from '../../utils/vitest-utils.js';
import Excel from '../../../src/index.js';

describe('Worksheet', () => {
  describe('Styles', () => {
    it('sets row styles', () => {
      const wb = new Excel.Workbook();
      const ws = wb.addWorksheet('basket');

      ws.getCell('A1').value = 5;
      ws.getCell('A1').numFmt = styles.numFmts.numFmt1;
      ws.getCell('A1').font = styles.fonts.arialBlackUI14;

      ws.getCell('C1').value = 'Hello, World!';
      ws.getCell('C1').alignment = styles.namedAlignments.bottomRight;
      ws.getCell('C1').border = styles.borders.doubleRed;
      ws.getCell('C1').fill = styles.fills.redDarkVertical;

      ws.getRow(1).numFmt = styles.numFmts.numFmt2;
      ws.getRow(1).font = styles.fonts.comicSansUdB16;
      ws.getRow(1).alignment = styles.namedAlignments.middleCentre;
      ws.getRow(1).border = styles.borders.thin;
      ws.getRow(1).fill = styles.fills.redGreenDarkTrellis;

      expect(ws.getCell('A1').numFmt).toEqual(styles.numFmts.numFmt2);
      expect(ws.getCell('A1').font).toEqual(styles.fonts.comicSansUdB16);
      expect(ws.getCell('A1').alignment).toEqual(styles.namedAlignments.middleCentre);
      expect(ws.getCell('A1').border).toEqual(styles.borders.thin);
      expect(ws.getCell('A1').fill).toEqual(styles.fills.redGreenDarkTrellis);

      expect(ws.findCell('B1')).toBeUndefined();

      expect(ws.getCell('C1').numFmt).toEqual(styles.numFmts.numFmt2);
      expect(ws.getCell('C1').font).toEqual(styles.fonts.comicSansUdB16);
      expect(ws.getCell('C1').alignment).toEqual(styles.namedAlignments.middleCentre);
      expect(ws.getCell('C1').border).toEqual(styles.borders.thin);
      expect(ws.getCell('C1').fill).toEqual(styles.fills.redGreenDarkTrellis);

      // when we 'get' the previously null cell, it should inherit the row styles
      expect(ws.getCell('B1').numFmt).toEqual(styles.numFmts.numFmt2);
      expect(ws.getCell('B1').font).toEqual(styles.fonts.comicSansUdB16);
      expect(ws.getCell('B1').alignment).toEqual(styles.namedAlignments.middleCentre);
      expect(ws.getCell('B1').border).toEqual(styles.borders.thin);
      expect(ws.getCell('B1').fill).toEqual(styles.fills.redGreenDarkTrellis);
    });

    it('sets col styles', () => {
      const wb = new Excel.Workbook();
      const ws = wb.addWorksheet('basket');

      ws.getCell('A1').value = 5;
      ws.getCell('A1').numFmt = styles.numFmts.numFmt1;
      ws.getCell('A1').font = styles.fonts.arialBlackUI14;

      ws.getCell('A3').value = 'Hello, World!';
      ws.getCell('A3').alignment = styles.namedAlignments.bottomRight;
      ws.getCell('A3').border = styles.borders.doubleRed;
      ws.getCell('A3').fill = styles.fills.redDarkVertical;

      ws.getColumn('A').numFmt = styles.numFmts.numFmt2;
      ws.getColumn('A').font = styles.fonts.comicSansUdB16;
      ws.getColumn('A').alignment = styles.namedAlignments.middleCentre;
      ws.getColumn('A').border = styles.borders.thin;
      ws.getColumn('A').fill = styles.fills.redGreenDarkTrellis;

      expect(ws.getCell('A1').numFmt).toEqual(styles.numFmts.numFmt2);
      expect(ws.getCell('A1').font).toEqual(styles.fonts.comicSansUdB16);
      expect(ws.getCell('A1').alignment).toEqual(styles.namedAlignments.middleCentre);
      expect(ws.getCell('A1').border).toEqual(styles.borders.thin);
      expect(ws.getCell('A1').fill).toEqual(styles.fills.redGreenDarkTrellis);

      expect(ws.findRow(2)).toBeUndefined();

      expect(ws.getCell('A3').numFmt).toEqual(styles.numFmts.numFmt2);
      expect(ws.getCell('A3').font).toEqual(styles.fonts.comicSansUdB16);
      expect(ws.getCell('A3').alignment).toEqual(styles.namedAlignments.middleCentre);
      expect(ws.getCell('A3').border).toEqual(styles.borders.thin);
      expect(ws.getCell('A3').fill).toEqual(styles.fills.redGreenDarkTrellis);

      // when we 'get' the previously null cell, it should inherit the column styles
      expect(ws.getCell('A2').numFmt).toEqual(styles.numFmts.numFmt2);
      expect(ws.getCell('A2').font).toEqual(styles.fonts.comicSansUdB16);
      expect(ws.getCell('A2').alignment).toEqual(styles.namedAlignments.middleCentre);
      expect(ws.getCell('A2').border).toEqual(styles.borders.thin);
      expect(ws.getCell('A2').fill).toEqual(styles.fills.redGreenDarkTrellis);
    });
  });
});
