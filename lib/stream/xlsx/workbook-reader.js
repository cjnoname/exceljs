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
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
};
const fs = require("fs");
const events_1 = require("events");
const readable_stream_1 = require("readable-stream");
const nodeStream = require("stream");
const unzip = require("unzipper");
const tmp = require("tmp");
const iterateStream = require("../../utils/iterate-stream");
const parseSax = require("../../utils/parse-sax");
const StyleManager = require("../../xlsx/xform/style/styles-xform");
const WorkbookXform = require("../../xlsx/xform/book/workbook-xform");
const RelationshipsXform = require("../../xlsx/xform/core/relationships-xform");
const WorksheetReader = require("./worksheet-reader");
const HyperlinkReader = require("./hyperlink-reader");
tmp.setGracefulCleanup();
class WorkbookReader extends events_1.EventEmitter {
    constructor(input, options = {}) {
        super();
        this.input = input;
        this.options = Object.assign({ worksheets: 'emit', sharedStrings: 'cache', hyperlinks: 'ignore', styles: 'ignore', entries: 'ignore' }, options);
        this.styles = new StyleManager();
        this.styles.init();
    }
    _getStream(input) {
        if (input instanceof nodeStream.Readable || input instanceof readable_stream_1.Readable) {
            return input;
        }
        if (typeof input === 'string') {
            return fs.createReadStream(input);
        }
        throw new Error(`Could not recognise input: ${input}`);
    }
    read(input, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            try {
                try {
                    for (var _d = true, _e = __asyncValues(this.parse(input, options)), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                        _c = _f.value;
                        _d = false;
                        const { eventType, value } = _c;
                        switch (eventType) {
                            case 'shared-strings':
                                this.emit(eventType, value);
                                break;
                            case 'worksheet':
                                this.emit(eventType, value);
                                yield value.read();
                                break;
                            case 'hyperlinks':
                                this.emit(eventType, value);
                                break;
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
                this.emit('end');
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
                    const { eventType, value } = _d;
                    if (eventType === 'worksheet') {
                        yield yield __await(value);
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
    parse(input, options) {
        return __asyncGenerator(this, arguments, function* parse_1() {
            var _a, e_3, _b, _c, _d, e_4, _e, _f;
            if (options)
                this.options = options;
            const stream = (this.stream = this._getStream(input || this.input));
            const zip = unzip.Parse({ forceStream: true });
            stream.pipe(zip);
            // worksheets, deferred for parsing after shared strings reading
            const waitingWorkSheets = [];
            try {
                for (var _g = true, _h = __asyncValues(iterateStream(zip)), _j; _j = yield __await(_h.next()), _a = _j.done, !_a; _g = true) {
                    _c = _j.value;
                    _g = false;
                    const entry = _c;
                    let match;
                    let sheetNo;
                    switch (entry.path) {
                        case '_rels/.rels':
                            break;
                        case 'xl/_rels/workbook.xml.rels':
                            yield __await(this._parseRels(entry));
                            break;
                        case 'xl/workbook.xml':
                            yield __await(this._parseWorkbook(entry));
                            break;
                        case 'xl/sharedStrings.xml':
                            try {
                                for (var _k = true, _l = (e_4 = void 0, __asyncValues(this._parseSharedStrings(entry))), _m; _m = yield __await(_l.next()), _d = _m.done, !_d; _k = true) {
                                    _f = _m.value;
                                    _k = false;
                                    const item = _f;
                                    yield yield __await({ eventType: 'shared-strings', value: item });
                                }
                            }
                            catch (e_4_1) { e_4 = { error: e_4_1 }; }
                            finally {
                                try {
                                    if (!_k && !_d && (_e = _l.return)) yield __await(_e.call(_l));
                                }
                                finally { if (e_4) throw e_4.error; }
                            }
                            break;
                        case 'xl/styles.xml':
                            yield __await(this._parseStyles(entry));
                            break;
                        default:
                            if (entry.path.match(/xl\/worksheets\/sheet\d+[.]xml/)) {
                                match = entry.path.match(/xl\/worksheets\/sheet(\d+)[.]xml/);
                                sheetNo = match[1];
                                if (this.sharedStrings && this.workbookRels) {
                                    yield __await(yield* __asyncDelegator(__asyncValues(this._parseWorksheet(iterateStream(entry), sheetNo))));
                                }
                                else {
                                    // create temp file for each worksheet
                                    yield __await(new Promise((resolve, reject) => {
                                        tmp.file((err, path, fd, tempFileCleanupCallback) => {
                                            if (err) {
                                                return reject(err);
                                            }
                                            waitingWorkSheets.push({ sheetNo, path, tempFileCleanupCallback });
                                            const tempStream = fs.createWriteStream(path);
                                            tempStream.on('error', reject);
                                            entry.pipe(tempStream);
                                            return tempStream.on('finish', () => {
                                                return resolve();
                                            });
                                        });
                                    }));
                                }
                            }
                            else if (entry.path.match(/xl\/worksheets\/_rels\/sheet\d+[.]xml.rels/)) {
                                match = entry.path.match(/xl\/worksheets\/_rels\/sheet(\d+)[.]xml.rels/);
                                sheetNo = match[1];
                                yield __await(yield* __asyncDelegator(__asyncValues(this._parseHyperlinks(iterateStream(entry), sheetNo))));
                            }
                            break;
                    }
                    entry.autodrain();
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (!_g && !_a && (_b = _h.return)) yield __await(_b.call(_h));
                }
                finally { if (e_3) throw e_3.error; }
            }
            for (const { sheetNo, path, tempFileCleanupCallback } of waitingWorkSheets) {
                let fileStream = fs.createReadStream(path);
                // TODO: Remove once node v8 is deprecated
                // Detect and upgrade old fileStreams
                if (!fileStream[Symbol.asyncIterator]) {
                    fileStream = fileStream.pipe(new readable_stream_1.PassThrough());
                }
                yield __await(yield* __asyncDelegator(__asyncValues(this._parseWorksheet(fileStream, sheetNo))));
                tempFileCleanupCallback();
            }
        });
    }
    _emitEntry(payload) {
        if (this.options.entries === 'emit') {
            this.emit('entry', payload);
        }
    }
    _parseRels(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            const xform = new RelationshipsXform();
            this.workbookRels = yield xform.parseStream(iterateStream(entry));
        });
    }
    _parseWorkbook(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            this._emitEntry({ type: 'workbook' });
            const workbook = new WorkbookXform();
            this.model = yield workbook.parseStream(iterateStream(entry));
            this.properties = workbook.map.workbookPr;
        });
    }
    _parseSharedStrings(entry) {
        return __asyncGenerator(this, arguments, function* _parseSharedStrings_1() {
            var _a, e_5, _b, _c;
            this._emitEntry({ type: 'shared-strings' });
            switch (this.options.sharedStrings) {
                case 'cache':
                    this.sharedStrings = [];
                    break;
                case 'emit':
                    break;
                default:
                    return yield __await(void 0);
            }
            let text = null;
            let richText = [];
            let index = 0;
            let font = null;
            try {
                for (var _d = true, _e = __asyncValues(parseSax(iterateStream(entry))), _f; _f = yield __await(_e.next()), _a = _f.done, !_a; _d = true) {
                    _c = _f.value;
                    _d = false;
                    const events = _c;
                    for (const { eventType, value } of events) {
                        if (eventType === 'opentag') {
                            const node = value;
                            switch (node.name) {
                                case 'b':
                                    font = font || {};
                                    font.bold = true;
                                    break;
                                case 'charset':
                                    font = font || {};
                                    font.charset = parseInt(node.attributes.charset, 10);
                                    break;
                                case 'color':
                                    font = font || {};
                                    font.color = {};
                                    if (node.attributes.rgb) {
                                        font.color.argb = node.attributes.argb;
                                    }
                                    if (node.attributes.val) {
                                        font.color.argb = node.attributes.val;
                                    }
                                    if (node.attributes.theme) {
                                        font.color.theme = node.attributes.theme;
                                    }
                                    break;
                                case 'family':
                                    font = font || {};
                                    font.family = parseInt(node.attributes.val, 10);
                                    break;
                                case 'i':
                                    font = font || {};
                                    font.italic = true;
                                    break;
                                case 'outline':
                                    font = font || {};
                                    font.outline = true;
                                    break;
                                case 'rFont':
                                    font = font || {};
                                    font.name = node.value;
                                    break;
                                case 'si':
                                    font = null;
                                    richText = [];
                                    text = null;
                                    break;
                                case 'sz':
                                    font = font || {};
                                    font.size = parseInt(node.attributes.val, 10);
                                    break;
                                case 'strike':
                                    break;
                                case 't':
                                    text = null;
                                    break;
                                case 'u':
                                    font = font || {};
                                    font.underline = true;
                                    break;
                                case 'vertAlign':
                                    font = font || {};
                                    font.vertAlign = node.attributes.val;
                                    break;
                            }
                        }
                        else if (eventType === 'text') {
                            text = text ? text + value : value;
                        }
                        else if (eventType === 'closetag') {
                            const node = value;
                            switch (node.name) {
                                case 'r':
                                    richText.push({
                                        font,
                                        text,
                                    });
                                    font = null;
                                    text = null;
                                    break;
                                case 'si':
                                    if (this.options.sharedStrings === 'cache') {
                                        this.sharedStrings.push(richText.length ? { richText } : text);
                                    }
                                    else if (this.options.sharedStrings === 'emit') {
                                        yield yield __await({ index: index++, text: richText.length ? { richText } : text });
                                    }
                                    richText = [];
                                    font = null;
                                    text = null;
                                    break;
                            }
                        }
                    }
                }
            }
            catch (e_5_1) { e_5 = { error: e_5_1 }; }
            finally {
                try {
                    if (!_d && !_a && (_b = _e.return)) yield __await(_b.call(_e));
                }
                finally { if (e_5) throw e_5.error; }
            }
        });
    }
    _parseStyles(entry) {
        return __awaiter(this, void 0, void 0, function* () {
            this._emitEntry({ type: 'styles' });
            if (this.options.styles === 'cache') {
                this.styles = new StyleManager();
                yield this.styles.parseStream(iterateStream(entry));
            }
        });
    }
    *_parseWorksheet(iterator, sheetNo) {
        this._emitEntry({ type: 'worksheet', id: sheetNo });
        const worksheetReader = new WorksheetReader({
            workbook: this,
            id: parseInt(sheetNo, 10),
            iterator,
            options: this.options,
        });
        const matchingRel = (this.workbookRels || []).find((rel) => rel.Target === `worksheets/sheet${sheetNo}.xml`);
        const matchingSheet = matchingRel && (this.model.sheets || []).find((sheet) => sheet.rId === matchingRel.Id);
        if (matchingSheet) {
            worksheetReader.id = matchingSheet.id;
            worksheetReader.name = matchingSheet.name;
            worksheetReader.state = matchingSheet.state;
        }
        if (this.options.worksheets === 'emit') {
            yield { eventType: 'worksheet', value: worksheetReader };
        }
    }
    *_parseHyperlinks(iterator, sheetNo) {
        this._emitEntry({ type: 'hyperlinks', id: sheetNo });
        const hyperlinksReader = new HyperlinkReader({
            workbook: this,
            id: parseInt(sheetNo, 10),
            iterator,
            options: this.options,
        });
        if (this.options.hyperlinks === 'emit') {
            yield { eventType: 'hyperlinks', value: hyperlinksReader };
        }
    }
}
// for reference - these are the valid values for options
(function (WorkbookReader) {
    WorkbookReader.Options = {
        worksheets: ['emit', 'ignore'],
        sharedStrings: ['cache', 'emit', 'ignore'],
        hyperlinks: ['cache', 'emit', 'ignore'],
        styles: ['cache', 'ignore'],
        entries: ['emit', 'ignore'],
    };
})(WorkbookReader || (WorkbookReader = {}));
module.exports = WorkbookReader;
//# sourceMappingURL=workbook-reader.js.map