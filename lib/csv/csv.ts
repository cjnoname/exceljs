import fs from 'fs';
import StreamBuf from '../utils/stream-buf.js';

import {format, parse} from 'fast-csv';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import utc from 'dayjs/plugin/utc';
import dayjs from 'dayjs';
import utils from '../utils/utils.js';

dayjs.extend(customParseFormat);
dayjs.extend(utc);

const {fs: {exists}} = utils;

interface ReadOptions {
  sheetName?: string;
  dateFormats?: string[];
  map?: (datum: any) => any;
  parserOptions?: any;
}

interface WriteOptions {
  sheetName?: string;
  sheetId?: number;
  formatterOptions?: any;
  dateFormat?: string;
  dateUTC?: boolean;
  map?: (value: any) => any;
  includeEmptyRows?: boolean;
  encoding?: string;
}

/* eslint-disable quote-props */
const SpecialValues: {[key: string]: any} = {
  'true': true,
  'false': false,
  '#N/A': {error: '#N/A'},
  '#REF!': {error: '#REF!'},
  '#NAME?': {error: '#NAME?'},
  '#DIV/0!': {error: '#DIV/0!'},
  '#NULL!': {error: '#NULL!'},
  '#VALUE!': {error: '#VALUE!'},
  '#NUM!': {error: '#NUM!'},
};
/* eslint-ensable quote-props */

class CSV {
  public workbook: any;
  public worksheet: any;

  constructor(workbook: any) {
    this.workbook = workbook;
    this.worksheet = null;
  }

  async readFile(filename: string, options?: ReadOptions): Promise<any> {
    options = options || {};
    if (!(await exists(filename))) {
      throw new Error(`File not found: ${filename}`);
    }
    const stream = fs.createReadStream(filename);
    const worksheet = await this.read(stream, options);
    stream.close();
    return worksheet;
  }

  read(stream: any, options?: ReadOptions): Promise<any> {
    options = options || {};

    return new Promise((resolve, reject) => {
      const worksheet = this.workbook.addWorksheet(options.sheetName);

      const dateFormats = options.dateFormats || [
        'YYYY-MM-DD[T]HH:mm:ssZ',
        'YYYY-MM-DD[T]HH:mm:ss',
        'MM-DD-YYYY',
        'YYYY-MM-DD',
      ];
      const map =
        options.map ||
        function(datum: any): any {
          if (datum === '') {
            return null;
          }
          const datumNumber = Number(datum);
          if (!Number.isNaN(datumNumber) && datumNumber !== Infinity) {
            return datumNumber;
          }
          const dt = dateFormats.reduce((matchingDate: any, currentDateFormat: string) => {
            if (matchingDate) {
              return matchingDate;
            }
            const dayjsObj = dayjs(datum, currentDateFormat, true);
            if (dayjsObj.isValid()) {
              return dayjsObj;
            }
            return null;
          }, null);
          if (dt) {
            return new Date(dt.valueOf());
          }
          const special = SpecialValues[datum];
          if (special !== undefined) {
            return special;
          }
          return datum;
        };

      const csvStream = parse(options.parserOptions)
        .on('data', (data: any[]) => {
          worksheet.addRow(data.map(map));
        })
        .on('end', () => {
          csvStream.emit('worksheet', worksheet);
        });

      csvStream.on('worksheet', resolve).on('error', reject);

      stream.pipe(csvStream);
    });
  }

  /**
   * @deprecated since version 4.0. You should use `CSV#read` instead. Please follow upgrade instruction: https://github.com/exceljs/exceljs/blob/master/UPGRADE-4.0.md
   */
  createInputStream(): void {
    throw new Error(
      '`CSV#createInputStream` is deprecated. You should use `CSV#read` instead. This method will be removed in version 5.0. Please follow upgrade instruction: https://github.com/exceljs/exceljs/blob/master/UPGRADE-4.0.md'
    );
  }

  write(stream: any, options?: WriteOptions): Promise<void> {
    return new Promise((resolve, reject) => {
      options = options || {};
      // const encoding = options.encoding || 'utf8';
      // const separator = options.separator || ',';
      // const quoteChar = options.quoteChar || '\'';

      const worksheet = this.workbook.getWorksheet(options.sheetName || options.sheetId);

      const csvStream = format(options.formatterOptions);
      stream.on('finish', () => {
        resolve();
      });
      csvStream.on('error', reject);
      csvStream.pipe(stream);

      const {dateFormat, dateUTC} = options;
      const map =
        options.map ||
        ((value: any) => {
          if (value) {
            if (value.text || value.hyperlink) {
              return value.hyperlink || value.text || '';
            }
            if (value.formula || value.result) {
              return value.result || '';
            }
            if (value instanceof Date) {
              if (dateFormat) {
                return dateUTC
                  ? dayjs.utc(value).format(dateFormat)
                  : dayjs(value).format(dateFormat);
              }
              return dateUTC ? dayjs.utc(value).format() : dayjs(value).format();
            }
            if (value.error) {
              return value.error;
            }
            if (typeof value === 'object') {
              return JSON.stringify(value);
            }
          }
          return value;
        });

      const includeEmptyRows = options.includeEmptyRows === undefined || options.includeEmptyRows;
      let lastRow = 1;
      if (worksheet) {
        worksheet.eachRow((row: any, rowNumber: number) => {
          if (includeEmptyRows) {
            while (lastRow++ < rowNumber - 1) {
              csvStream.write([]);
            }
          }
          const {values} = row;
          values.shift();
          csvStream.write(values.map(map));
          lastRow = rowNumber;
        });
      }
      csvStream.end();
    });
  }

  writeFile(filename: string, options?: WriteOptions): Promise<void> {
    options = options || {};

    const streamOptions = {
      encoding: (options.encoding || 'utf8') as BufferEncoding,
    };
    const stream = fs.createWriteStream(filename, streamOptions);

    return this.write(stream, options);
  }

  async writeBuffer(options?: WriteOptions): Promise<Buffer> {
    const stream = new StreamBuf();
    await this.write(stream, options);
    return stream.read();
  }
}

export default CSV;
