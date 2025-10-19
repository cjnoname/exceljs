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
var BaseXform = require("./base-xform");
var ListXform = /** @class */ (function (_super) {
    __extends(ListXform, _super);
    function ListXform(options) {
        var _this = _super.call(this) || this;
        _this.tag = options.tag;
        _this.always = !!options.always;
        _this.count = options.count;
        _this.empty = options.empty;
        _this.$count = options.$count || 'count';
        _this.$ = options.$;
        _this.childXform = options.childXform;
        _this.maxItems = options.maxItems;
        return _this;
    }
    ListXform.prototype.prepare = function (model, options) {
        var childXform = this.childXform;
        if (model) {
            model.forEach(function (childModel, index) {
                options.index = index;
                childXform.prepare(childModel, options);
            });
        }
    };
    ListXform.prototype.render = function (xmlStream, model) {
        if (this.always || (model && model.length)) {
            xmlStream.openNode(this.tag, this.$);
            if (this.count) {
                xmlStream.addAttribute(this.$count, (model && model.length) || 0);
            }
            var childXform_1 = this.childXform;
            (model || []).forEach(function (childModel, index) {
                childXform_1.render(xmlStream, childModel, index);
            });
            xmlStream.closeNode();
        }
        else if (this.empty) {
            xmlStream.leafNode(this.tag);
        }
    };
    ListXform.prototype.parseOpen = function (node) {
        if (this.parser) {
            this.parser.parseOpen(node);
            return true;
        }
        switch (node.name) {
            case this.tag:
                this.model = [];
                return true;
            default:
                if (this.childXform.parseOpen(node)) {
                    this.parser = this.childXform;
                    return true;
                }
                return false;
        }
    };
    ListXform.prototype.parseText = function (text) {
        if (this.parser) {
            this.parser.parseText(text);
        }
    };
    ListXform.prototype.parseClose = function (name) {
        if (this.parser) {
            if (!this.parser.parseClose(name)) {
                this.model.push(this.parser.model);
                this.parser = undefined;
                if (this.maxItems && this.model.length > this.maxItems) {
                    throw new Error("Max ".concat(this.childXform.tag, " count (").concat(this.maxItems, ") exceeded"));
                }
            }
            return true;
        }
        return false;
    };
    ListXform.prototype.reconcile = function (model, options) {
        if (model) {
            var childXform_2 = this.childXform;
            model.forEach(function (childModel) {
                childXform_2.reconcile(childModel, options);
            });
        }
    };
    return ListXform;
}(BaseXform));
module.exports = ListXform;
