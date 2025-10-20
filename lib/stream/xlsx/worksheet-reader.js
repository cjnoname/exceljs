"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
    function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
    function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const parse_sax_1 = __importDefault(require("../../utils/parse-sax"));
const under_dash_1 = __importDefault(require("../../utils/under-dash"));
const utils_1 = __importDefault(require("../../utils/utils"));
const col_cache_1 = __importDefault(require("../../utils/col-cache"));
const range_1 = __importDefault(require("../../doc/range"));
const row_1 = __importDefault(require("../../doc/row"));
const column_1 = __importDefault(require("../../doc/column"));
class WorksheetReader extends events_1.EventEmitter {
    constructor({ workbook, id, iterator, options }) {
        super();
        this.workbook = workbook;
        this.id = id;
        this.iterator = iterator;
        this.options = options || {};
        // and a name
        this.name = `Sheet${this.id}`;
        // column definitions
        this._columns = null;
        this._keys = {};
        // keep a record of dimensions
        this._dimensions = new range_1.default();
    }
    // destroy - not a valid operation for a streaming writer
    // even though some streamers might be able to, it's a bad idea.
    destroy() {
        throw new Error('Invalid Operation: destroy');
    }
    // return the current dimensions of the writer
    get dimensions() {
        return this._dimensions;
    }
    // =========================================================================
    // Columns
    // get the current columns array.
    get columns() {
        return this._columns;
    }
    // get a single column by col number. If it doesn't exist, it and any gaps before it
    // are created.
    getColumn(c) {
        if (typeof c === 'string') {
            // if it matches a key'd column, return that
            const col = this._keys[c];
            if (col) {
                return col;
            }
            // otherise, assume letter
            c = col_cache_1.default.l2n(c);
        }
        if (!this._columns) {
            this._columns = [];
        }
        if (c > this._columns.length) {
            let n = this._columns.length + 1;
            while (n <= c) {
                this._columns.push(new column_1.default(this, n++));
            }
        }
        return this._columns[c - 1];
    }
    getColumnKey(key) {
        return this._keys[key];
    }
    setColumnKey(key, value) {
        this._keys[key] = value;
    }
    deleteColumnKey(key) {
        delete this._keys[key];
    }
    eachColumnKey(f) {
        under_dash_1.default.each(this._keys, f);
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            try {
                try {
                    for (var _d = true, _e = __asyncValues(this.parse()), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                        _c = _f.value;
                        _d = false;
                        const events = _c;
                        for (const { eventType, value } of events) {
                            this.emit(eventType, value);
                        }
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                this.emit('finished');
            }
            catch (error) {
                this.emit('error', error);
            }
        });
    }
    [Symbol.asyncIterator]() {
        return __asyncGenerator(this, arguments, function* _a() {
            var _b, e_2, _c, _d;
            try {
                for (var _e = true, _f = __asyncValues(this.parse()), _g; _g = yield __await(_f.next()), _b = _g.done, !_b; _e = true) {
                    _d = _g.value;
                    _e = false;
                    const events = _d;
                    for (const { eventType, value } of events) {
                        if (eventType === 'row') {
                            yield yield __await(value);
                        }
                    }
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_e && !_b && (_c = _f.return)) yield __await(_c.call(_f));
                }
                finally { if (e_2) throw e_2.error; }
            }
        });
    }
    parse() {
        return __asyncGenerator(this, arguments, function* parse_1() {
            var _a, e_3, _b, _c;
            const { iterator, options } = this;
            let emitSheet = false;
            let emitHyperlinks = false;
            let hyperlinks = null;
            switch (options.worksheets) {
                case 'emit':
                    emitSheet = true;
                    break;
                case 'prep':
                    break;
                default:
                    break;
            }
            switch (options.hyperlinks) {
                case 'emit':
                    emitHyperlinks = true;
                    break;
                case 'cache':
                    this.hyperlinks = hyperlinks = {};
                    break;
                default:
                    break;
            }
            if (!emitSheet && !emitHyperlinks && !hyperlinks) {
                return yield __await(void 0);
            }
            // references
            const { sharedStrings, styles, properties } = this.workbook;
            // xml position
            let inCols = false;
            let inRows = false;
            let inHyperlinks = false;
            // parse state
            let cols = null;
            let row = null;
            let c = null;
            let current = null;
            try {
                for (var _d = true, _e = __asyncValues((0, parse_sax_1.default)(iterator)), _f; _f = yield __await(_e.next()), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const events = _c;
                    const worksheetEvents = [];
                    for (const { eventType, value } of events) {
                        if (eventType === 'opentag') {
                            const node = value;
                            if (emitSheet) {
                                switch (node.name) {
                                    case 'cols':
                                        inCols = true;
                                        cols = [];
                                        break;
                                    case 'sheetData':
                                        inRows = true;
                                        break;
                                    case 'col':
                                        if (inCols) {
                                            cols.push({
                                                min: parseInt(node.attributes.min, 10),
                                                max: parseInt(node.attributes.max, 10),
                                                width: parseFloat(node.attributes.width),
                                                styleId: parseInt(node.attributes.style || '0', 10),
                                            });
                                        }
                                        break;
                                    case 'row':
                                        if (inRows) {
                                            const r = parseInt(node.attributes.r, 10);
                                            row = new row_1.default(this, r);
                                            if (node.attributes.ht) {
                                                row.height = parseFloat(node.attributes.ht);
                                            }
                                            if (node.attributes.s) {
                                                const styleId = parseInt(node.attributes.s, 10);
                                                const style = styles.getStyleModel(styleId);
                                                if (style) {
                                                    row.style = style;
                                                }
                                            }
                                        }
                                        break;
                                    case 'c':
                                        if (row) {
                                            c = {
                                                ref: node.attributes.r,
                                                s: parseInt(node.attributes.s, 10),
                                                t: node.attributes.t,
                                            };
                                        }
                                        break;
                                    case 'f':
                                        if (c) {
                                            current = c.f = { text: '' };
                                        }
                                        break;
                                    case 'v':
                                        if (c) {
                                            current = c.v = { text: '' };
                                        }
                                        break;
                                    case 'is':
                                    case 't':
                                        if (c) {
                                            current = c.v = { text: '' };
                                        }
                                        break;
                                    case 'mergeCell':
                                        break;
                                    default:
                                        break;
                                }
                            }
                            // =================================================================
                            //
                            if (emitHyperlinks || hyperlinks) {
                                switch (node.name) {
                                    case 'hyperlinks':
                                        inHyperlinks = true;
                                        break;
                                    case 'hyperlink':
                                        if (inHyperlinks) {
                                            const hyperlink = {
                                                ref: node.attributes.ref,
                                                rId: node.attributes['r:id'],
                                            };
                                            if (emitHyperlinks) {
                                                worksheetEvents.push({ eventType: 'hyperlink', value: hyperlink });
                                            }
                                            else {
                                                hyperlinks[hyperlink.ref] = hyperlink;
                                            }
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                        else if (eventType === 'text') {
                            // only text data is for sheet values
                            if (emitSheet) {
                                if (current) {
                                    current.text += value;
                                }
                            }
                        }
                        else if (eventType === 'closetag') {
                            const node = value;
                            if (emitSheet) {
                                switch (node.name) {
                                    case 'cols':
                                        inCols = false;
                                        this._columns = column_1.default.fromModel(cols);
                                        break;
                                    case 'sheetData':
                                        inRows = false;
                                        break;
                                    case 'row':
                                        this._dimensions.expandRow(row);
                                        worksheetEvents.push({ eventType: 'row', value: row });
                                        row = null;
                                        break;
                                    case 'c':
                                        if (row && c) {
                                            const address = col_cache_1.default.decodeAddress(c.ref);
                                            const cell = row.getCell(address.col);
                                            if (c.s) {
                                                const style = styles.getStyleModel(c.s);
                                                if (style) {
                                                    cell.style = style;
                                                }
                                            }
                                            if (c.f) {
                                                const cellValue = {
                                                    formula: c.f.text,
                                                };
                                                if (c.v) {
                                                    if (c.t === 'str') {
                                                        cellValue.result = utils_1.default.xmlDecode(c.v.text);
                                                    }
                                                    else {
                                                        cellValue.result = parseFloat(c.v.text);
                                                    }
                                                }
                                                cell.value = cellValue;
                                            }
                                            else if (c.v) {
                                                switch (c.t) {
                                                    case 's': {
                                                        const index = parseInt(c.v.text, 10);
                                                        if (sharedStrings) {
                                                            cell.value = sharedStrings[index];
                                                        }
                                                        else {
                                                            cell.value = {
                                                                sharedString: index,
                                                            };
                                                        }
                                                        break;
                                                    }
                                                    case 'inlineStr':
                                                    case 'str':
                                                        cell.value = utils_1.default.xmlDecode(c.v.text);
                                                        break;
                                                    case 'e':
                                                        cell.value = { error: c.v.text };
                                                        break;
                                                    case 'b':
                                                        cell.value = parseInt(c.v.text, 10) !== 0;
                                                        break;
                                                    default:
                                                        if (utils_1.default.isDateFmt(cell.numFmt)) {
                                                            cell.value = utils_1.default.excelToDate(parseFloat(c.v.text), properties.model && properties.model.date1904);
                                                        }
                                                        else {
                                                            cell.value = parseFloat(c.v.text);
                                                        }
                                                        break;
                                                }
                                            }
                                            if (hyperlinks) {
                                                const hyperlink = hyperlinks[c.ref];
                                                if (hyperlink) {
                                                    cell.text = cell.value;
                                                    cell.value = undefined;
                                                    cell.hyperlink = hyperlink;
                                                }
                                            }
                                            c = null;
                                        }
                                        break;
                                    default:
                                        break;
                                }
                            }
                            if (emitHyperlinks || hyperlinks) {
                                switch (node.name) {
                                    case 'hyperlinks':
                                        inHyperlinks = false;
                                        break;
                                    default:
                                        break;
                                }
                            }
                        }
                    }
                    if (worksheetEvents.length > 0) {
                        yield yield __await(worksheetEvents);
                    }
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield __await(_b.call(_e));
                }
                finally { if (e_3) throw e_3.error; }
            }
        });
    }
}
exports.default = WorksheetReader;
//# sourceMappingURL=worksheet-reader.js.map