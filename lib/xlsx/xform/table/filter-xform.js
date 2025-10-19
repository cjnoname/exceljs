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
var FilterXform = /** @class */ (function (_super) {
    __extends(FilterXform, _super);
    function FilterXform() {
        var _this = _super.call(this) || this;
        _this.model = { val: '' };
        return _this;
    }
    Object.defineProperty(FilterXform.prototype, "tag", {
        get: function () {
            return 'filter';
        },
        enumerable: false,
        configurable: true
    });
    FilterXform.prototype.render = function (xmlStream, model) {
        xmlStream.leafNode(this.tag, {
            val: model.val,
        });
    };
    FilterXform.prototype.parseOpen = function (node) {
        if (node.name === this.tag) {
            this.model = {
                val: node.attributes.val,
            };
            return true;
        }
        return false;
    };
    FilterXform.prototype.parseText = function () { };
    FilterXform.prototype.parseClose = function () {
        return false;
    };
    return FilterXform;
}(BaseXform));
module.exports = FilterXform;
