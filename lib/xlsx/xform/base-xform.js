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
const parseSax = require("../../utils/parse-sax");
const XmlStream = require("../../utils/xml-stream");
// Base class for Xforms
class BaseXform {
    // ============================================================
    // Virtual Interface
    prepare(_model, _options) {
        // optional preparation (mutation) of model so it is ready for write
    }
    render(_xmlStream, _model) {
        // convert model to xml
    }
    parseOpen(_node) {
        // XML node opened
    }
    parseText(_text) {
        // chunk of text encountered for current node
    }
    parseClose(_name) {
        // XML node closed
        return true;
    }
    reconcile(_model, _options) {
        // optional post-parse step (opposite to prepare)
    }
    // ============================================================
    reset() {
        // to make sure parses don't bleed to next iteration
        this.model = null;
        // if we have a map - reset them too
        if (this.map) {
            Object.values(this.map).forEach(xform => {
                if (xform instanceof BaseXform) {
                    xform.reset();
                }
                else if (xform.xform) {
                    xform.xform.reset();
                }
            });
        }
    }
    mergeModel(obj) {
        // set obj's props to this.model
        this.model = Object.assign(this.model || {}, obj);
    }
    parse(saxParser) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, saxParser_1, saxParser_1_1;
            var _b, e_1, _c, _d;
            try {
                for (_a = true, saxParser_1 = __asyncValues(saxParser); saxParser_1_1 = yield saxParser_1.next(), _b = saxParser_1_1.done, !_b; _a = true) {
                    _d = saxParser_1_1.value;
                    _a = false;
                    const events = _d;
                    for (const { eventType, value } of events) {
                        if (eventType === 'opentag') {
                            this.parseOpen(value);
                        }
                        else if (eventType === 'text') {
                            this.parseText(value);
                        }
                        else if (eventType === 'closetag') {
                            if (!this.parseClose(value.name)) {
                                return this.model;
                            }
                        }
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_a && !_b && (_c = saxParser_1.return)) yield _c.call(saxParser_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return this.model;
        });
    }
    parseStream(stream) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.parse(parseSax(stream));
        });
    }
    get xml() {
        // convenience function to get the xml of this.model
        // useful for manager types that are built during the prepare phase
        return this.toXml(this.model);
    }
    toXml(model) {
        const xmlStream = new XmlStream();
        this.render(xmlStream, model);
        return xmlStream.xml;
    }
    // ============================================================
    // Useful Utilities
    static toAttribute(value, dflt, always = false) {
        if (value === undefined) {
            if (always) {
                return dflt;
            }
        }
        else if (always || value !== dflt) {
            return value.toString();
        }
        return undefined;
    }
    static toStringAttribute(value, dflt, always = false) {
        return BaseXform.toAttribute(value, dflt, always);
    }
    static toStringValue(attr, dflt) {
        return attr === undefined ? dflt : attr;
    }
    static toBoolAttribute(value, dflt, always = false) {
        if (value === undefined) {
            if (always) {
                return dflt;
            }
        }
        else if (always || value !== dflt) {
            return value ? '1' : '0';
        }
        return undefined;
    }
    static toBoolValue(attr, dflt) {
        return attr === undefined ? dflt : attr === '1';
    }
    static toIntAttribute(value, dflt, always = false) {
        return BaseXform.toAttribute(value, dflt, always);
    }
    static toIntValue(attr, dflt) {
        return attr === undefined ? dflt : parseInt(attr, 10);
    }
    static toFloatAttribute(value, dflt, always = false) {
        return BaseXform.toAttribute(value, dflt, always);
    }
    static toFloatValue(attr, dflt) {
        return attr === undefined ? dflt : parseFloat(attr);
    }
}
module.exports = BaseXform;
//# sourceMappingURL=base-xform.js.map