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
var TableColumnXform = /** @class */ (function (_super) {
    __extends(TableColumnXform, _super);
    function TableColumnXform() {
        var _this = _super.call(this) || this;
        _this.model = { name: '' };
        return _this;
    }
    Object.defineProperty(TableColumnXform.prototype, "tag", {
        get: function () {
            return 'tableColumn';
        },
        enumerable: false,
        configurable: true
    });
    TableColumnXform.prototype.prepare = function (model, options) {
        model.id = options.index + 1;
    };
    TableColumnXform.prototype.render = function (xmlStream, model) {
        xmlStream.leafNode(this.tag, {
            id: model.id.toString(),
            name: model.name,
            totalsRowLabel: model.totalsRowLabel,
            totalsRowFunction: model.totalsRowFunction,
            dxfId: model.dxfId,
        });
    };
    TableColumnXform.prototype.parseOpen = function (node) {
        if (node.name === this.tag) {
            var attributes = node.attributes;
            this.model = {
                name: attributes.name,
                totalsRowLabel: attributes.totalsRowLabel,
                totalsRowFunction: attributes.totalsRowFunction,
                dxfId: attributes.dxfId,
            };
            return true;
        }
        return false;
    };
    TableColumnXform.prototype.parseText = function () { };
    TableColumnXform.prototype.parseClose = function () {
        return false;
    };
    return TableColumnXform;
}(BaseXform));
module.exports = TableColumnXform;
