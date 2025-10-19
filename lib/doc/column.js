'use strict';
var colCache = require("../utils/col-cache");
var _ = require('../utils/under-dash');
var Enums = require('./enums');
var DEFAULT_COLUMN_WIDTH = 9;
// Column defines the column properties for 1 column.
// This includes header rows, widths, key, (style), etc.
// Worksheet will condense the columns as appropriate during serialization
var Column = /** @class */ (function () {
    function Column(worksheet, number, defn) {
        this._worksheet = worksheet;
        this._number = number;
        if (defn !== false) {
            // sometimes defn will follow
            this.defn = defn;
        }
    }
    Object.defineProperty(Column.prototype, "number", {
        get: function () {
            return this._number;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "worksheet", {
        get: function () {
            return this._worksheet;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "letter", {
        get: function () {
            return colCache.n2l(this._number);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "isCustomWidth", {
        get: function () {
            return this.width !== undefined && this.width !== DEFAULT_COLUMN_WIDTH;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "defn", {
        get: function () {
            return {
                header: this._header,
                key: this.key,
                width: this.width,
                style: this.style,
                hidden: this.hidden,
                outlineLevel: this.outlineLevel,
            };
        },
        set: function (value) {
            if (value) {
                this.key = value.key;
                this.width = value.width !== undefined ? value.width : DEFAULT_COLUMN_WIDTH;
                this.outlineLevel = value.outlineLevel;
                if (value.style) {
                    this.style = value.style;
                }
                else {
                    this.style = {};
                }
                // headers must be set after style
                this.header = value.header;
                this._hidden = !!value.hidden;
            }
            else {
                delete this._header;
                delete this._key;
                delete this.width;
                this.style = {};
                this.outlineLevel = 0;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "headers", {
        get: function () {
            return this._header && this._header instanceof Array ? this._header : [this._header];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "header", {
        get: function () {
            return this._header;
        },
        set: function (value) {
            var _this = this;
            if (value !== undefined) {
                this._header = value;
                this.headers.forEach(function (text, index) {
                    _this._worksheet.getCell(index + 1, _this.number).value = text;
                });
            }
            else {
                this._header = undefined;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "key", {
        get: function () {
            return this._key;
        },
        set: function (value) {
            var column = this._key && this._worksheet.getColumnKey(this._key);
            if (column === this) {
                this._worksheet.deleteColumnKey(this._key);
            }
            this._key = value;
            if (value) {
                this._worksheet.setColumnKey(this._key, this);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "hidden", {
        get: function () {
            return !!this._hidden;
        },
        set: function (value) {
            this._hidden = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "outlineLevel", {
        get: function () {
            return this._outlineLevel || 0;
        },
        set: function (value) {
            this._outlineLevel = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "collapsed", {
        get: function () {
            return !!(this._outlineLevel && this._outlineLevel >= this._worksheet.properties.outlineLevelCol);
        },
        enumerable: false,
        configurable: true
    });
    Column.prototype.toString = function () {
        return JSON.stringify({
            key: this.key,
            width: this.width,
            headers: this.headers.length ? this.headers : undefined,
        });
    };
    Column.prototype.equivalentTo = function (other) {
        return (this.width === other.width &&
            this.hidden === other.hidden &&
            this.outlineLevel === other.outlineLevel &&
            _.isEqual(this.style, other.style));
    };
    Object.defineProperty(Column.prototype, "isDefault", {
        get: function () {
            if (this.isCustomWidth) {
                return false;
            }
            if (this.hidden) {
                return false;
            }
            if (this.outlineLevel) {
                return false;
            }
            var s = this.style;
            if (s && (s.font || s.numFmt || s.alignment || s.border || s.fill || s.protection)) {
                return false;
            }
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "headerCount", {
        get: function () {
            return this.headers.length;
        },
        enumerable: false,
        configurable: true
    });
    Column.prototype.eachCell = function (options, iteratee) {
        var colNumber = this.number;
        if (!iteratee) {
            iteratee = options;
            options = null;
        }
        this._worksheet.eachRow(options, function (row, rowNumber) {
            iteratee(row.getCell(colNumber), rowNumber);
        });
    };
    Object.defineProperty(Column.prototype, "values", {
        get: function () {
            var v = [];
            this.eachCell(function (cell, rowNumber) {
                if (cell && cell.type !== Enums.ValueType.Null) {
                    v[rowNumber] = cell.value;
                }
            });
            return v;
        },
        set: function (v) {
            var _this = this;
            if (!v) {
                return;
            }
            var colNumber = this.number;
            var offset = 0;
            if (v.hasOwnProperty('0')) {
                // assume contiguous array, start at row 1
                offset = 1;
            }
            v.forEach(function (value, index) {
                _this._worksheet.getCell(index + offset, colNumber).value = value;
            });
        },
        enumerable: false,
        configurable: true
    });
    // =========================================================================
    // styles
    Column.prototype._applyStyle = function (name, value) {
        this.style[name] = value;
        this.eachCell(function (cell) {
            cell[name] = value;
        });
        return value;
    };
    Object.defineProperty(Column.prototype, "numFmt", {
        get: function () {
            return this.style.numFmt;
        },
        set: function (value) {
            this._applyStyle('numFmt', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "font", {
        get: function () {
            return this.style.font;
        },
        set: function (value) {
            this._applyStyle('font', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "alignment", {
        get: function () {
            return this.style.alignment;
        },
        set: function (value) {
            this._applyStyle('alignment', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "protection", {
        get: function () {
            return this.style.protection;
        },
        set: function (value) {
            this._applyStyle('protection', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "border", {
        get: function () {
            return this.style.border;
        },
        set: function (value) {
            this._applyStyle('border', value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Column.prototype, "fill", {
        get: function () {
            return this.style.fill;
        },
        set: function (value) {
            this._applyStyle('fill', value);
        },
        enumerable: false,
        configurable: true
    });
    // =============================================================================
    // static functions
    Column.toModel = function (columns) {
        // Convert array of Column into compressed list cols
        var cols = [];
        var col = null;
        if (columns) {
            columns.forEach(function (column, index) {
                if (column.isDefault) {
                    if (col) {
                        col = null;
                    }
                }
                else if (!col || !column.equivalentTo(col)) {
                    col = {
                        min: index + 1,
                        max: index + 1,
                        width: column.width !== undefined ? column.width : DEFAULT_COLUMN_WIDTH,
                        style: column.style,
                        isCustomWidth: column.isCustomWidth,
                        hidden: column.hidden,
                        outlineLevel: column.outlineLevel,
                        collapsed: column.collapsed,
                    };
                    cols.push(col);
                }
                else {
                    col.max = index + 1;
                }
            });
        }
        return cols.length ? cols : undefined;
    };
    Column.fromModel = function (worksheet, cols) {
        cols = cols || [];
        var columns = [];
        var count = 1;
        var index = 0;
        /**
         * sort cols by min
         * If it is not sorted, the subsequent column configuration will be overwritten
         * */
        cols = cols.sort(function (pre, next) {
            return pre.min - next.min;
        });
        while (index < cols.length) {
            var col = cols[index++];
            while (count < col.min) {
                columns.push(new Column(worksheet, count++));
            }
            while (count <= col.max) {
                columns.push(new Column(worksheet, count++, col));
            }
        }
        return columns.length ? columns : null;
    };
    return Column;
}());
module.exports = Column;
