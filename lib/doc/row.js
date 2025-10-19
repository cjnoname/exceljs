"use strict";
var _ = require('../utils/under-dash');
var Enums = require("./enums");
var colCache = require("../utils/col-cache");
var Cell = require("./cell");
var Row = /** @class */ (function () {
    function Row(worksheet, number) {
        this._worksheet = worksheet;
        this._number = number;
        this._cells = [];
        this.style = {};
        this.outlineLevel = 0;
    }
    Object.defineProperty(Row.prototype, "number", {
        // return the row number
        get: function () {
            return this._number;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Row.prototype, "worksheet", {
        get: function () {
            return this._worksheet;
        },
        enumerable: false,
        configurable: true
    });
    // Inform Streaming Writer that this row (and all rows before it) are complete
    // and ready to write. Has no effect on Worksheet document
    Row.prototype.commit = function () {
        this._worksheet._commitRow(this);
    };
    // helps GC by breaking cyclic references
    Row.prototype.destroy = function () {
        delete this._worksheet;
        delete this._cells;
        delete this.style;
    };
    Row.prototype.findCell = function (colNumber) {
        return this._cells[colNumber - 1];
    };
    // given {address, row, col}, find or create new cell
    Row.prototype.getCellEx = function (address) {
        var cell = this._cells[address.col - 1];
        if (!cell) {
            var column = this._worksheet.getColumn(address.col);
            cell = new Cell(this, column, address.address);
            this._cells[address.col - 1] = cell;
        }
        return cell;
    };
    // get cell by key, letter or column number
    Row.prototype.getCell = function (col) {
        var colNum;
        if (typeof col === 'string') {
            // is it a key?
            var column = this._worksheet.getColumnKey(col);
            if (column) {
                colNum = column.number;
            }
            else {
                colNum = colCache.l2n(col);
            }
        }
        else {
            colNum = col;
        }
        return (this._cells[colNum - 1] ||
            this.getCellEx({
                address: colCache.encodeAddress(this._number, colNum),
                row: this._number,
                col: colNum,
            }));
    };
    // remove cell(s) and shift all higher cells down by count
    Row.prototype.splice = function (start, count) {
        var inserts = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            inserts[_i - 2] = arguments[_i];
        }
        var nKeep = start + count;
        var nExpand = inserts.length - count;
        var nEnd = this._cells.length;
        var i;
        var cSrc;
        var cDst;
        if (nExpand < 0) {
            // remove cells
            for (i = start + inserts.length; i <= nEnd; i++) {
                cDst = this._cells[i - 1];
                cSrc = this._cells[i - nExpand - 1];
                if (cSrc) {
                    cDst = this.getCell(i);
                    cDst.value = cSrc.value;
                    cDst.style = cSrc.style;
                    cDst._comment = cSrc._comment;
                }
                else if (cDst) {
                    cDst.value = null;
                    cDst.style = {};
                    cDst._comment = undefined;
                }
            }
        }
        else if (nExpand > 0) {
            // insert new cells
            for (i = nEnd; i >= nKeep; i--) {
                cSrc = this._cells[i - 1];
                if (cSrc) {
                    cDst = this.getCell(i + nExpand);
                    cDst.value = cSrc.value;
                    cDst.style = cSrc.style;
                    cDst._comment = cSrc._comment;
                }
                else {
                    this._cells[i + nExpand - 1] = undefined;
                }
            }
        }
        // now add the new values
        for (i = 0; i < inserts.length; i++) {
            cDst = this.getCell(start + i);
            cDst.value = inserts[i];
            cDst.style = {};
            cDst._comment = undefined;
        }
    };
    Row.prototype.eachCell = function (options, iteratee) {
        if (!iteratee) {
            iteratee = options;
            options = null;
        }
        if (options && options.includeEmpty) {
            var n = this._cells.length;
            for (var i = 1; i <= n; i++) {
                iteratee(this.getCell(i), i);
            }
        }
        else {
            this._cells.forEach(function (cell, index) {
                if (cell && cell.type !== Enums.ValueType.Null) {
                    iteratee(cell, index + 1);
                }
            });
        }
    };
    // ===========================================================================
    // Page Breaks
    Row.prototype.addPageBreak = function (lft, rght) {
        var ws = this._worksheet;
        var left = Math.max(0, (lft || 0) - 1) || 0;
        var right = Math.max(0, (rght || 0) - 1) || 16838;
        var pb = {
            id: this._number,
            max: right,
            man: 1,
        };
        if (left)
            pb.min = left;
        ws.rowBreaks.push(pb);
    };
    Object.defineProperty(Row.prototype, "values", {
        // return a sparse array of cell values
        get: function () {
            var values = [];
            this._cells.forEach(function (cell) {
                if (cell && cell.type !== Enums.ValueType.Null) {
                    values[cell.col] = cell.value;
                }
            });
            return values;
        },
        // set the values by contiguous or sparse array, or by key'd object literal
        set: function (value) {
            var _this = this;
            // this operation is not additive - any prior cells are removed
            this._cells = [];
            if (!value) {
                // empty row
            }
            else if (value instanceof Array) {
                var offset_1 = 0;
                if (value.hasOwnProperty('0')) {
                    // contiguous array - start at column 1
                    offset_1 = 1;
                }
                value.forEach(function (item, index) {
                    if (item !== undefined) {
                        _this.getCellEx({
                            address: colCache.encodeAddress(_this._number, index + offset_1),
                            row: _this._number,
                            col: index + offset_1,
                        }).value = item;
                    }
                });
            }
            else {
                // assume object with column keys
                this._worksheet.eachColumnKey(function (column, key) {
                    if (value[key] !== undefined) {
                        _this.getCellEx({
                            address: colCache.encodeAddress(_this._number, column.number),
                            row: _this._number,
                            col: column.number,
                        }).value = value[key];
                    }
                });
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Row.prototype, "hasValues", {
        // returns true if the row includes at least one cell with a value
        get: function () {
            return _.some(this._cells, function (cell) { return cell && cell.type !== Enums.ValueType.Null; });
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Row.prototype, "cellCount", {
        get: function () {
            return this._cells.length;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Row.prototype, "actualCellCount", {
        get: function () {
            var count = 0;
            this.eachCell(function () {
                count++;
            });
            return count;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Row.prototype, "dimensions", {
        // get the min and max column number for the non-null cells in this row or null
        get: function () {
            var min = 0;
            var max = 0;
            this._cells.forEach(function (cell) {
                if (cell && cell.type !== Enums.ValueType.Null) {
                    if (!min || min > cell.col) {
                        min = cell.col;
                    }
                    if (max < cell.col) {
                        max = cell.col;
                    }
                }
            });
            return min > 0
                ? {
                    min: min,
                    max: max,
                }
                : null;
        },
        enumerable: false,
        configurable: true
    });
    // =========================================================================
    // styles
    Row.prototype._applyStyle = function (name, value) {
        this.style[name] = value;
        this._cells.forEach(function (cell) {
            if (cell) {
                cell[name] = value;
            }
        });
        return value;
    };
    Object.defineProperty(Row.prototype, "numFmt", {
        get: function () {
            return this.style.numFmt;
        },
        set: function (value) {
            this._applyStyle('numFmt', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Row.prototype, "font", {
        get: function () {
            return this.style.font;
        },
        set: function (value) {
            this._applyStyle('font', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Row.prototype, "alignment", {
        get: function () {
            return this.style.alignment;
        },
        set: function (value) {
            this._applyStyle('alignment', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Row.prototype, "protection", {
        get: function () {
            return this.style.protection;
        },
        set: function (value) {
            this._applyStyle('protection', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Row.prototype, "border", {
        get: function () {
            return this.style.border;
        },
        set: function (value) {
            this._applyStyle('border', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Row.prototype, "fill", {
        get: function () {
            return this.style.fill;
        },
        set: function (value) {
            this._applyStyle('fill', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Row.prototype, "hidden", {
        get: function () {
            return !!this._hidden;
        },
        set: function (value) {
            this._hidden = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Row.prototype, "outlineLevel", {
        get: function () {
            return this._outlineLevel || 0;
        },
        set: function (value) {
            this._outlineLevel = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Row.prototype, "collapsed", {
        get: function () {
            return !!(this._outlineLevel && this._outlineLevel >= this._worksheet.properties.outlineLevelRow);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Row.prototype, "model", {
        // =========================================================================
        get: function () {
            var cells = [];
            var min = 0;
            var max = 0;
            this._cells.forEach(function (cell) {
                if (cell) {
                    var cellModel = cell.model;
                    if (cellModel) {
                        if (!min || min > cell.col) {
                            min = cell.col;
                        }
                        if (max < cell.col) {
                            max = cell.col;
                        }
                        cells.push(cellModel);
                    }
                }
            });
            return this.height || cells.length
                ? {
                    cells: cells,
                    number: this.number,
                    min: min,
                    max: max,
                    height: this.height,
                    style: this.style,
                    hidden: this.hidden,
                    outlineLevel: this.outlineLevel,
                    collapsed: this.collapsed,
                }
                : null;
        },
        set: function (value) {
            var _this = this;
            if (value.number !== this._number) {
                throw new Error('Invalid row number in model');
            }
            this._cells = [];
            var previousAddress;
            value.cells.forEach(function (cellModel) {
                switch (cellModel.type) {
                    case Cell.Types.Merge:
                        // special case - don't add this types
                        break;
                    default: {
                        var address = void 0;
                        if (cellModel.address) {
                            address = colCache.decodeAddress(cellModel.address);
                        }
                        else if (previousAddress) {
                            // This is a <c> element without an r attribute
                            // Assume that it's the cell for the next column
                            var row = previousAddress.row;
                            var col = previousAddress.col + 1;
                            address = {
                                row: row,
                                col: col,
                                address: colCache.encodeAddress(row, col),
                                $col$row: "$".concat(colCache.n2l(col), "$").concat(row),
                            };
                        }
                        previousAddress = address;
                        var cell = _this.getCellEx(address);
                        cell.model = cellModel;
                        break;
                    }
                }
            });
            if (value.height) {
                this.height = value.height;
            }
            else {
                delete this.height;
            }
            this.hidden = value.hidden;
            this.outlineLevel = value.outlineLevel || 0;
            this.style = (value.style && JSON.parse(JSON.stringify(value.style))) || {};
        },
        enumerable: false,
        configurable: true
    });
    return Row;
}());
module.exports = Row;
