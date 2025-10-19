'use strict';
var colCache = require("../utils/col-cache");
var Anchor = /** @class */ (function () {
    function Anchor(worksheet, address, offset) {
        if (offset === void 0) { offset = 0; }
        this.worksheet = worksheet;
        if (!address) {
            this.nativeCol = 0;
            this.nativeColOff = 0;
            this.nativeRow = 0;
            this.nativeRowOff = 0;
        }
        else if (typeof address === 'string') {
            var decoded = colCache.decodeAddress(address);
            this.nativeCol = decoded.col + offset;
            this.nativeColOff = 0;
            this.nativeRow = decoded.row + offset;
            this.nativeRowOff = 0;
        }
        else if (address.nativeCol !== undefined) {
            var anchor = address;
            this.nativeCol = anchor.nativeCol || 0;
            this.nativeColOff = anchor.nativeColOff || 0;
            this.nativeRow = anchor.nativeRow || 0;
            this.nativeRowOff = anchor.nativeRowOff || 0;
        }
        else if (address.col !== undefined) {
            var simple = address;
            this.col = simple.col + offset;
            this.row = simple.row + offset;
        }
        else {
            this.nativeCol = 0;
            this.nativeColOff = 0;
            this.nativeRow = 0;
            this.nativeRowOff = 0;
        }
    }
    Anchor.asInstance = function (model) {
        return model instanceof Anchor || model == null ? model : new Anchor(undefined, model);
    };
    Object.defineProperty(Anchor.prototype, "col", {
        get: function () {
            return this.nativeCol + (Math.min(this.colWidth - 1, this.nativeColOff) / this.colWidth);
        },
        set: function (v) {
            this.nativeCol = Math.floor(v);
            this.nativeColOff = Math.floor((v - this.nativeCol) * this.colWidth);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Anchor.prototype, "row", {
        get: function () {
            return this.nativeRow + (Math.min(this.rowHeight - 1, this.nativeRowOff) / this.rowHeight);
        },
        set: function (v) {
            this.nativeRow = Math.floor(v);
            this.nativeRowOff = Math.floor((v - this.nativeRow) * this.rowHeight);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Anchor.prototype, "colWidth", {
        get: function () {
            return this.worksheet &&
                this.worksheet.getColumn(this.nativeCol + 1) &&
                this.worksheet.getColumn(this.nativeCol + 1).isCustomWidth
                ? Math.floor(this.worksheet.getColumn(this.nativeCol + 1).width * 10000)
                : 640000;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Anchor.prototype, "rowHeight", {
        get: function () {
            return this.worksheet &&
                this.worksheet.getRow(this.nativeRow + 1) &&
                this.worksheet.getRow(this.nativeRow + 1).height
                ? Math.floor(this.worksheet.getRow(this.nativeRow + 1).height * 10000)
                : 180000;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Anchor.prototype, "model", {
        get: function () {
            return {
                nativeCol: this.nativeCol,
                nativeColOff: this.nativeColOff,
                nativeRow: this.nativeRow,
                nativeRowOff: this.nativeRowOff,
            };
        },
        set: function (value) {
            this.nativeCol = value.nativeCol;
            this.nativeColOff = value.nativeColOff;
            this.nativeRow = value.nativeRow;
            this.nativeRowOff = value.nativeRowOff;
        },
        enumerable: false,
        configurable: true
    });
    return Anchor;
}());
module.exports = Anchor;
