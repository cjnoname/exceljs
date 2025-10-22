'use strict';
import colCache from '../utils/col-cache.js';
class Anchor {
    constructor(worksheet, address, offset = 0) {
        this.worksheet = worksheet;
        if (!address) {
            this.nativeCol = 0;
            this.nativeColOff = 0;
            this.nativeRow = 0;
            this.nativeRowOff = 0;
        }
        else if (typeof address === 'string') {
            const decoded = colCache.decodeAddress(address);
            this.nativeCol = decoded.col + offset;
            this.nativeColOff = 0;
            this.nativeRow = decoded.row + offset;
            this.nativeRowOff = 0;
        }
        else if (address.nativeCol !== undefined) {
            const anchor = address;
            this.nativeCol = anchor.nativeCol || 0;
            this.nativeColOff = anchor.nativeColOff || 0;
            this.nativeRow = anchor.nativeRow || 0;
            this.nativeRowOff = anchor.nativeRowOff || 0;
        }
        else if (address.col !== undefined) {
            const simple = address;
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
    static asInstance(model) {
        return model instanceof Anchor || model == null ? model : new Anchor(undefined, model);
    }
    get col() {
        return this.nativeCol + (Math.min(this.colWidth - 1, this.nativeColOff) / this.colWidth);
    }
    set col(v) {
        this.nativeCol = Math.floor(v);
        this.nativeColOff = Math.floor((v - this.nativeCol) * this.colWidth);
    }
    get row() {
        return this.nativeRow + (Math.min(this.rowHeight - 1, this.nativeRowOff) / this.rowHeight);
    }
    set row(v) {
        this.nativeRow = Math.floor(v);
        this.nativeRowOff = Math.floor((v - this.nativeRow) * this.rowHeight);
    }
    get colWidth() {
        return this.worksheet &&
            this.worksheet.getColumn(this.nativeCol + 1) &&
            this.worksheet.getColumn(this.nativeCol + 1).isCustomWidth
            ? Math.floor(this.worksheet.getColumn(this.nativeCol + 1).width * 10000)
            : 640000;
    }
    get rowHeight() {
        return this.worksheet &&
            this.worksheet.getRow(this.nativeRow + 1) &&
            this.worksheet.getRow(this.nativeRow + 1).height
            ? Math.floor(this.worksheet.getRow(this.nativeRow + 1).height * 10000)
            : 180000;
    }
    get model() {
        return {
            nativeCol: this.nativeCol,
            nativeColOff: this.nativeColOff,
            nativeRow: this.nativeRow,
            nativeRowOff: this.nativeRowOff,
        };
    }
    set model(value) {
        this.nativeCol = value.nativeCol;
        this.nativeColOff = value.nativeColOff;
        this.nativeRow = value.nativeRow;
        this.nativeRowOff = value.nativeRowOff;
    }
}
export default Anchor;
//# sourceMappingURL=anchor.js.map