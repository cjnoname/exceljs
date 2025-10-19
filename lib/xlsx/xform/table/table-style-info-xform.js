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
var TableStyleInfoXform = /** @class */ (function (_super) {
    __extends(TableStyleInfoXform, _super);
    function TableStyleInfoXform() {
        var _this = _super.call(this) || this;
        _this.model = {
            theme: null,
            showFirstColumn: false,
            showLastColumn: false,
            showRowStripes: false,
            showColumnStripes: false,
        };
        return _this;
    }
    Object.defineProperty(TableStyleInfoXform.prototype, "tag", {
        get: function () {
            return 'tableStyleInfo';
        },
        enumerable: false,
        configurable: true
    });
    TableStyleInfoXform.prototype.render = function (xmlStream, model) {
        xmlStream.leafNode(this.tag, {
            name: model.theme ? model.theme : undefined,
            showFirstColumn: model.showFirstColumn ? '1' : '0',
            showLastColumn: model.showLastColumn ? '1' : '0',
            showRowStripes: model.showRowStripes ? '1' : '0',
            showColumnStripes: model.showColumnStripes ? '1' : '0',
        });
    };
    TableStyleInfoXform.prototype.parseOpen = function (node) {
        if (node.name === this.tag) {
            var attributes = node.attributes;
            this.model = {
                theme: attributes.name ? attributes.name : null,
                showFirstColumn: attributes.showFirstColumn === '1',
                showLastColumn: attributes.showLastColumn === '1',
                showRowStripes: attributes.showRowStripes === '1',
                showColumnStripes: attributes.showColumnStripes === '1',
            };
            return true;
        }
        return false;
    };
    TableStyleInfoXform.prototype.parseText = function () { };
    TableStyleInfoXform.prototype.parseClose = function () {
        return false;
    };
    return TableStyleInfoXform;
}(BaseXform));
module.exports = TableStyleInfoXform;
