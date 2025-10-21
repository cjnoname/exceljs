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
Object.defineProperty(exports, "__esModule", { value: true });
exports.objectFromProps = exports.toSortedArray = exports.range = exports.parseBoolean = exports.toIsoDateString = exports.isDateFmt = exports.validInt = exports.xmlDecode = exports.xmlEncode = exports.getRelsPath = exports.parsePath = exports.excelToDate = exports.dateToExcel = exports.inherits = exports.promiseImmediate = void 0;
const fs = __importStar(require("fs"));
// useful stuff
const inherits = function (cls, superCtor, statics, prototype) {
    // eslint-disable-next-line no-underscore-dangle
    cls.super_ = superCtor;
    if (!prototype) {
        prototype = statics;
        statics = null;
    }
    if (statics) {
        Object.keys(statics).forEach(i => {
            Object.defineProperty(cls, i, Object.getOwnPropertyDescriptor(statics, i));
        });
    }
    const properties = {
        constructor: {
            value: cls,
            enumerable: false,
            writable: false,
            configurable: true,
        },
    };
    if (prototype) {
        Object.keys(prototype).forEach(i => {
            properties[i] = Object.getOwnPropertyDescriptor(prototype, i);
        });
    }
    cls.prototype = Object.create(superCtor.prototype, properties);
};
exports.inherits = inherits;
// eslint-disable-next-line no-control-regex
const xmlDecodeRegex = /[<>&'"\x7F\x00-\x08\x0B-\x0C\x0E-\x1F]/;
const utils = {
    nop() { },
    promiseImmediate(value) {
        return new Promise(resolve => {
            if (global.setImmediate) {
                setImmediate(() => {
                    resolve(value);
                });
            }
            else {
                // poorman's setImmediate - must wait at least 1ms
                setTimeout(() => {
                    resolve(value);
                }, 1);
            }
        });
    },
    inherits,
    dateToExcel(d, date1904) {
        // eslint-disable-next-line no-mixed-operators
        return 25569 + d.getTime() / (24 * 3600 * 1000) - (date1904 ? 1462 : 0);
    },
    excelToDate(v, date1904) {
        // eslint-disable-next-line no-mixed-operators
        const millisecondSinceEpoch = Math.round((v - 25569 + (date1904 ? 1462 : 0)) * 24 * 3600 * 1000);
        return new Date(millisecondSinceEpoch);
    },
    parsePath(filepath) {
        const last = filepath.lastIndexOf('/');
        return {
            path: filepath.substring(0, last),
            name: filepath.substring(last + 1),
        };
    },
    getRelsPath(filepath) {
        const path = utils.parsePath(filepath);
        return `${path.path}/_rels/${path.name}.rels`;
    },
    xmlEncode(text) {
        const regexResult = xmlDecodeRegex.exec(text);
        if (!regexResult)
            return text;
        let result = '';
        let escape = '';
        let lastIndex = 0;
        let i = regexResult.index;
        for (; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            switch (charCode) {
                case 34: // "
                    escape = '&quot;';
                    break;
                case 38: // &
                    escape = '&amp;';
                    break;
                case 39: // '
                    escape = '&apos;';
                    break;
                case 60: // <
                    escape = '&lt;';
                    break;
                case 62: // >
                    escape = '&gt;';
                    break;
                case 127:
                    escape = '';
                    break;
                default: {
                    if (charCode <= 31 && (charCode <= 8 || (charCode >= 11 && charCode !== 13))) {
                        escape = '';
                        break;
                    }
                    continue;
                }
            }
            if (lastIndex !== i)
                result += text.substring(lastIndex, i);
            lastIndex = i + 1;
            if (escape)
                result += escape;
        }
        if (lastIndex !== i)
            return result + text.substring(lastIndex, i);
        return result;
    },
    xmlDecode(text) {
        return text.replace(/&([a-z]*);/g, c => {
            switch (c) {
                case '&lt;':
                    return '<';
                case '&gt;':
                    return '>';
                case '&amp;':
                    return '&';
                case '&apos;':
                    return '\'';
                case '&quot;':
                    return '"';
                default:
                    return c;
            }
        });
    },
    validInt(value) {
        const i = parseInt(value, 10);
        return !Number.isNaN(i) ? i : 0;
    },
    isDateFmt(fmt) {
        if (!fmt) {
            return false;
        }
        // must remove all chars inside quotes and []
        fmt = fmt.replace(/\[[^\]]*]/g, '');
        fmt = fmt.replace(/"[^"]*"/g, '');
        // then check for date formatting chars
        const result = fmt.match(/[ymdhMsb]+/) !== null;
        return result;
    },
    fs: {
        exists(path) {
            return new Promise(resolve => {
                fs.access(path, fs.constants.F_OK, err => {
                    resolve(!err);
                });
            });
        },
    },
    toIsoDateString(dt) {
        return dt.toISOString().substr(0, 10);
    },
    parseBoolean(value) {
        return value === true || value === 'true' || value === 1 || value === '1';
    },
    *range(start, stop, step = 1) {
        const compareOrder = step > 0 ? (a, b) => a < b : (a, b) => a > b;
        for (let value = start; compareOrder(value, stop); value += step) {
            yield value;
        }
    },
    toSortedArray(values) {
        const result = Array.from(values);
        // Note: per default, `Array.prototype.sort()` converts values
        // to strings when comparing. Here, if we have numbers, we use
        // numeric sort.
        if (result.every(item => Number.isFinite(item))) {
            const compareNumbers = (a, b) => a - b;
            return result.sort(compareNumbers);
        }
        return result.sort();
    },
    objectFromProps(props, value = null) {
        // *Note*: Using `reduce` as `Object.fromEntries` requires Node 12+;
        // ExcelJs is >=8.3.0 (as of 2023-10-08).
        // return Object.fromEntries(props.map(property => [property, value]));
        return props.reduce((result, property) => {
            result[property] = value;
            return result;
        }, {});
    },
};
exports.default = utils;
// Named exports for convenient destructuring
exports.promiseImmediate = utils.promiseImmediate;
exports.dateToExcel = utils.dateToExcel;
exports.excelToDate = utils.excelToDate;
exports.parsePath = utils.parsePath;
exports.getRelsPath = utils.getRelsPath;
exports.xmlEncode = utils.xmlEncode;
exports.xmlDecode = utils.xmlDecode;
exports.validInt = utils.validInt;
exports.isDateFmt = utils.isDateFmt;
exports.toIsoDateString = utils.toIsoDateString;
exports.parseBoolean = utils.parseBoolean;
exports.range = utils.range;
exports.toSortedArray = utils.toSortedArray;
exports.objectFromProps = utils.objectFromProps;
