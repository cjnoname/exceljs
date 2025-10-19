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
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var XmlStream = require("../../../utils/xml-stream");
var BaseXform = require("../base-xform");
var ListXform = require("../list-xform");
var AutoFilterXform = require("./auto-filter-xform");
var TableColumnXform = require("./table-column-xform");
var TableStyleInfoXform = require("./table-style-info-xform");
var TableXform = /** @class */ (function (_super) {
    __extends(TableXform, _super);
    function TableXform() {
        var _this = _super.call(this) || this;
        _this.map = {
            autoFilter: new AutoFilterXform(),
            tableColumns: new ListXform({
                tag: 'tableColumns',
                count: true,
                empty: true,
                childXform: new TableColumnXform(),
            }),
            tableStyleInfo: new TableStyleInfoXform(),
        };
        _this.model = {
            id: 0,
            name: '',
            tableRef: '',
            columns: [],
        };
        return _this;
    }
    TableXform.prototype.prepare = function (model, options) {
        this.map.autoFilter.prepare(model);
        this.map.tableColumns.prepare(model.columns, options);
    };
    Object.defineProperty(TableXform.prototype, "tag", {
        get: function () {
            return 'table';
        },
        enumerable: false,
        configurable: true
    });
    TableXform.prototype.render = function (xmlStream, model) {
        xmlStream.openXml(XmlStream.StdDocAttributes);
        xmlStream.openNode(this.tag, __assign(__assign({}, TableXform.TABLE_ATTRIBUTES), { id: model.id, name: model.name, displayName: model.displayName || model.name, ref: model.tableRef, totalsRowCount: model.totalsRow ? '1' : undefined, totalsRowShown: model.totalsRow ? undefined : '1', headerRowCount: model.headerRow ? '1' : '0' }));
        this.map.autoFilter.render(xmlStream, model);
        this.map.tableColumns.render(xmlStream, model.columns);
        this.map.tableStyleInfo.render(xmlStream, model.style);
        xmlStream.closeNode();
    };
    TableXform.prototype.parseOpen = function (node) {
        if (this.parser) {
            this.parser.parseOpen(node);
            return true;
        }
        var name = node.name, attributes = node.attributes;
        switch (name) {
            case this.tag:
                this.reset();
                this.model = {
                    name: attributes.name,
                    displayName: attributes.displayName || attributes.name,
                    tableRef: attributes.ref,
                    totalsRow: attributes.totalsRowCount === '1',
                    headerRow: attributes.headerRowCount === '1',
                };
                break;
            default:
                this.parser = this.map[node.name];
                if (this.parser) {
                    this.parser.parseOpen(node);
                }
                break;
        }
        return true;
    };
    TableXform.prototype.parseText = function (text) {
        if (this.parser) {
            this.parser.parseText(text);
        }
    };
    TableXform.prototype.parseClose = function (name) {
        var _this = this;
        if (this.parser) {
            if (!this.parser.parseClose(name)) {
                this.parser = undefined;
            }
            return true;
        }
        switch (name) {
            case this.tag:
                this.model.columns = this.map.tableColumns.model;
                if (this.map.autoFilter.model) {
                    this.model.autoFilterRef = this.map.autoFilter.model.autoFilterRef;
                    this.map.autoFilter.model.columns.forEach(function (column, index) {
                        _this.model.columns[index].filterButton = column.filterButton;
                    });
                }
                this.model.style = this.map.tableStyleInfo.model;
                return false;
            default:
                // could be some unrecognised tags
                return true;
        }
    };
    TableXform.prototype.reconcile = function (model, options) {
        // fetch the dfxs from styles
        model.columns.forEach(function (column) {
            if (column.dxfId !== undefined) {
                column.style = options.styles.getDxfStyle(column.dxfId);
            }
        });
    };
    TableXform.TABLE_ATTRIBUTES = {
        xmlns: 'http://schemas.openxmlformats.org/spreadsheetml/2006/main',
        'xmlns:mc': 'http://schemas.openxmlformats.org/markup-compatibility/2006',
        'mc:Ignorable': 'xr xr3',
        'xmlns:xr': 'http://schemas.microsoft.com/office/spreadsheetml/2014/revision',
        'xmlns:xr3': 'http://schemas.microsoft.com/office/spreadsheetml/2016/revision3',
        // 'xr:uid': '{00000000-000C-0000-FFFF-FFFF00000000}',
    };
    return TableXform;
}(BaseXform));
module.exports = TableXform;
