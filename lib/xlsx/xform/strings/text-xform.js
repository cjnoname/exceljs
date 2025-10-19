"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var BaseXform = require("../base-xform");
//   <t xml:space="preserve"> is </t>
var TextXform = /** @class */ (function (_super) {
    __extends(TextXform, _super);
    function TextXform() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Object.defineProperty(TextXform.prototype, "tag", {
        get: function () {
            return 't';
        },
        enumerable: false,
        configurable: true
    });
    TextXform.prototype.render = function (xmlStream, model) {
        xmlStream.openNode('t');
        if (/^\s|\n|\s$/.test(model)) {
            xmlStream.addAttribute('xml:space', 'preserve');
        }
        xmlStream.writeText(model);
        xmlStream.closeNode();
    };
    Object.defineProperty(TextXform.prototype, "model", {
        get: function () {
            return this._text
                .join('')
                .replace(/_x([0-9A-F]{4})_/g, function ($0, $1) { return String.fromCharCode(parseInt($1, 16)); });
        },
        enumerable: false,
        configurable: true
    });
    TextXform.prototype.parseOpen = function (node) {
        switch (node.name) {
            case 't':
                this._text = [];
                return true;
            default:
                return false;
        }
    };
    TextXform.prototype.parseText = function (text) {
        this._text.push(text);
    };
    TextXform.prototype.parseClose = function () {
        return false;
    };
    return TextXform;
}(BaseXform));
module.exports = TextXform;
