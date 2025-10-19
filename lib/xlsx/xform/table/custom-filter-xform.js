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
var CustomFilterXform = /** @class */ (function (_super) {
    __extends(CustomFilterXform, _super);
    function CustomFilterXform() {
        var _this = _super.call(this) || this;
        _this.model = { val: '' };
        return _this;
    }
    Object.defineProperty(CustomFilterXform.prototype, "tag", {
        get: function () {
            return 'customFilter';
        },
        enumerable: false,
        configurable: true
    });
    CustomFilterXform.prototype.render = function (xmlStream, model) {
        xmlStream.leafNode(this.tag, {
            val: model.val,
            operator: model.operator,
        });
    };
    CustomFilterXform.prototype.parseOpen = function (node) {
        if (node.name === this.tag) {
            this.model = {
                val: node.attributes.val,
                operator: node.attributes.operator,
            };
            return true;
        }
        return false;
    };
    CustomFilterXform.prototype.parseText = function () { };
    CustomFilterXform.prototype.parseClose = function () {
        return false;
    };
    return CustomFilterXform;
}(BaseXform));
module.exports = CustomFilterXform;
