"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const utils_js_1 = __importDefault(require("../../../lib/utils/utils.js"));
(0, vitest_1.describe)('utils', () => {
    (0, vitest_1.describe)('xmlEncode', () => {
        (0, vitest_1.it)('encodes xml text', () => {
            (0, vitest_1.expect)(utils_js_1.default.xmlEncode('<')).toBe('&lt;');
            (0, vitest_1.expect)(utils_js_1.default.xmlEncode('>')).toBe('&gt;');
            (0, vitest_1.expect)(utils_js_1.default.xmlEncode('&')).toBe('&amp;');
            (0, vitest_1.expect)(utils_js_1.default.xmlEncode('"')).toBe('&quot;');
            (0, vitest_1.expect)(utils_js_1.default.xmlEncode('\'')).toBe('&apos;');
            (0, vitest_1.expect)(utils_js_1.default.xmlEncode('abc\x00\x01\x02\x03\x04\x05\x06\x07\x08\x0b\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f\x20abc\x7f')).toBe('abc abc');
            (0, vitest_1.expect)(utils_js_1.default.xmlEncode('<a href="www.whatever.com">Talk to the H&</a>')).toBe('&lt;a href=&quot;www.whatever.com&quot;&gt;Talk to the H&amp;&lt;/a&gt;');
            (0, vitest_1.expect)(utils_js_1.default.xmlEncode('new\x0aline')).toBe('new\x0aline');
        });
    });
    (0, vitest_1.describe)('isDateFmt', () => {
        ['yyyy-mm-dd'].forEach(fmt => {
            (0, vitest_1.it)(`'${fmt}' a date`, () => {
                (0, vitest_1.expect)(utils_js_1.default.isDateFmt(fmt)).toBe(true);
            });
        });
        ['', '[Green]#,##0 ;[Red](#,##0)'].forEach(fmt => {
            (0, vitest_1.it)(`'${fmt}' is not a date`, () => {
                (0, vitest_1.expect)(utils_js_1.default.isDateFmt(fmt)).toBe(false);
            });
        });
    });
    (0, vitest_1.describe)('dateToExcel', () => {
        (0, vitest_1.it)('should convert date to excel properly', () => {
            const myDate = new Date(Date.UTC(2017, 11, 15, 17, 0, 0, 0));
            const excelDate = utils_js_1.default.dateToExcel(myDate, false);
            (0, vitest_1.expect)(excelDate).toBe(43084.70833333333);
        });
    });
    (0, vitest_1.describe)('excelToDate', () => {
        (0, vitest_1.it)('should round to the nearest millisecond when parsing excel date', () => {
            const myDate = new Date(Date.UTC(2017, 11, 15, 17, 0, 0, 0));
            const excelDate = utils_js_1.default.dateToExcel(myDate, false);
            const dateConverted = utils_js_1.default.excelToDate(excelDate, false);
            (0, vitest_1.expect)(dateConverted).toEqual(myDate);
        });
        (0, vitest_1.it)('should not lost millisecond precision when parsing excel date', () => {
            const myDate = new Date(Date.UTC(2017, 11, 15, 17, 0, 0, 0));
            const excelDate = utils_js_1.default.dateToExcel(myDate, false);
            const dateConverted = utils_js_1.default.excelToDate(excelDate, false);
            (0, vitest_1.expect)(dateConverted).toEqual(myDate);
        });
    });
});
//# sourceMappingURL=utils.spec.js.map