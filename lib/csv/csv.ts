import fs from 'fs';
import StreamBuf from '../utils/stream-buf.js';

import {format, parse} from 'fast-csv';
import {format as formatDate, formatISO, isValid, parse as parseDate} from 'date-fns';
import {toZonedTime} from 'date-fns-tz';
import utils from '../utils/utils.js';

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
        "yyyy-MM-dd'T'HH:mm:ssXXX",
        "yyyy-MM-dd'T'HH:mm:ss",
        'MM/dd/yyyy',
        'MM-dd-yyyy',
        'dd/MM/yyyy',
        'dd-MM-yyyy',
        'yyyy-MM-dd',
        'yyyy/MM/dd',
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
            try {
              const parsedDate = parseDate(datum, currentDateFormat, new Date());
              if (isValid(parsedDate)) {
                return parsedDate;
              }
            } catch {
              // Invalid format, try next
            }
            return null;
          }, null);
          if (dt) {
            return dt;
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
                  ? formatDate(toZonedTime(value, 'UTC'), dateFormat)
                  : formatDate(value, dateFormat);
              }
              return dateUTC ? formatISO(toZonedTime(value, 'UTC')) : formatISO(value);
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
