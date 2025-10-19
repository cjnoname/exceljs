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
var ListXform = require("../list-xform");
var CustomFilterXform = require("./custom-filter-xform");
var FilterXform = require("./filter-xform");
var FilterColumnXform = /** @class */ (function (_super) {
    __extends(FilterColumnXform, _super);
    function FilterColumnXform() {
        var _this = _super.call(this) || this;
        _this.map = {
            customFilters: new ListXform({
                tag: 'customFilters',
                count: false,
                empty: true,
                childXform: new CustomFilterXform(),
            }),
            filters: new ListXform({
                tag: 'filters',
                count: false,
                empty: true,
                childXform: new FilterXform(),
            }),
        };
        _this.model = { filterButton: false };
        return _this;
    }
    Object.defineProperty(FilterColumnXform.prototype, "tag", {
        get: function () {
            return 'filterColumn';
        },
        enumerable: false,
        configurable: true
    });
    FilterColumnXform.prototype.prepare = function (model, options) {
        model.colId = options.index.toString();
    };
    FilterColumnXform.prototype.render = function (xmlStream, model) {
        if (model.customFilters) {
            xmlStream.openNode(this.tag, {
                colId: model.colId,
                hiddenButton: model.filterButton ? '0' : '1',
            });
            this.map.customFilters.render(xmlStream, model.customFilters);
            xmlStream.closeNode();
            return;
        }
        xmlStream.leafNode(this.tag, {
            colId: model.colId,
            hiddenButton: model.filterButton ? '0' : '1',
        });
    };
    FilterColumnXform.prototype.parseOpen = function (node) {
        if (this.parser) {
            this.parser.parseOpen(node);
            return true;
        }
        var attributes = node.attributes;
        switch (node.name) {
            case this.tag:
                this.model = {
                    filterButton: attributes.hiddenButton === '0',
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
    FilterColumnXform.prototype.parseText = function () { };
    FilterColumnXform.prototype.parseClose = function (name) {
        if (this.parser) {
            if (!this.parser.parseClose(name)) {
                this.parser = undefined;
            }
            return true;
        }
        switch (name) {
            case this.tag:
                this.model.customFilters = this.map.customFilters.model;
                return false;
            default:
                // could be some unrecognised tags
                return true;
        }
    };
    return FilterColumnXform;
}(BaseXform));
module.exports = FilterColumnXform;
