"use strict";
var _ = require("./under-dash");
var utils = require("./utils");
// constants
var OPEN_ANGLE = '<';
var CLOSE_ANGLE = '>';
var OPEN_ANGLE_SLASH = '</';
var CLOSE_SLASH_ANGLE = '/>';
function pushAttribute(xml, name, value) {
    xml.push(" ".concat(name, "=\"").concat(utils.xmlEncode(value.toString()), "\""));
}
function pushAttributes(xml, attributes) {
    if (attributes) {
        var tmp_1 = [];
        _.each(attributes, function (value, name) {
            if (value !== undefined) {
                pushAttribute(tmp_1, name, value);
            }
        });
        xml.push(tmp_1.join(""));
    }
}
var XmlStream = /** @class */ (function () {
    function XmlStream() {
        this._xml = [];
        this._stack = [];
        this._rollbacks = [];
    }
    Object.defineProperty(XmlStream.prototype, "tos", {
        get: function () {
            return this._stack.length ? this._stack[this._stack.length - 1] : undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(XmlStream.prototype, "cursor", {
        get: function () {
            // handy way to track whether anything has been added
            return this._xml.length;
        },
        enumerable: false,
        configurable: true
    });
    XmlStream.prototype.openXml = function (docAttributes) {
        var xml = this._xml;
        // <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        xml.push('<?xml');
        pushAttributes(xml, docAttributes);
        xml.push('?>\n');
    };
    XmlStream.prototype.openNode = function (name, attributes) {
        var parent = this.tos;
        var xml = this._xml;
        if (parent && this.open) {
            xml.push(CLOSE_ANGLE);
        }
        this._stack.push(name);
        // start streaming node
        xml.push(OPEN_ANGLE);
        xml.push(name);
        pushAttributes(xml, attributes);
        this.leaf = true;
        this.open = true;
    };
    XmlStream.prototype.addAttribute = function (name, value) {
        if (!this.open) {
            throw new Error('Cannot write attributes to node if it is not open');
        }
        if (value !== undefined) {
            pushAttribute(this._xml, name, value);
        }
    };
    XmlStream.prototype.addAttributes = function (attrs) {
        if (!this.open) {
            throw new Error('Cannot write attributes to node if it is not open');
        }
        pushAttributes(this._xml, attrs);
    };
    XmlStream.prototype.writeText = function (text) {
        var xml = this._xml;
        if (this.open) {
            xml.push(CLOSE_ANGLE);
            this.open = false;
        }
        this.leaf = false;
        xml.push(utils.xmlEncode(text.toString()));
    };
    XmlStream.prototype.writeXml = function (xml) {
        if (this.open) {
            this._xml.push(CLOSE_ANGLE);
            this.open = false;
        }
        this.leaf = false;
        this._xml.push(xml);
    };
    XmlStream.prototype.closeNode = function () {
        var node = this._stack.pop();
        var xml = this._xml;
        if (this.leaf) {
            xml.push(CLOSE_SLASH_ANGLE);
        }
        else {
            xml.push(OPEN_ANGLE_SLASH);
            xml.push(node);
            xml.push(CLOSE_ANGLE);
        }
        this.open = false;
        this.leaf = false;
    };
    XmlStream.prototype.leafNode = function (name, attributes, text) {
        this.openNode(name, attributes);
        if (text !== undefined) {
            // zeros need to be written
            this.writeText(text);
        }
        this.closeNode();
    };
    XmlStream.prototype.closeAll = function () {
        while (this._stack.length) {
            this.closeNode();
        }
    };
    XmlStream.prototype.addRollback = function () {
        this._rollbacks.push({
            xml: this._xml.length,
            stack: this._stack.length,
            leaf: this.leaf,
            open: this.open,
        });
        return this.cursor;
    };
    XmlStream.prototype.commit = function () {
        this._rollbacks.pop();
    };
    XmlStream.prototype.rollback = function () {
        var r = this._rollbacks.pop();
        if (this._xml.length > r.xml) {
            this._xml.splice(r.xml, this._xml.length - r.xml);
        }
        if (this._stack.length > r.stack) {
            this._stack.splice(r.stack, this._stack.length - r.stack);
        }
        this.leaf = r.leaf;
        this.open = r.open;
    };
    Object.defineProperty(XmlStream.prototype, "xml", {
        get: function () {
            this.closeAll();
            return this._xml.join('');
        },
        enumerable: false,
        configurable: true
    });
    XmlStream.StdDocAttributes = {
        version: '1.0',
        encoding: 'UTF-8',
        standalone: 'yes',
    };
    return XmlStream;
}());
module.exports = XmlStream;
