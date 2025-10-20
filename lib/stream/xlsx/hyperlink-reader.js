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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const events_1 = require("events");
const parse_sax_1 = __importDefault(require("../../utils/parse-sax"));
const enums_1 = __importDefault(require("../../doc/enums"));
const rel_type_1 = __importDefault(require("../../xlsx/rel-type"));
class HyperlinkReader extends events_1.EventEmitter {
    constructor({ workbook, id, iterator, options }) {
        super();
        this.workbook = workbook;
        this.id = id;
        this.iterator = iterator;
        this.options = options;
    }
    get count() {
        return (this.hyperlinks && Object.keys(this.hyperlinks).length) || 0;
    }
    each(fn) {
        if (this.hyperlinks) {
            Object.keys(this.hyperlinks).forEach(rId => {
                fn(this.hyperlinks[rId], rId);
            });
        }
    }
    read() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, e_1, _b, _c;
            const { iterator, options } = this;
            let emitHyperlinks = false;
            let hyperlinks = null;
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
            if (!emitHyperlinks && !hyperlinks) {
                this.emit('finished');
                return;
            }
            try {
                try {
                    for (var _d = true, _e = __asyncValues((0, parse_sax_1.default)(iterator)), _f; _f = yield _e.next(), _a = _f.done, !_a; _d = true) {
                        _c = _f.value;
                        _d = false;
                        const events = _c;
                        for (const { eventType, value } of events) {
                            if (eventType === 'opentag') {
                                const node = value;
                                if (node.name === 'Relationship') {
                                    const rId = node.attributes.Id;
                                    switch (node.attributes.Type) {
                                        case rel_type_1.default.Hyperlink:
                                            {
                                                const relationship = {
                                                    type: enums_1.default.RelationshipType.Styles,
                                                    rId,
                                                    target: node.attributes.Target,
                                                    targetMode: node.attributes.TargetMode,
                                                };
                                                if (emitHyperlinks) {
                                                    this.emit('hyperlink', relationship);
                                                }
                                                else {
                                                    hyperlinks[relationship.rId] = relationship;
                                                }
                                            }
                                            break;
                                        default:
                                            break;
                                    }
                                }
                            }
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
}
exports.default = HyperlinkReader;
//# sourceMappingURL=hyperlink-reader.js.map