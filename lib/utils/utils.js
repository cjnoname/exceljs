"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var fs = require("fs");
// useful stuff
var inherits = function (cls, superCtor, statics, prototype) {
    // eslint-disable-next-line no-underscore-dangle
    cls.super_ = superCtor;
    if (!prototype) {
        prototype = statics;
        statics = null;
    }
    if (statics) {
        Object.keys(statics).forEach(function (i) {
            Object.defineProperty(cls, i, Object.getOwnPropertyDescriptor(statics, i));
        });
    }
    var properties = {
        constructor: {
            value: cls,
            enumerable: false,
            writable: false,
            configurable: true,
        },
    };
    if (prototype) {
        Object.keys(prototype).forEach(function (i) {
            properties[i] = Object.getOwnPropertyDescriptor(prototype, i);
        });
    }
    cls.prototype = Object.create(superCtor.prototype, properties);
};
// eslint-disable-next-line no-control-regex
var xmlDecodeRegex = /[<>&'"\x7F\x00-\x08\x0B-\x0C\x0E-\x1F]/;
var utils = {
    nop: function () { },
    promiseImmediate: function (value) {
        return new Promise(function (resolve) {
            if (global.setImmediate) {
                setImmediate(function () {
                    resolve(value);
                });
            }
            else {
                // poorman's setImmediate - must wait at least 1ms
                setTimeout(function () {
                    resolve(value);
                }, 1);
            }
        });
    },
    inherits: inherits,
    dateToExcel: function (d, date1904) {
        // eslint-disable-next-line no-mixed-operators
        return 25569 + d.getTime() / (24 * 3600 * 1000) - (date1904 ? 1462 : 0);
    },
    excelToDate: function (v, date1904) {
        // eslint-disable-next-line no-mixed-operators
        var millisecondSinceEpoch = Math.round((v - 25569 + (date1904 ? 1462 : 0)) * 24 * 3600 * 1000);
        return new Date(millisecondSinceEpoch);
    },
    parsePath: function (filepath) {
        var last = filepath.lastIndexOf('/');
        return {
            path: filepath.substring(0, last),
            name: filepath.substring(last + 1),
        };
    },
    getRelsPath: function (filepath) {
        var path = utils.parsePath(filepath);
        return "".concat(path.path, "/_rels/").concat(path.name, ".rels");
    },
    xmlEncode: function (text) {
        var regexResult = xmlDecodeRegex.exec(text);
        if (!regexResult)
            return text;
        var result = '';
        var escape = '';
        var lastIndex = 0;
        var i = regexResult.index;
        for (; i < text.length; i++) {
            var charCode = text.charCodeAt(i);
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
    xmlDecode: function (text) {
        return text.replace(/&([a-z]*);/g, function (c) {
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
    validInt: function (value) {
        var i = parseInt(value, 10);
        return !Number.isNaN(i) ? i : 0;
    },
    isDateFmt: function (fmt) {
        if (!fmt) {
            return false;
        }
        // must remove all chars inside quotes and []
        fmt = fmt.replace(/\[[^\]]*]/g, '');
        fmt = fmt.replace(/"[^"]*"/g, '');
        // then check for date formatting chars
        var result = fmt.match(/[ymdhMsb]+/) !== null;
        return result;
    },
    fs: {
        exists: function (path) {
            return new Promise(function (resolve) {
                fs.access(path, fs.constants.F_OK, function (err) {
                    resolve(!err);
                });
            });
        },
    },
    toIsoDateString: function (dt) {
        return dt.toISOString().substr(0, 10);
    },
    parseBoolean: function (value) {
        return value === true || value === 'true' || value === 1 || value === '1';
    },
    range: function (start, stop, step) {
        var compareOrder, value;
        if (step === void 0) { step = 1; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    compareOrder = step > 0 ? function (a, b) { return a < b; } : function (a, b) { return a > b; };
                    value = start;
                    _a.label = 1;
                case 1:
                    if (!compareOrder(value, stop)) return [3 /*break*/, 4];
                    return [4 /*yield*/, value];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    value += step;
                    return [3 /*break*/, 1];
                case 4: return [2 /*return*/];
            }
        });
    },
    toSortedArray: function (values) {
        var result = Array.from(values);
        // Note: per default, `Array.prototype.sort()` converts values
        // to strings when comparing. Here, if we have numbers, we use
        // numeric sort.
        if (result.every(function (item) { return Number.isFinite(item); })) {
            var compareNumbers = function (a, b) { return a - b; };
            return result.sort(compareNumbers);
        }
        return result.sort();
    },
    objectFromProps: function (props, value) {
        if (value === void 0) { value = null; }
        // *Note*: Using `reduce` as `Object.fromEntries` requires Node 12+;
        // ExcelJs is >=8.3.0 (as of 2023-10-08).
        // return Object.fromEntries(props.map(property => [property, value]));
        return props.reduce(function (result, property) {
            result[property] = value;
            return result;
        }, {});
    },
};
module.exports = utils;
