"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const stream_buf_1 = __importDefault(require("../utils/stream-buf"));
const fastCsv = __importStar(require("fast-csv"));
const customParseFormat_1 = __importDefault(require("dayjs/plugin/customParseFormat"));
const utc_1 = __importDefault(require("dayjs/plugin/utc"));
const dayjs_1 = __importDefault(require("dayjs"));
const utils_1 = __importDefault(require("../utils/utils"));
dayjs_1.default.extend(customParseFormat_1.default);
dayjs_1.default.extend(utc_1.default);
const { fs: { exists } } = utils_1.default;
/* eslint-disable quote-props */
const SpecialValues = {
    'true': true,
    'false': false,
    '#N/A': { error: '#N/A' },
    '#REF!': { error: '#REF!' },
    '#NAME?': { error: '#NAME?' },
    '#DIV/0!': { error: '#DIV/0!' },
    '#NULL!': { error: '#NULL!' },
    '#VALUE!': { error: '#VALUE!' },
    '#NUM!': { error: '#NUM!' },
};
/* eslint-ensable quote-props */
class CSV {
    constructor(workbook) {
        this.workbook = workbook;
        this.worksheet = null;
    }
    readFile(filename, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || {};
            if (!(yield exists(filename))) {
                throw new Error(`File not found: ${filename}`);
            }
            const stream = fs_1.default.createReadStream(filename);
            const worksheet = yield this.read(stream, options);
            stream.close();
            return worksheet;
        });
    }
    read(stream, options) {
        options = options || {};
        return new Promise((resolve, reject) => {
            const worksheet = this.workbook.addWorksheet(options.sheetName);
            const dateFormats = options.dateFormats || [
                'YYYY-MM-DD[T]HH:mm:ssZ',
                'YYYY-MM-DD[T]HH:mm:ss',
                'MM-DD-YYYY',
                'YYYY-MM-DD',
            ];
            const map = options.map ||
                function (datum) {
                    if (datum === '') {
                        return null;
                    }
                    const datumNumber = Number(datum);
                    if (!Number.isNaN(datumNumber) && datumNumber !== Infinity) {
                        return datumNumber;
                    }
                    const dt = dateFormats.reduce((matchingDate, currentDateFormat) => {
                        if (matchingDate) {
                            return matchingDate;
                        }
                        const dayjsObj = (0, dayjs_1.default)(datum, currentDateFormat, true);
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
            const csvStream = fastCsv
                .parse(options.parserOptions)
                .on('data', (data) => {
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
    createInputStream() {
        throw new Error('`CSV#createInputStream` is deprecated. You should use `CSV#read` instead. This method will be removed in version 5.0. Please follow upgrade instruction: https://github.com/exceljs/exceljs/blob/master/UPGRADE-4.0.md');
    }
    write(stream, options) {
        return new Promise((resolve, reject) => {
            options = options || {};
            // const encoding = options.encoding || 'utf8';
            // const separator = options.separator || ',';
            // const quoteChar = options.quoteChar || '\'';
            const worksheet = this.workbook.getWorksheet(options.sheetName || options.sheetId);
            const csvStream = fastCsv.format(options.formatterOptions);
            stream.on('finish', () => {
                resolve();
            });
            csvStream.on('error', reject);
            csvStream.pipe(stream);
            const { dateFormat, dateUTC } = options;
            const map = options.map ||
                ((value) => {
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
                                    ? dayjs_1.default.utc(value).format(dateFormat)
                                    : (0, dayjs_1.default)(value).format(dateFormat);
                            }
                            return dateUTC ? dayjs_1.default.utc(value).format() : (0, dayjs_1.default)(value).format();
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
                worksheet.eachRow((row, rowNumber) => {
                    if (includeEmptyRows) {
                        while (lastRow++ < rowNumber - 1) {
                            csvStream.write([]);
                        }
                    }
                    const { values } = row;
                    values.shift();
                    csvStream.write(values.map(map));
                    lastRow = rowNumber;
                });
            }
            csvStream.end();
        });
    }
    writeFile(filename, options) {
        options = options || {};
        const streamOptions = {
            encoding: (options.encoding || 'utf8'),
        };
        const stream = fs_1.default.createWriteStream(filename, streamOptions);
        return this.write(stream, options);
    }
    writeBuffer(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = new stream_buf_1.default();
            yield this.write(stream, options);
            return stream.read();
        });
    }
}
exports.default = CSV;
//# sourceMappingURL=csv.js.map