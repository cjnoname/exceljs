"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _ = require('../utils/under-dash');
var colCache = require("../utils/col-cache");
var Range = require("./range");
var Row = require("./row");
var Column = require("./column");
var Enums = require("./enums");
var Image = require("./image");
var Table = require("./table");
var DataValidations = require("./data-validations");
var Encryptor = require("../utils/encryptor");
var makePivotTable = require('./pivot-table').makePivotTable;
var copyStyle = require('../utils/copy-style').copyStyle;
// Worksheet requirements
//  Operate as sheet inside workbook or standalone
//  Load and Save from file and stream
//  Access/Add/Delete individual cells
//  Manage column widths and row heights
var Worksheet = /** @class */ (function () {
    function Worksheet(options) {
        options = options || {};
        this._workbook = options.workbook;
        // in a workbook, each sheet will have a number
        this.id = options.id || 0;
        this.orderNo = options.orderNo || 0;
        // and a name
        this._name = options.name || "sheet".concat(this.id);
        // add a state
        this.state = options.state || 'visible';
        // rows allows access organised by row. Sparse array of arrays indexed by row-1, col
        // Note: _rows is zero based. Must subtract 1 to go from cell.row to index
        this._rows = [];
        // column definitions
        this._columns = null;
        // column keys (addRow convenience): key ==> this._collumns index
        this._keys = {};
        // keep record of all merges
        this._merges = {};
        // record of all row and column pageBreaks
        this.rowBreaks = [];
        // for tabColor, default row height, outline levels, etc
        this.properties = Object.assign({}, {
            defaultRowHeight: 15,
            dyDescent: 55,
            outlineLevelCol: 0,
            outlineLevelRow: 0,
        }, options.properties);
        // for all things printing
        this.pageSetup = Object.assign({}, {
            margins: { left: 0.7, right: 0.7, top: 0.75, bottom: 0.75, header: 0.3, footer: 0.3 },
            orientation: 'portrait',
            horizontalDpi: 4294967295,
            verticalDpi: 4294967295,
            fitToPage: !!(options.pageSetup &&
                (options.pageSetup.fitToWidth || options.pageSetup.fitToHeight) &&
                !options.pageSetup.scale),
            pageOrder: 'downThenOver',
            blackAndWhite: false,
            draft: false,
            cellComments: 'None',
            errors: 'displayed',
            scale: 100,
            fitToWidth: 1,
            fitToHeight: 1,
            paperSize: undefined,
            showRowColHeaders: false,
            showGridLines: false,
            firstPageNumber: undefined,
            horizontalCentered: false,
            verticalCentered: false,
            rowBreaks: null,
            colBreaks: null,
        }, options.pageSetup);
        this.headerFooter = Object.assign({}, {
            differentFirst: false,
            differentOddEven: false,
            oddHeader: null,
            oddFooter: null,
            evenHeader: null,
            evenFooter: null,
            firstHeader: null,
            firstFooter: null,
        }, options.headerFooter);
        this.dataValidations = new DataValidations();
        // for freezepanes, split, zoom, gridlines, etc
        this.views = options.views || [];
        this.autoFilter = options.autoFilter || null;
        // for images, etc
        this._media = [];
        // worksheet protection
        this.sheetProtection = null;
        // for tables
        this.tables = {};
        this.pivotTables = [];
        this.conditionalFormattings = [];
    }
    Object.defineProperty(Worksheet.prototype, "name", {
        get: function () {
            return this._name;
        },
        set: function (name) {
            if (name === undefined) {
                name = "sheet".concat(this.id);
            }
            if (this._name === name)
                return;
            if (typeof name !== 'string') {
                throw new Error('The name has to be a string.');
            }
            if (name === '') {
                throw new Error('The name can\'t be empty.');
            }
            if (name === 'History') {
                throw new Error('The name "History" is protected. Please use a different name.');
            }
            // Illegal character in worksheet name: asterisk (*), question mark (?),
            // colon (:), forward slash (/ \), or bracket ([])
            if (/[*?:/\\[\]]/.test(name)) {
                throw new Error("Worksheet name ".concat(name, " cannot include any of the following characters: * ? : \\ / [ ]"));
            }
            if (/(^')|('$)/.test(name)) {
                throw new Error("The first or last character of worksheet name cannot be a single quotation mark: ".concat(name));
            }
            if (name && name.length > 31) {
                // eslint-disable-next-line no-console
                console.warn("Worksheet name ".concat(name, " exceeds 31 chars. This will be truncated"));
                name = name.substring(0, 31);
            }
            if (this._workbook._worksheets.find(function (ws) { return ws && ws.name.toLowerCase() === name.toLowerCase(); })) {
                throw new Error("Worksheet name already exists: ".concat(name));
            }
            this._name = name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Worksheet.prototype, "workbook", {
        get: function () {
            return this._workbook;
        },
        enumerable: false,
        configurable: true
    });
    // when you're done with this worksheet, call this to remove from workbook
    Worksheet.prototype.destroy = function () {
        this._workbook.removeWorksheetEx(this);
    };
    Object.defineProperty(Worksheet.prototype, "dimensions", {
        // Get the bounding range of the cells in this worksheet
        get: function () {
            var dimensions = new Range();
            this._rows.forEach(function (row) {
                if (row) {
                    var rowDims = row.dimensions;
                    if (rowDims) {
                        dimensions.expand(row.number, rowDims.min, row.number, rowDims.max);
                    }
                }
            });
            return dimensions;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Worksheet.prototype, "columns", {
        // =========================================================================
        // Columns
        // get the current columns array.
        get: function () {
            return this._columns;
        },
        // set the columns from an array of column definitions.
        // Note: any headers defined will overwrite existing values.
        set: function (value) {
            var _this = this;
            // calculate max header row count
            this._headerRowCount = value.reduce(function (pv, cv) {
                var headerCount = (cv.header && 1) || (cv.headers && cv.headers.length) || 0;
                return Math.max(pv, headerCount);
            }, 0);
            // construct Column objects
            var count = 1;
            var columns = (this._columns = []);
            value.forEach(function (defn) {
                var column = new Column(_this, count++, false);
                columns.push(column);
                column.defn = defn;
            });
        },
        enumerable: false,
        configurable: true
    });
    Worksheet.prototype.getColumnKey = function (key) {
        return this._keys[key];
    };
    Worksheet.prototype.setColumnKey = function (key, value) {
        this._keys[key] = value;
    };
    Worksheet.prototype.deleteColumnKey = function (key) {
        delete this._keys[key];
    };
    Worksheet.prototype.eachColumnKey = function (f) {
        _.each(this._keys, f);
    };
    // get a single column by col number. If it doesn't exist, create it and any gaps before it
    Worksheet.prototype.getColumn = function (c) {
        var colNum;
        if (typeof c === 'string') {
            // if it matches a key'd column, return that
            var col = this._keys[c];
            if (col)
                return col;
            // otherwise, assume letter
            colNum = colCache.l2n(c);
        }
        else {
            colNum = c;
        }
        if (!this._columns) {
            this._columns = [];
        }
        if (colNum > this._columns.length) {
            var n = this._columns.length + 1;
            while (n <= colNum) {
                this._columns.push(new Column(this, n++));
            }
        }
        return this._columns[colNum - 1];
    };
    Worksheet.prototype.spliceColumns = function (start, count) {
        var inserts = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            inserts[_i - 2] = arguments[_i];
        }
        var rows = this._rows;
        var nRows = rows.length;
        if (inserts.length > 0) {
            var _loop_1 = function (i) {
                var rowArguments = [start, count];
                // eslint-disable-next-line no-loop-func
                inserts.forEach(function (insert) {
                    rowArguments.push(insert[i] || null);
                });
                var row = this_1.getRow(i + 1);
                // eslint-disable-next-line prefer-spread
                row.splice.apply(row, rowArguments);
            };
            var this_1 = this;
            // must iterate over all rows whether they exist yet or not
            for (var i = 0; i < nRows; i++) {
                _loop_1(i);
            }
        }
        else {
            // nothing to insert, so just splice all rows
            this._rows.forEach(function (r) {
                if (r) {
                    r.splice(start, count);
                }
            });
        }
        // splice column definitions
        var nExpand = inserts.length - count;
        var nKeep = start + count;
        var nEnd = this._columns ? this._columns.length : 0;
        if (nExpand < 0) {
            for (var i = start + inserts.length; i <= nEnd; i++) {
                this.getColumn(i).defn = this.getColumn(i - nExpand).defn;
            }
        }
        else if (nExpand > 0) {
            for (var i = nEnd; i >= nKeep; i--) {
                this.getColumn(i + nExpand).defn = this.getColumn(i).defn;
            }
        }
        for (var i = start; i < start + inserts.length; i++) {
            this.getColumn(i).defn = null;
        }
        // account for defined names
        this.workbook.definedNames.spliceColumns(this.name, start, count, inserts.length);
    };
    Object.defineProperty(Worksheet.prototype, "lastColumn", {
        get: function () {
            return this.getColumn(this.columnCount);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Worksheet.prototype, "columnCount", {
        get: function () {
            var maxCount = 0;
            this.eachRow(function (row) {
                maxCount = Math.max(maxCount, row.cellCount);
            });
            return maxCount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Worksheet.prototype, "actualColumnCount", {
        get: function () {
            // performance nightmare - for each row, counts all the columns used
            var counts = [];
            var count = 0;
            this.eachRow(function (row) {
                row.eachCell(function (_a) {
                    var col = _a.col;
                    if (!counts[col]) {
                        counts[col] = true;
                        count++;
                    }
                });
            });
            return count;
        },
        enumerable: false,
        configurable: true
    });
    // =========================================================================
    // Rows
    Worksheet.prototype._commitRow = function () {
        // nop - allows streaming reader to fill a document
    };
    Object.defineProperty(Worksheet.prototype, "_lastRowNumber", {
        get: function () {
            // need to cope with results of splice
            var rows = this._rows;
            var n = rows.length;
            while (n > 0 && rows[n - 1] === undefined) {
                n--;
            }
            return n;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Worksheet.prototype, "_nextRow", {
        get: function () {
            return this._lastRowNumber + 1;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Worksheet.prototype, "lastRow", {
        get: function () {
            if (this._rows.length) {
                return this._rows[this._rows.length - 1];
            }
            return undefined;
        },
        enumerable: false,
        configurable: true
    });
    // find a row (if exists) by row number
    Worksheet.prototype.findRow = function (r) {
        return this._rows[r - 1];
    };
    // find multiple rows (if exists) by row number
    Worksheet.prototype.findRows = function (start, length) {
        return this._rows.slice(start - 1, start - 1 + length);
    };
    Object.defineProperty(Worksheet.prototype, "rowCount", {
        get: function () {
            return this._lastRowNumber;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Worksheet.prototype, "actualRowCount", {
        get: function () {
            // counts actual rows that have actual data
            var count = 0;
            this.eachRow(function () {
                count++;
            });
            return count;
        },
        enumerable: false,
        configurable: true
    });
    // get a row by row number.
    Worksheet.prototype.getRow = function (r) {
        var row = this._rows[r - 1];
        if (!row) {
            row = this._rows[r - 1] = new Row(this, r);
        }
        return row;
    };
    // get multiple rows by row number.
    Worksheet.prototype.getRows = function (start, length) {
        if (length < 1)
            return undefined;
        var rows = [];
        for (var i = start; i < start + length; i++) {
            rows.push(this.getRow(i));
        }
        return rows;
    };
    Worksheet.prototype.addRow = function (value, style) {
        if (style === void 0) { style = 'n'; }
        var rowNo = this._nextRow;
        var row = this.getRow(rowNo);
        row.values = value;
        this._setStyleOption(rowNo, style[0] === 'i' ? style : 'n');
        return row;
    };
    Worksheet.prototype.addRows = function (value, style) {
        var _this = this;
        if (style === void 0) { style = 'n'; }
        var rows = [];
        value.forEach(function (row) {
            rows.push(_this.addRow(row, style));
        });
        return rows;
    };
    Worksheet.prototype.insertRow = function (pos, value, style) {
        if (style === void 0) { style = 'n'; }
        this.spliceRows(pos, 0, value);
        this._setStyleOption(pos, style);
        return this.getRow(pos);
    };
    Worksheet.prototype.insertRows = function (pos, values, style) {
        if (style === void 0) { style = 'n'; }
        this.spliceRows.apply(this, __spreadArray([pos, 0], values, false));
        if (style !== 'n') {
            // copy over the styles
            for (var i = 0; i < values.length; i++) {
                if (style[0] === 'o' && this.findRow(values.length + pos + i) !== undefined) {
                    this._copyStyle(values.length + pos + i, pos + i, style[1] === '+');
                }
                else if (style[0] === 'i' && this.findRow(pos - 1) !== undefined) {
                    this._copyStyle(pos - 1, pos + i, style[1] === '+');
                }
            }
        }
        return this.getRows(pos, values.length);
    };
    // set row at position to same style as of either pervious row (option 'i') or next row (option 'o')
    Worksheet.prototype._setStyleOption = function (pos, style) {
        if (style === void 0) { style = 'n'; }
        if (style[0] === 'o' && this.findRow(pos + 1) !== undefined) {
            this._copyStyle(pos + 1, pos, style[1] === '+');
        }
        else if (style[0] === 'i' && this.findRow(pos - 1) !== undefined) {
            this._copyStyle(pos - 1, pos, style[1] === '+');
        }
    };
    Worksheet.prototype._copyStyle = function (src, dest, styleEmpty) {
        if (styleEmpty === void 0) { styleEmpty = false; }
        var rSrc = this.getRow(src);
        var rDst = this.getRow(dest);
        rDst.style = copyStyle(rSrc.style);
        // eslint-disable-next-line no-loop-func
        rSrc.eachCell({ includeEmpty: styleEmpty }, function (cell, colNumber) {
            rDst.getCell(colNumber).style = copyStyle(cell.style);
        });
        rDst.height = rSrc.height;
    };
    Worksheet.prototype.duplicateRow = function (rowNum, count, insert) {
        // create count duplicates of rowNum
        // either inserting new or overwriting existing rows
        if (insert === void 0) { insert = false; }
        var rSrc = this._rows[rowNum - 1];
        var inserts = Array.from({ length: count }).fill(rSrc.values);
        this.spliceRows.apply(this, __spreadArray([rowNum + 1, insert ? 0 : count], inserts, false));
        var _loop_2 = function (i) {
            var rDst = this_2._rows[rowNum + i];
            rDst.style = rSrc.style;
            rDst.height = rSrc.height;
            // eslint-disable-next-line no-loop-func
            rSrc.eachCell({ includeEmpty: true }, function (cell, colNumber) {
                rDst.getCell(colNumber).style = cell.style;
            });
        };
        var this_2 = this;
        // now copy styles...
        for (var i = 0; i < count; i++) {
            _loop_2(i);
        }
    };
    Worksheet.prototype.spliceRows = function (start, count) {
        var _this = this;
        var inserts = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            inserts[_i - 2] = arguments[_i];
        }
        // same problem as row.splice, except worse.
        var nKeep = start + count;
        var nInserts = inserts.length;
        var nExpand = nInserts - count;
        var nEnd = this._rows.length;
        var i;
        var rSrc;
        if (nExpand < 0) {
            // remove rows
            if (start === nEnd) {
                this._rows[nEnd - 1] = undefined;
            }
            var _loop_3 = function () {
                rSrc = this_3._rows[i - 1];
                if (rSrc) {
                    var rDst_1 = this_3.getRow(i + nExpand);
                    rDst_1.values = rSrc.values;
                    rDst_1.style = rSrc.style;
                    rDst_1.height = rSrc.height;
                    // eslint-disable-next-line no-loop-func
                    rSrc.eachCell({ includeEmpty: true }, function (cell, colNumber) {
                        rDst_1.getCell(colNumber).style = cell.style;
                    });
                    this_3._rows[i - 1] = undefined;
                }
                else {
                    this_3._rows[i + nExpand - 1] = undefined;
                }
            };
            var this_3 = this;
            for (i = nKeep; i <= nEnd; i++) {
                _loop_3();
            }
        }
        else if (nExpand > 0) {
            var _loop_4 = function () {
                rSrc = this_4._rows[i - 1];
                if (rSrc) {
                    var rDst_2 = this_4.getRow(i + nExpand);
                    rDst_2.values = rSrc.values;
                    rDst_2.style = rSrc.style;
                    rDst_2.height = rSrc.height;
                    // eslint-disable-next-line no-loop-func
                    rSrc.eachCell({ includeEmpty: true }, function (cell, colNumber) {
                        rDst_2.getCell(colNumber).style = cell.style;
                        // remerge cells accounting for insert offset
                        if (cell._value.constructor.name === 'MergeValue') {
                            var cellToBeMerged = _this.getRow(cell._row._number + nInserts).getCell(colNumber);
                            var prevMaster = cell._value._master;
                            var newMaster = _this.getRow(prevMaster._row._number + nInserts).getCell(prevMaster._column._number);
                            cellToBeMerged.merge(newMaster);
                        }
                    });
                }
                else {
                    this_4._rows[i + nExpand - 1] = undefined;
                }
            };
            var this_4 = this;
            // insert new cells
            for (i = nEnd; i >= nKeep; i--) {
                _loop_4();
            }
        }
        // now copy over the new values
        for (i = 0; i < nInserts; i++) {
            var rDst = this.getRow(start + i);
            rDst.style = {};
            rDst.values = inserts[i];
        }
        // account for defined names
        this.workbook.definedNames.spliceRows(this.name, start, count, nInserts);
    };
    Worksheet.prototype.eachRow = function (options, iteratee) {
        if (!iteratee) {
            iteratee = options;
            options = undefined;
        }
        if (options && options.includeEmpty) {
            var n = this._rows.length;
            for (var i = 1; i <= n; i++) {
                iteratee(this.getRow(i), i);
            }
        }
        else {
            this._rows.forEach(function (row) {
                if (row && row.hasValues) {
                    iteratee(row, row.number);
                }
            });
        }
    };
    // return all rows as sparse array
    Worksheet.prototype.getSheetValues = function () {
        var rows = [];
        this._rows.forEach(function (row) {
            if (row) {
                rows[row.number] = row.values;
            }
        });
        return rows;
    };
    // =========================================================================
    // Cells
    // returns the cell at [r,c] or address given by r. If not found, return undefined
    Worksheet.prototype.findCell = function (r, c) {
        var address = colCache.getAddress(r, c);
        var row = this._rows[address.row - 1];
        return row ? row.findCell(address.col) : undefined;
    };
    // return the cell at [r,c] or address given by r. If not found, create a new one.
    Worksheet.prototype.getCell = function (r, c) {
        var address = colCache.getAddress(r, c);
        var row = this.getRow(address.row);
        return row.getCellEx(address);
    };
    // =========================================================================
    // Merge
    // convert the range defined by ['tl:br'], [tl,br] or [t,l,b,r] into a single 'merged' cell
    Worksheet.prototype.mergeCells = function () {
        var cells = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            cells[_i] = arguments[_i];
        }
        var dimensions = new Range(cells);
        this._mergeCellsInternal(dimensions);
    };
    Worksheet.prototype.mergeCellsWithoutStyle = function () {
        var cells = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            cells[_i] = arguments[_i];
        }
        var dimensions = new Range(cells);
        this._mergeCellsInternal(dimensions, true);
    };
    Worksheet.prototype._mergeCellsInternal = function (dimensions, ignoreStyle) {
        // check cells aren't already merged
        _.each(this._merges, function (merge) {
            if (merge.intersects(dimensions)) {
                throw new Error('Cannot merge already merged cells');
            }
        });
        // apply merge
        var master = this.getCell(dimensions.top, dimensions.left);
        for (var i = dimensions.top; i <= dimensions.bottom; i++) {
            for (var j = dimensions.left; j <= dimensions.right; j++) {
                // merge all but the master cell
                if (i > dimensions.top || j > dimensions.left) {
                    this.getCell(i, j).merge(master, ignoreStyle);
                }
            }
        }
        // index merge
        this._merges[master.address] = dimensions;
    };
    Worksheet.prototype._unMergeMaster = function (master) {
        // master is always top left of a rectangle
        var merge = this._merges[master.address];
        if (merge) {
            for (var i = merge.top; i <= merge.bottom; i++) {
                for (var j = merge.left; j <= merge.right; j++) {
                    this.getCell(i, j).unmerge();
                }
            }
            delete this._merges[master.address];
        }
    };
    Object.defineProperty(Worksheet.prototype, "hasMerges", {
        get: function () {
            // return true if this._merges has a merge object
            return _.some(this._merges, Boolean);
        },
        enumerable: false,
        configurable: true
    });
    // scan the range defined by ['tl:br'], [tl,br] or [t,l,b,r] and if any cell is part of a merge,
    // un-merge the group. Note this function can affect multiple merges and merge-blocks are
    // atomic - either they're all merged or all un-merged.
    Worksheet.prototype.unMergeCells = function () {
        var cells = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            cells[_i] = arguments[_i];
        }
        var dimensions = new Range(cells);
        // find any cells in that range and unmerge them
        for (var i = dimensions.top; i <= dimensions.bottom; i++) {
            for (var j = dimensions.left; j <= dimensions.right; j++) {
                var cell = this.findCell(i, j);
                if (cell) {
                    if (cell.type === Enums.ValueType.Merge) {
                        // this cell merges to another master
                        this._unMergeMaster(cell.master);
                    }
                    else if (this._merges[cell.address]) {
                        // this cell is a master
                        this._unMergeMaster(cell);
                    }
                }
            }
        }
    };
    // ===========================================================================
    // Shared/Array Formula
    Worksheet.prototype.fillFormula = function (range, formula, results, shareType) {
        if (shareType === void 0) { shareType = 'shared'; }
        // Define formula for top-left cell and share to rest
        var decoded = colCache.decode(range);
        var top = decoded.top, left = decoded.left, bottom = decoded.bottom, right = decoded.right;
        var width = right - left + 1;
        var masterAddress = colCache.encodeAddress(top, left);
        var isShared = shareType === 'shared';
        // work out result accessor
        var getResult;
        if (typeof results === 'function') {
            getResult = results;
        }
        else if (Array.isArray(results)) {
            if (Array.isArray(results[0])) {
                getResult = function (row, col) { return results[row - top][col - left]; };
            }
            else {
                // eslint-disable-next-line no-mixed-operators
                getResult = function (row, col) { return results[(row - top) * width + (col - left)]; };
            }
        }
        else {
            getResult = function () { return undefined; };
        }
        var first = true;
        for (var r = top; r <= bottom; r++) {
            for (var c = left; c <= right; c++) {
                if (first) {
                    this.getCell(r, c).value = {
                        shareType: shareType,
                        formula: formula,
                        ref: range,
                        result: getResult(r, c),
                    };
                    first = false;
                }
                else {
                    this.getCell(r, c).value = isShared
                        ? {
                            sharedFormula: masterAddress,
                            result: getResult(r, c),
                        }
                        : getResult(r, c);
                }
            }
        }
    };
    // =========================================================================
    // Images
    Worksheet.prototype.addImage = function (imageId, range) {
        var model = {
            type: 'image',
            imageId: String(imageId),
            range: range,
        };
        this._media.push(new Image(this, model));
    };
    Worksheet.prototype.getImages = function () {
        return this._media.filter(function (m) { return m.type === 'image'; });
    };
    Worksheet.prototype.addBackgroundImage = function (imageId) {
        var model = {
            type: 'background',
            imageId: String(imageId),
        };
        this._media.push(new Image(this, model));
    };
    Worksheet.prototype.getBackgroundImageId = function () {
        var image = this._media.find(function (m) { return m.type === 'background'; });
        return image && image.imageId;
    };
    // =========================================================================
    // Worksheet Protection
    Worksheet.prototype.protect = function (password, options) {
        var _this = this;
        // TODO: make this function truly async
        // perhaps marshal to worker thread or something
        return new Promise(function (resolve) {
            _this.sheetProtection = {
                sheet: true,
            };
            if (options && 'spinCount' in options) {
                // force spinCount to be integer >= 0
                options.spinCount = Number.isFinite(options.spinCount) ? Math.round(Math.max(0, options.spinCount)) : 100000;
            }
            if (password) {
                _this.sheetProtection.algorithmName = 'SHA-512';
                _this.sheetProtection.saltValue = Encryptor.randomBytes(16).toString('base64');
                _this.sheetProtection.spinCount = options && 'spinCount' in options ? options.spinCount : 100000; // allow user specified spinCount
                _this.sheetProtection.hashValue = Encryptor.convertPasswordToHash(password, 'SHA512', _this.sheetProtection.saltValue, _this.sheetProtection.spinCount);
            }
            if (options) {
                _this.sheetProtection = Object.assign(_this.sheetProtection, options);
                if (!password && 'spinCount' in options) {
                    delete _this.sheetProtection.spinCount;
                }
            }
            resolve();
        });
    };
    Worksheet.prototype.unprotect = function () {
        this.sheetProtection = null;
    };
    // =========================================================================
    // Tables
    Worksheet.prototype.addTable = function (model) {
        var table = new Table(this, model);
        this.tables[model.name] = table;
        return table;
    };
    Worksheet.prototype.getTable = function (name) {
        return this.tables[name];
    };
    Worksheet.prototype.removeTable = function (name) {
        delete this.tables[name];
    };
    Worksheet.prototype.getTables = function () {
        return Object.values(this.tables);
    };
    // =========================================================================
    // Pivot Tables
    Worksheet.prototype.addPivotTable = function (model) {
        // eslint-disable-next-line no-console
        console.warn("Warning: Pivot Table support is experimental. \nPlease leave feedback at https://github.com/exceljs/exceljs/discussions/2575");
        var pivotTable = makePivotTable(this, model);
        this.pivotTables.push(pivotTable);
        this.workbook.pivotTables.push(pivotTable);
        return pivotTable;
    };
    // ===========================================================================
    // Conditional Formatting
    Worksheet.prototype.addConditionalFormatting = function (cf) {
        this.conditionalFormattings.push(cf);
    };
    Worksheet.prototype.removeConditionalFormatting = function (filter) {
        if (typeof filter === 'number') {
            this.conditionalFormattings.splice(filter, 1);
        }
        else if (filter instanceof Function) {
            this.conditionalFormattings = this.conditionalFormattings.filter(filter);
        }
        else {
            this.conditionalFormattings = [];
        }
    };
    Object.defineProperty(Worksheet.prototype, "tabColor", {
        // ===========================================================================
        // Deprecated
        get: function () {
            // eslint-disable-next-line no-console
            console.trace('worksheet.tabColor property is now deprecated. Please use worksheet.properties.tabColor');
            return this.properties.tabColor;
        },
        set: function (value) {
            // eslint-disable-next-line no-console
            console.trace('worksheet.tabColor property is now deprecated. Please use worksheet.properties.tabColor');
            this.properties.tabColor = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Worksheet.prototype, "model", {
        // ===========================================================================
        // Model
        get: function () {
            var model = {
                id: this.id,
                name: this.name,
                dataValidations: this.dataValidations.model,
                properties: this.properties,
                state: this.state,
                pageSetup: this.pageSetup,
                headerFooter: this.headerFooter,
                rowBreaks: this.rowBreaks,
                views: this.views,
                autoFilter: this.autoFilter,
                media: this._media.map(function (medium) { return medium.model; }),
                sheetProtection: this.sheetProtection,
                tables: Object.values(this.tables).map(function (table) { return table.model; }),
                pivotTables: this.pivotTables,
                conditionalFormattings: this.conditionalFormattings,
            };
            // =================================================
            // columns
            model.cols = Column.toModel(this.columns);
            // ==========================================================
            // Rows
            var rows = (model.rows = []);
            var dimensions = (model.dimensions = new Range());
            this._rows.forEach(function (row) {
                var rowModel = row && row.model;
                if (rowModel) {
                    dimensions.expand(rowModel.number, rowModel.min, rowModel.number, rowModel.max);
                    rows.push(rowModel);
                }
            });
            // ==========================================================
            // Merges
            model.merges = [];
            _.each(this._merges, function (merge) {
                model.merges.push(merge.range);
            });
            return model;
        },
        set: function (value) {
            var _this = this;
            this.name = value.name;
            this._columns = Column.fromModel(this, value.cols);
            this._parseRows(value);
            this._parseMergeCells(value);
            this.dataValidations = new DataValidations(value.dataValidations);
            this.properties = value.properties;
            this.pageSetup = value.pageSetup;
            this.headerFooter = value.headerFooter;
            this.views = value.views;
            this.autoFilter = value.autoFilter;
            this._media = value.media.map(function (medium) { return new Image(_this, medium); });
            this.sheetProtection = value.sheetProtection;
            this.tables = value.tables.reduce(function (tables, table) {
                var t = new Table(_this, table);
                t.model = table;
                tables[table.name] = t;
                return tables;
            }, {});
            this.pivotTables = value.pivotTables;
            this.conditionalFormattings = value.conditionalFormattings;
        },
        enumerable: false,
        configurable: true
    });
    Worksheet.prototype._parseRows = function (model) {
        var _this = this;
        this._rows = [];
        if (model.rows) {
            model.rows.forEach(function (rowModel) {
                var row = new Row(_this, rowModel.number);
                _this._rows[row.number - 1] = row;
                row.model = rowModel;
            });
        }
    };
    Worksheet.prototype._parseMergeCells = function (model) {
        var _this = this;
        if (model.mergeCells) {
            _.each(model.mergeCells, function (merge) {
                // Do not merge styles when importing an Excel file
                // since each cell may have different styles intentionally.
                _this.mergeCellsWithoutStyle(merge);
            });
        }
    };
    return Worksheet;
}());
module.exports = Worksheet;
