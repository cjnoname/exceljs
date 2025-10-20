"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const saxes_1 = require("saxes");
const readable_stream_1 = require("readable-stream");
const browser_buffer_decode_1 = require("./browser-buffer-decode");
function parseSax(iterable) {
    return __asyncGenerator(this, arguments, function* parseSax_1() {
        var _a, e_1, _b, _c;
        // TODO: Remove once node v8 is deprecated
        // Detect and upgrade old streams
        if (iterable.pipe && !iterable[Symbol.asyncIterator]) {
            iterable = iterable.pipe(new readable_stream_1.PassThrough());
        }
        const saxesParser = new saxes_1.SaxesParser();
        let error;
        saxesParser.on('error', (err) => {
            error = err;
        });
        let events = [];
        saxesParser.on('opentag', (value) => events.push({ eventType: 'opentag', value }));
        saxesParser.on('text', (value) => events.push({ eventType: 'text', value }));
        saxesParser.on('closetag', (value) => events.push({ eventType: 'closetag', value }));
        try {
            for (var _d = true, iterable_1 = __asyncValues(iterable), iterable_1_1; iterable_1_1 = yield __await(iterable_1.next()), _a = iterable_1_1.done, !_a; _d = true) {
                _c = iterable_1_1.value;
                _d = false;
                const chunk = _c;
                saxesParser.write((0, browser_buffer_decode_1.bufferToString)(chunk));
                // saxesParser.write and saxesParser.on() are synchronous,
                // so we can only reach the below line once all events have been emitted
                if (error)
                    throw error;
                // As a performance optimization, we gather all events instead of passing
                // them one by one, which would cause each event to go through the event queue
                yield yield __await(events);
                events = [];
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = iterable_1.return)) yield __await(_b.call(iterable_1));
            }
            finally { if (e_1) throw e_1.error; }
        }
    });
}
exports.default = parseSax;
//# sourceMappingURL=parse-sax.js.map