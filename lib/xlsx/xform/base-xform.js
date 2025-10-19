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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var parseSax = require("../../utils/parse-sax");
var XmlStream = require("../../utils/xml-stream");
// Base class for Xforms
var BaseXform = /** @class */ (function () {
    function BaseXform() {
    }
    // ============================================================
    // Virtual Interface
    BaseXform.prototype.prepare = function (_model, _options) {
        // optional preparation (mutation) of model so it is ready for write
    };
    BaseXform.prototype.render = function (_xmlStream, _model) {
        // convert model to xml
    };
    BaseXform.prototype.parseOpen = function (_node) {
        // XML node opened
    };
    BaseXform.prototype.parseText = function (_text) {
        // chunk of text encountered for current node
    };
    BaseXform.prototype.parseClose = function (_name) {
        // XML node closed
        return true;
    };
    BaseXform.prototype.reconcile = function (_model, _options) {
        // optional post-parse step (opposite to prepare)
    };
    // ============================================================
    BaseXform.prototype.reset = function () {
        // to make sure parses don't bleed to next iteration
        this.model = null;
        // if we have a map - reset them too
        if (this.map) {
            Object.values(this.map).forEach(function (xform) {
                if (xform instanceof BaseXform) {
                    xform.reset();
                }
                else if (xform.xform) {
                    xform.xform.reset();
                }
            });
        }
    };
    BaseXform.prototype.mergeModel = function (obj) {
        // set obj's props to this.model
        this.model = Object.assign(this.model || {}, obj);
    };
    BaseXform.prototype.parse = function (saxParser) {
        return __awaiter(this, void 0, void 0, function () {
            var events, _i, events_1, _a, eventType, value, e_1_1;
            var _b, saxParser_1, saxParser_1_1;
            var _c, e_1, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 5, 6, 11]);
                        _b = true, saxParser_1 = __asyncValues(saxParser);
                        _f.label = 1;
                    case 1: return [4 /*yield*/, saxParser_1.next()];
                    case 2:
                        if (!(saxParser_1_1 = _f.sent(), _c = saxParser_1_1.done, !_c)) return [3 /*break*/, 4];
                        _e = saxParser_1_1.value;
                        _b = false;
                        events = _e;
                        for (_i = 0, events_1 = events; _i < events_1.length; _i++) {
                            _a = events_1[_i], eventType = _a.eventType, value = _a.value;
                            if (eventType === 'opentag') {
                                this.parseOpen(value);
                            }
                            else if (eventType === 'text') {
                                this.parseText(value);
                            }
                            else if (eventType === 'closetag') {
                                if (!this.parseClose(value.name)) {
                                    return [2 /*return*/, this.model];
                                }
                            }
                        }
                        _f.label = 3;
                    case 3:
                        _b = true;
                        return [3 /*break*/, 1];
                    case 4: return [3 /*break*/, 11];
                    case 5:
                        e_1_1 = _f.sent();
                        e_1 = { error: e_1_1 };
                        return [3 /*break*/, 11];
                    case 6:
                        _f.trys.push([6, , 9, 10]);
                        if (!(!_b && !_c && (_d = saxParser_1.return))) return [3 /*break*/, 8];
                        return [4 /*yield*/, _d.call(saxParser_1)];
                    case 7:
                        _f.sent();
                        _f.label = 8;
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        if (e_1) throw e_1.error;
                        return [7 /*endfinally*/];
                    case 10: return [7 /*endfinally*/];
                    case 11: return [2 /*return*/, this.model];
                }
            });
        });
    };
    BaseXform.prototype.parseStream = function (stream) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.parse(parseSax(stream))];
            });
        });
    };
    Object.defineProperty(BaseXform.prototype, "xml", {
        get: function () {
            // convenience function to get the xml of this.model
            // useful for manager types that are built during the prepare phase
            return this.toXml(this.model);
        },
        enumerable: false,
        configurable: true
    });
    BaseXform.prototype.toXml = function (model) {
        var xmlStream = new XmlStream();
        this.render(xmlStream, model);
        return xmlStream.xml;
    };
    // ============================================================
    // Useful Utilities
    BaseXform.toAttribute = function (value, dflt, always) {
        if (always === void 0) { always = false; }
        if (value === undefined) {
            if (always) {
                return dflt;
            }
        }
        else if (always || value !== dflt) {
            return value.toString();
        }
        return undefined;
    };
    BaseXform.toStringAttribute = function (value, dflt, always) {
        if (always === void 0) { always = false; }
        return BaseXform.toAttribute(value, dflt, always);
    };
    BaseXform.toStringValue = function (attr, dflt) {
        return attr === undefined ? dflt : attr;
    };
    BaseXform.toBoolAttribute = function (value, dflt, always) {
        if (always === void 0) { always = false; }
        if (value === undefined) {
            if (always) {
                return dflt;
            }
        }
        else if (always || value !== dflt) {
            return value ? '1' : '0';
        }
        return undefined;
    };
    BaseXform.toBoolValue = function (attr, dflt) {
        return attr === undefined ? dflt : attr === '1';
    };
    BaseXform.toIntAttribute = function (value, dflt, always) {
        if (always === void 0) { always = false; }
        return BaseXform.toAttribute(value, dflt, always);
    };
    BaseXform.toIntValue = function (attr, dflt) {
        return attr === undefined ? dflt : parseInt(attr, 10);
    };
    BaseXform.toFloatAttribute = function (value, dflt, always) {
        if (always === void 0) { always = false; }
        return BaseXform.toAttribute(value, dflt, always);
    };
    BaseXform.toFloatValue = function (attr, dflt) {
        return attr === undefined ? dflt : parseFloat(attr);
    };
    return BaseXform;
}());
module.exports = BaseXform;
