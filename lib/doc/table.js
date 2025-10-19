"use strict";
/* eslint-disable max-classes-per-file */
var colCache = require("../utils/col-cache");
var Column = /** @class */ (function () {
    function Column(table, column, index) {
        this.table = table;
        this.column = column;
        this.index = index;
    }
    Column.prototype._set = function (name, value) {
        this.table.cacheState();
        this.column[name] = value;
    };
    Object.defineProperty(Column.prototype, "name", {
        /* eslint-disable lines-between-class-members */
        get: function () {
            return this.column.name;
        },
        set: function (value) {
            this._set('name', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "filterButton", {
        get: function () {
            return this.column.filterButton;
        },
        set: function (value) {
            this.column.filterButton = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "style", {
        get: function () {
            return this.column.style;
        },
        set: function (value) {
            this.column.style = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "totalsRowLabel", {
        get: function () {
            return this.column.totalsRowLabel;
        },
        set: function (value) {
            this._set('totalsRowLabel', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "totalsRowFunction", {
        get: function () {
            return this.column.totalsRowFunction;
        },
        set: function (value) {
            this._set('totalsRowFunction', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "totalsRowResult", {
        get: function () {
            return this.column.totalsRowResult;
        },
        set: function (value) {
            this._set('totalsRowResult', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "totalsRowFormula", {
        get: function () {
            return this.column.totalsRowFormula;
        },
        set: function (value) {
            this._set('totalsRowFormula', value);
        },
        enumerable: false,
        configurable: true
    });
    return Column;
}());
var Table = /** @class */ (function () {
    function Table(worksheet, table) {
        this.worksheet = worksheet;
        if (table) {
            this.table = table;
            // check things are ok first
            this.validate();
            this.store();
        }
    }
    Table.prototype.getFormula = function (column) {
        // get the correct formula to apply to the totals row
        switch (column.totalsRowFunction) {
            case 'none':
                return null;
            case 'average':
                return "SUBTOTAL(101,".concat(this.table.name, "[").concat(column.name, "])");
            case 'countNums':
                return "SUBTOTAL(102,".concat(this.table.name, "[").concat(column.name, "])");
            case 'count':
                return "SUBTOTAL(103,".concat(this.table.name, "[").concat(column.name, "])");
            case 'max':
                return "SUBTOTAL(104,".concat(this.table.name, "[").concat(column.name, "])");
            case 'min':
                return "SUBTOTAL(105,".concat(this.table.name, "[").concat(column.name, "])");
            case 'stdDev':
                return "SUBTOTAL(106,".concat(this.table.name, "[").concat(column.name, "])");
            case 'var':
                return "SUBTOTAL(107,".concat(this.table.name, "[").concat(column.name, "])");
            case 'sum':
                return "SUBTOTAL(109,".concat(this.table.name, "[").concat(column.name, "])");
            case 'custom':
                return column.totalsRowFormula || null;
            default:
                throw new Error("Invalid Totals Row Function: ".concat(column.totalsRowFunction));
        }
    };
    Object.defineProperty(Table.prototype, "width", {
        get: function () {
            // width of the table
            return this.table.columns.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "height", {
        get: function () {
            // height of the table data
            return this.table.rows.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "filterHeight", {
        get: function () {
            // height of the table data plus optional header row
            return this.height + (this.table.headerRow ? 1 : 0);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "tableHeight", {
        get: function () {
            // full height of the table on the sheet
            return this.filterHeight + (this.table.totalsRow ? 1 : 0);
        },
        enumerable: false,
        configurable: true
    });
    Table.prototype.validate = function () {
        var _this = this;
        var table = this.table;
        // set defaults and check is valid
        var assign = function (o, name, dflt) {
            if (o[name] === undefined) {
                o[name] = dflt;
            }
        };
        assign(table, 'headerRow', true);
        assign(table, 'totalsRow', false);
        assign(table, 'style', {});
        assign(table.style, 'theme', 'TableStyleMedium2');
        assign(table.style, 'showFirstColumn', false);
        assign(table.style, 'showLastColumn', false);
        assign(table.style, 'showRowStripes', false);
        assign(table.style, 'showColumnStripes', false);
        var assert = function (test, message) {
            if (!test) {
                throw new Error(message);
            }
        };
        assert(!!table.ref, 'Table must have ref');
        assert(!!table.columns, 'Table must have column definitions');
        assert(!!table.rows, 'Table must have row definitions');
        table.tl = colCache.decodeAddress(table.ref);
        var _a = table.tl, row = _a.row, col = _a.col;
        assert(row > 0, 'Table must be on valid row');
        assert(col > 0, 'Table must be on valid col');
        var _b = this, width = _b.width, filterHeight = _b.filterHeight, tableHeight = _b.tableHeight;
        // autoFilterRef is a range that includes optional headers only
        table.autoFilterRef = colCache.encode(row, col, row + filterHeight - 1, col + width - 1);
        // tableRef is a range that includes optional headers and totals
        table.tableRef = colCache.encode(row, col, row + tableHeight - 1, col + width - 1);
        table.columns.forEach(function (column, i) {
            assert(!!column.name, "Column ".concat(i, " must have a name"));
            if (i === 0) {
                assign(column, 'totalsRowLabel', 'Total');
            }
            else {
                assign(column, 'totalsRowFunction', 'none');
                column.totalsRowFormula = _this.getFormula(column) || undefined;
            }
        });
    };
    Table.prototype.store = function () {
        var _this = this;
        // where the table needs to store table data, headers, footers in
        // the sheet...
        var assignStyle = function (cell, style) {
            if (style) {
                Object.keys(style).forEach(function (key) {
                    cell.style[key] = style[key];
                });
            }
        };
        var _a = this, worksheet = _a.worksheet, table = _a.table;
        var _b = table.tl, row = _b.row, col = _b.col;
        var count = 0;
        if (table.headerRow) {
            var r_1 = worksheet.getRow(row + count++);
            table.columns.forEach(function (column, j) {
                var style = column.style, name = column.name;
                var cell = r_1.getCell(col + j);
                cell.value = name;
                assignStyle(cell, style);
            });
        }
        table.rows.forEach(function (data) {
            var r = worksheet.getRow(row + count++);
            data.forEach(function (value, j) {
                var cell = r.getCell(col + j);
                cell.value = value;
                assignStyle(cell, table.columns[j].style);
            });
        });
        if (table.totalsRow) {
            var r_2 = worksheet.getRow(row + count++);
            table.columns.forEach(function (column, j) {
                var cell = r_2.getCell(col + j);
                if (j === 0) {
                    cell.value = column.totalsRowLabel;
                }
                else {
                    var formula = _this.getFormula(column);
                    if (formula) {
                        cell.value = {
                            formula: column.totalsRowFormula,
                            result: column.totalsRowResult,
                        };
                    }
                    else {
                        cell.value = null;
                    }
                }
                assignStyle(cell, column.style);
            });
        }
    };
    Table.prototype.load = function (worksheet) {
        var _this = this;
        // where the table will read necessary features from a loaded sheet
        var table = this.table;
        var _a = table.tl, row = _a.row, col = _a.col;
        var count = 0;
        if (table.headerRow) {
            var r_3 = worksheet.getRow(row + count++);
            table.columns.forEach(function (column, j) {
                var cell = r_3.getCell(col + j);
                cell.value = column.name;
            });
        }
        table.rows.forEach(function (data) {
            var r = worksheet.getRow(row + count++);
            data.forEach(function (value, j) {
                var cell = r.getCell(col + j);
                cell.value = value;
            });
        });
        if (table.totalsRow) {
            var r_4 = worksheet.getRow(row + count++);
            table.columns.forEach(function (column, j) {
                var cell = r_4.getCell(col + j);
                if (j === 0) {
                    cell.value = column.totalsRowLabel;
                }
                else {
                    var formula = _this.getFormula(column);
                    if (formula) {
                        cell.value = {
                            formula: column.totalsRowFormula,
                            result: column.totalsRowResult,
                        };
                    }
                }
            });
        }
    };
    Object.defineProperty(Table.prototype, "model", {
        get: function () {
            return this.table;
        },
        set: function (value) {
            this.table = value;
        },
        enumerable: false,
        configurable: true
    });
    // ================================================================
    // TODO: Mutating methods
    Table.prototype.cacheState = function () {
        if (!this._cache) {
            this._cache = {
                ref: this.ref,
                width: this.width,
                tableHeight: this.tableHeight,
            };
        }
    };
    Table.prototype.commit = function () {
        // changes may have been made that might have on-sheet effects
        if (!this._cache) {
            return;
        }
        // check things are ok first
        this.validate();
        var ref = colCache.decodeAddress(this._cache.ref);
        if (this.ref !== this._cache.ref) {
            // wipe out whole table footprint at previous location
            for (var i = 0; i < this._cache.tableHeight; i++) {
                var row = this.worksheet.getRow(ref.row + i);
                for (var j = 0; j < this._cache.width; j++) {
                    var cell = row.getCell(ref.col + j);
                    cell.value = null;
                }
            }
        }
        else {
            // clear out below table if it has shrunk
            for (var i = this.tableHeight; i < this._cache.tableHeight; i++) {
                var row = this.worksheet.getRow(ref.row + i);
                for (var j = 0; j < this._cache.width; j++) {
                    var cell = row.getCell(ref.col + j);
                    cell.value = null;
                }
            }
            // clear out to right of table if it has lost columns
            for (var i = 0; i < this.tableHeight; i++) {
                var row = this.worksheet.getRow(ref.row + i);
                for (var j = this.width; j < this._cache.width; j++) {
                    var cell = row.getCell(ref.col + j);
                    cell.value = null;
                }
            }
        }
        this.store();
    };
    Table.prototype.addRow = function (values, rowNumber) {
        // Add a row of data, either insert at rowNumber or append
        this.cacheState();
        if (rowNumber === undefined) {
            this.table.rows.push(values);
        }
        else {
            this.table.rows.splice(rowNumber, 0, values);
        }
    };
    Table.prototype.removeRows = function (rowIndex, count) {
        if (count === void 0) { count = 1; }
        // Remove a rows of data
        this.cacheState();
        this.table.rows.splice(rowIndex, count);
    };
    Table.prototype.getColumn = function (colIndex) {
        var column = this.table.columns[colIndex];
        return new Column(this, column, colIndex);
    };
    Table.prototype.addColumn = function (column, values, colIndex) {
        // Add a new column, including column defn and values
        // Inserts at colNumber or adds to the right
        this.cacheState();
        if (colIndex === undefined) {
            this.table.columns.push(column);
            this.table.rows.forEach(function (row, i) {
                row.push(values[i]);
            });
        }
        else {
            this.table.columns.splice(colIndex, 0, column);
            this.table.rows.forEach(function (row, i) {
                row.splice(colIndex, 0, values[i]);
            });
        }
    };
    Table.prototype.removeColumns = function (colIndex, count) {
        if (count === void 0) { count = 1; }
        // Remove a column with data
        this.cacheState();
        this.table.columns.splice(colIndex, count);
        this.table.rows.forEach(function (row) {
            row.splice(colIndex, count);
        });
    };
    Table.prototype._assign = function (target, prop, value) {
        this.cacheState();
        target[prop] = value;
    };
    Object.defineProperty(Table.prototype, "ref", {
        /* eslint-disable lines-between-class-members */
        get: function () {
            return this.table.ref;
        },
        set: function (value) {
            this._assign(this.table, 'ref', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "name", {
        get: function () {
            return this.table.name;
        },
        set: function (value) {
            this.table.name = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "displayName", {
        get: function () {
            return this.table.displayName || this.table.name;
        },
        set: function (value) {
            this.table.displayName = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "headerRow", {
        get: function () {
            return this.table.headerRow;
        },
        set: function (value) {
            this._assign(this.table, 'headerRow', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "totalsRow", {
        get: function () {
            return this.table.totalsRow;
        },
        set: function (value) {
            this._assign(this.table, 'totalsRow', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "theme", {
        get: function () {
            return this.table.style.name;
        },
        set: function (value) {
            this.table.style.name = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "showFirstColumn", {
        get: function () {
            return this.table.style.showFirstColumn;
        },
        set: function (value) {
            this.table.style.showFirstColumn = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "showLastColumn", {
        get: function () {
            return this.table.style.showLastColumn;
        },
        set: function (value) {
            this.table.style.showLastColumn = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "showRowStripes", {
        get: function () {
            return this.table.style.showRowStripes;
        },
        set: function (value) {
            this.table.style.showRowStripes = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "showColumnStripes", {
        get: function () {
            return this.table.style.showColumnStripes;
        },
        set: function (value) {
            this.table.style.showColumnStripes = value;
        },
        enumerable: false,
        configurable: true
    });
    return Table;
}());
module.exports = Table;
