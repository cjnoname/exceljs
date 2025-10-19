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
var FilterColumnXform = require("./filter-column-xform");
var AutoFilterXform = /** @class */ (function (_super) {
    __extends(AutoFilterXform, _super);
    function AutoFilterXform() {
        var _this = _super.call(this) || this;
        _this.map = {
            filterColumn: new FilterColumnXform(),
        };
        _this.model = { autoFilterRef: '', columns: [] };
        return _this;
    }
    Object.defineProperty(AutoFilterXform.prototype, "tag", {
        get: function () {
            return 'autoFilter';
        },
        enumerable: false,
        configurable: true
    });
    AutoFilterXform.prototype.prepare = function (model) {
        var _this = this;
        model.columns.forEach(function (column, index) {
            _this.map.filterColumn.prepare(column, { index: index });
        });
    };
    AutoFilterXform.prototype.render = function (xmlStream, model) {
        var _this = this;
        xmlStream.openNode(this.tag, { ref: model.autoFilterRef });
        model.columns.forEach(function (column) {
            _this.map.filterColumn.render(xmlStream, column);
        });
        xmlStream.closeNode();
    };
    AutoFilterXform.prototype.parseOpen = function (node) {
        if (this.parser) {
            this.parser.parseOpen(node);
            return true;
        }
        switch (node.name) {
            case this.tag:
                this.model = {
                    autoFilterRef: node.attributes.ref,
                    columns: [],
                };
                return true;
            default:
                this.parser = this.map[node.name];
                if (this.parser) {
                    this.parseOpen(node);
                    return true;
                }
                throw new Error("Unexpected xml node in parseOpen: ".concat(JSON.stringify(node)));
        }
    };
    AutoFilterXform.prototype.parseText = function (text) {
        if (this.parser) {
            this.parser.parseText(text);
        }
    };
    AutoFilterXform.prototype.parseClose = function (name) {
        if (this.parser) {
            if (!this.parser.parseClose(name)) {
                this.model.columns.push(this.parser.model);
                this.parser = undefined;
            }
            return true;
        }
        switch (name) {
            case this.tag:
                return false;
            default:
                throw new Error("Unexpected xml node in parseClose: ".concat(name));
        }
    };
    return AutoFilterXform;
}(BaseXform));
module.exports = AutoFilterXform;
