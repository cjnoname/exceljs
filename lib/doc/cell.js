"use strict";
/* eslint-disable max-classes-per-file */
var colCache = require("../utils/col-cache");
var Enums = require("./enums");
var Note = require("./note");
var _ = require('../utils/under-dash');
var slideFormula = require('../utils/shared-formula').slideFormula;
// Cell requirements
//  Operate inside a worksheet
//  Store and retrieve a value with a range of types: text, number, date, hyperlink, reference, formula, etc.
//  Manage/use and manipulate cell format either as local to cell or inherited from column or row.
var Cell = /** @class */ (function () {
    function Cell(row, column, address) {
        if (!row || !column) {
            throw new Error('A Cell needs a Row');
        }
        this._row = row;
        this._column = column;
        colCache.validateAddress(address);
        this._address = address;
        // TODO: lazy evaluation of this._value
        this._value = Value.create(Cell.Types.Null, this);
        this.style = this._mergeStyle(row.style, column.style, {});
        this._mergeCount = 0;
    }
    Object.defineProperty(Cell.prototype, "worksheet", {
        get: function () {
            return this._row.worksheet;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "workbook", {
        get: function () {
            return this._row.worksheet.workbook;
        },
        enumerable: false,
        configurable: true
    });
    // help GC by removing cyclic (and other) references
    Cell.prototype.destroy = function () {
        delete this.style;
        delete this._value;
        delete this._row;
        delete this._column;
        delete this._address;
    };
    Object.defineProperty(Cell.prototype, "numFmt", {
        // =========================================================================
        // Styles stuff
        get: function () {
            return this.style.numFmt;
        },
        set: function (value) {
            this.style.numFmt = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "font", {
        get: function () {
            return this.style.font;
        },
        set: function (value) {
            this.style.font = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "alignment", {
        get: function () {
            return this.style.alignment;
        },
        set: function (value) {
            this.style.alignment = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "border", {
        get: function () {
            return this.style.border;
        },
        set: function (value) {
            this.style.border = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "fill", {
        get: function () {
            return this.style.fill;
        },
        set: function (value) {
            this.style.fill = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "protection", {
        get: function () {
            return this.style.protection;
        },
        set: function (value) {
            this.style.protection = value;
        },
        enumerable: false,
        configurable: true
    });
    Cell.prototype._mergeStyle = function (rowStyle, colStyle, style) {
        var numFmt = (rowStyle && rowStyle.numFmt) || (colStyle && colStyle.numFmt);
        if (numFmt)
            style.numFmt = numFmt;
        var font = (rowStyle && rowStyle.font) || (colStyle && colStyle.font);
        if (font)
            style.font = font;
        var alignment = (rowStyle && rowStyle.alignment) || (colStyle && colStyle.alignment);
        if (alignment)
            style.alignment = alignment;
        var border = (rowStyle && rowStyle.border) || (colStyle && colStyle.border);
        if (border)
            style.border = border;
        var fill = (rowStyle && rowStyle.fill) || (colStyle && colStyle.fill);
        if (fill)
            style.fill = fill;
        var protection = (rowStyle && rowStyle.protection) || (colStyle && colStyle.protection);
        if (protection)
            style.protection = protection;
        return style;
    };
    Object.defineProperty(Cell.prototype, "address", {
        // =========================================================================
        // return the address for this cell
        get: function () {
            return this._address;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "row", {
        get: function () {
            return this._row.number;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "col", {
        get: function () {
            return this._column.number;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "$col$row", {
        get: function () {
            return "$".concat(this._column.letter, "$").concat(this.row);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "type", {
        // =========================================================================
        // Value stuff
        get: function () {
            return this._value.type;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "effectiveType", {
        get: function () {
            return this._value.effectiveType;
        },
        enumerable: false,
        configurable: true
    });
    Cell.prototype.toCsvString = function () {
        return this._value.toCsvString();
    };
    // =========================================================================
    // Merge stuff
    Cell.prototype.addMergeRef = function () {
        this._mergeCount++;
    };
    Cell.prototype.releaseMergeRef = function () {
        this._mergeCount--;
    };
    Object.defineProperty(Cell.prototype, "isMerged", {
        get: function () {
            return this._mergeCount > 0 || this.type === Cell.Types.Merge;
        },
        enumerable: false,
        configurable: true
    });
    Cell.prototype.merge = function (master, ignoreStyle) {
        this._value.release();
        this._value = Value.create(Cell.Types.Merge, this, master);
        if (!ignoreStyle) {
            this.style = master.style;
        }
    };
    Cell.prototype.unmerge = function () {
        if (this.type === Cell.Types.Merge) {
            this._value.release();
            this._value = Value.create(Cell.Types.Null, this);
            this.style = this._mergeStyle(this._row.style, this._column.style, {});
        }
    };
    Cell.prototype.isMergedTo = function (master) {
        if (this._value.type !== Cell.Types.Merge)
            return false;
        return this._value.isMergedTo(master);
    };
    Object.defineProperty(Cell.prototype, "master", {
        get: function () {
            if (this.type === Cell.Types.Merge) {
                return this._value.master;
            }
            return this; // an unmerged cell is its own master
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "isHyperlink", {
        get: function () {
            return this._value.type === Cell.Types.Hyperlink;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "hyperlink", {
        get: function () {
            return this._value.hyperlink;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "value", {
        // return the value
        get: function () {
            return this._value.value;
        },
        // set the value - can be number, string or raw
        set: function (v) {
            // special case - merge cells set their master's value
            if (this.type === Cell.Types.Merge) {
                this._value.master.value = v;
                return;
            }
            this._value.release();
            // assign value
            this._value = Value.create(Value.getType(v), this, v);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "note", {
        get: function () {
            return this._comment && this._comment.note;
        },
        set: function (note) {
            this._comment = new Note(note);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "text", {
        get: function () {
            return this._value.toString();
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "html", {
        get: function () {
            return _.escapeHtml(this.text);
        },
        enumerable: false,
        configurable: true
    });
    Cell.prototype.toString = function () {
        return this.text;
    };
    Cell.prototype._upgradeToHyperlink = function (hyperlink) {
        // if this cell is a string, turn it into a Hyperlink
        if (this.type === Cell.Types.String) {
            this._value = Value.create(Cell.Types.Hyperlink, this, {
                text: this._value.value,
                hyperlink: hyperlink,
            });
        }
    };
    Object.defineProperty(Cell.prototype, "formula", {
        // =========================================================================
        // Formula stuff
        get: function () {
            return this._value.formula;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "result", {
        get: function () {
            return this._value.result;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "formulaType", {
        get: function () {
            return this._value.formulaType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "fullAddress", {
        // =========================================================================
        // Name stuff
        get: function () {
            var worksheet = this._row.worksheet;
            return {
                sheetName: worksheet.name,
                address: this.address,
                row: this.row,
                col: this.col,
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "name", {
        get: function () {
            return this.names[0];
        },
        set: function (value) {
            this.names = [value];
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "names", {
        get: function () {
            return this.workbook.definedNames.getNamesEx(this.fullAddress);
        },
        set: function (value) {
            var _this = this;
            var definedNames = this.workbook.definedNames;
            definedNames.removeAllNames(this.fullAddress);
            value.forEach(function (name) {
                definedNames.addEx(_this.fullAddress, name);
            });
        },
        enumerable: false,
        configurable: true
    });
    Cell.prototype.addName = function (name) {
        this.workbook.definedNames.addEx(this.fullAddress, name);
    };
    Cell.prototype.removeName = function (name) {
        this.workbook.definedNames.removeEx(this.fullAddress, name);
    };
    Cell.prototype.removeAllNames = function () {
        this.workbook.definedNames.removeAllNames(this.fullAddress);
    };
    Object.defineProperty(Cell.prototype, "_dataValidations", {
        // =========================================================================
        // Data Validation stuff
        get: function () {
            return this.worksheet.dataValidations;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "dataValidation", {
        get: function () {
            return this._dataValidations.find(this.address);
        },
        set: function (value) {
            this._dataValidations.add(this.address, value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Cell.prototype, "model", {
        // =========================================================================
        // Model stuff
        get: function () {
            var model = this._value.model;
            model.style = this.style;
            if (this._comment) {
                model.comment = this._comment.model;
            }
            return model;
        },
        set: function (value) {
            this._value.release();
            this._value = Value.create(value.type, this);
            this._value.model = value;
            if (value.comment) {
                switch (value.comment.type) {
                    case 'note':
                        this._comment = Note.fromModel(value.comment);
                        break;
                }
            }
            if (value.style) {
                this.style = value.style;
            }
            else {
                this.style = {};
            }
        },
        enumerable: false,
        configurable: true
    });
    Cell.Types = Enums.ValueType;
    return Cell;
}());
// =============================================================================
// Internal Value Types
var NullValue = /** @class */ (function () {
    function NullValue(cell) {
        this.model = {
            address: cell.address,
            type: Cell.Types.Null,
        };
    }
    Object.defineProperty(NullValue.prototype, "value", {
        get: function () {
            return null;
        },
        set: function (_value) {
            // nothing to do
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NullValue.prototype, "type", {
        get: function () {
            return Cell.Types.Null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NullValue.prototype, "effectiveType", {
        get: function () {
            return Cell.Types.Null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NullValue.prototype, "address", {
        get: function () {
            return this.model.address;
        },
        set: function (value) {
            this.model.address = value;
        },
        enumerable: false,
        configurable: true
    });
    NullValue.prototype.toCsvString = function () {
        return '';
    };
    NullValue.prototype.release = function () { };
    NullValue.prototype.toString = function () {
        return '';
    };
    return NullValue;
}());
var NumberValue = /** @class */ (function () {
    function NumberValue(cell, value) {
        this.model = {
            address: cell.address,
            type: Cell.Types.Number,
            value: value,
        };
    }
    Object.defineProperty(NumberValue.prototype, "value", {
        get: function () {
            return this.model.value;
        },
        set: function (value) {
            this.model.value = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NumberValue.prototype, "type", {
        get: function () {
            return Cell.Types.Number;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NumberValue.prototype, "effectiveType", {
        get: function () {
            return Cell.Types.Number;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(NumberValue.prototype, "address", {
        get: function () {
            return this.model.address;
        },
        set: function (value) {
            this.model.address = value;
        },
        enumerable: false,
        configurable: true
    });
    NumberValue.prototype.toCsvString = function () {
        return this.model.value.toString();
    };
    NumberValue.prototype.release = function () { };
    NumberValue.prototype.toString = function () {
        return this.model.value.toString();
    };
    return NumberValue;
}());
var StringValue = /** @class */ (function () {
    function StringValue(cell, value) {
        this.model = {
            address: cell.address,
            type: Cell.Types.String,
            value: value,
        };
    }
    Object.defineProperty(StringValue.prototype, "value", {
        get: function () {
            return this.model.value;
        },
        set: function (value) {
            this.model.value = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StringValue.prototype, "type", {
        get: function () {
            return Cell.Types.String;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StringValue.prototype, "effectiveType", {
        get: function () {
            return Cell.Types.String;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(StringValue.prototype, "address", {
        get: function () {
            return this.model.address;
        },
        set: function (value) {
            this.model.address = value;
        },
        enumerable: false,
        configurable: true
    });
    StringValue.prototype.toCsvString = function () {
        return "\"".concat(this.model.value.replace(/"/g, '""'), "\"");
    };
    StringValue.prototype.release = function () { };
    StringValue.prototype.toString = function () {
        return this.model.value;
    };
    return StringValue;
}());
var RichTextValue = /** @class */ (function () {
    function RichTextValue(cell, value) {
        this.model = {
            address: cell.address,
            type: Cell.Types.String,
            value: value,
        };
    }
    Object.defineProperty(RichTextValue.prototype, "value", {
        get: function () {
            return this.model.value;
        },
        set: function (value) {
            this.model.value = value;
        },
        enumerable: false,
        configurable: true
    });
    RichTextValue.prototype.toString = function () {
        return this.model.value.richText.map(function (t) { return t.text; }).join('');
    };
    Object.defineProperty(RichTextValue.prototype, "type", {
        get: function () {
            return Cell.Types.RichText;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RichTextValue.prototype, "effectiveType", {
        get: function () {
            return Cell.Types.RichText;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RichTextValue.prototype, "address", {
        get: function () {
            return this.model.address;
        },
        set: function (value) {
            this.model.address = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RichTextValue.prototype, "text", {
        get: function () {
            return this.toString();
        },
        enumerable: false,
        configurable: true
    });
    RichTextValue.prototype.toCsvString = function () {
        return "\"".concat(this.text.replace(/"/g, '""'), "\"");
    };
    RichTextValue.prototype.release = function () { };
    return RichTextValue;
}());
var DateValue = /** @class */ (function () {
    function DateValue(cell, value) {
        this.model = {
            address: cell.address,
            type: Cell.Types.Date,
            value: value,
        };
    }
    Object.defineProperty(DateValue.prototype, "value", {
        get: function () {
            return this.model.value;
        },
        set: function (value) {
            this.model.value = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DateValue.prototype, "type", {
        get: function () {
            return Cell.Types.Date;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DateValue.prototype, "effectiveType", {
        get: function () {
            return Cell.Types.Date;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(DateValue.prototype, "address", {
        get: function () {
            return this.model.address;
        },
        set: function (value) {
            this.model.address = value;
        },
        enumerable: false,
        configurable: true
    });
    DateValue.prototype.toCsvString = function () {
        return this.model.value.toISOString();
    };
    DateValue.prototype.release = function () { };
    DateValue.prototype.toString = function () {
        return this.model.value.toString();
    };
    return DateValue;
}());
var HyperlinkValue = /** @class */ (function () {
    function HyperlinkValue(cell, value) {
        this.model = {
            address: cell.address,
            type: Cell.Types.Hyperlink,
            text: value ? value.text : undefined,
            hyperlink: value ? value.hyperlink : undefined,
        };
        if (value && value.tooltip) {
            this.model.tooltip = value.tooltip;
        }
    }
    Object.defineProperty(HyperlinkValue.prototype, "value", {
        get: function () {
            var v = {
                text: this.model.text,
                hyperlink: this.model.hyperlink,
            };
            if (this.model.tooltip) {
                v.tooltip = this.model.tooltip;
            }
            return v;
        },
        set: function (value) {
            this.model.text = value.text;
            this.model.hyperlink = value.hyperlink;
            if (value.tooltip) {
                this.model.tooltip = value.tooltip;
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HyperlinkValue.prototype, "text", {
        get: function () {
            return this.model.text;
        },
        set: function (value) {
            this.model.text = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HyperlinkValue.prototype, "hyperlink", {
        get: function () {
            return this.model.hyperlink;
        },
        set: function (value) {
            this.model.hyperlink = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HyperlinkValue.prototype, "type", {
        get: function () {
            return Cell.Types.Hyperlink;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HyperlinkValue.prototype, "effectiveType", {
        get: function () {
            return Cell.Types.Hyperlink;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(HyperlinkValue.prototype, "address", {
        get: function () {
            return this.model.address;
        },
        set: function (value) {
            this.model.address = value;
        },
        enumerable: false,
        configurable: true
    });
    HyperlinkValue.prototype.toCsvString = function () {
        return this.model.hyperlink || '';
    };
    HyperlinkValue.prototype.release = function () { };
    HyperlinkValue.prototype.toString = function () {
        return this.model.text || '';
    };
    return HyperlinkValue;
}());
var MergeValue = /** @class */ (function () {
    function MergeValue(cell, master) {
        this.model = {
            address: cell.address,
            type: Cell.Types.Merge,
            master: master ? master.address : undefined,
        };
        this._master = master;
        if (master) {
            master.addMergeRef();
        }
    }
    Object.defineProperty(MergeValue.prototype, "value", {
        get: function () {
            return this._master.value;
        },
        set: function (value) {
            if (value instanceof Cell) {
                if (this._master) {
                    this._master.releaseMergeRef();
                }
                value.addMergeRef();
                this._master = value;
            }
            else {
                this._master.value = value;
            }
        },
        enumerable: false,
        configurable: true
    });
    MergeValue.prototype.isMergedTo = function (master) {
        return master === this._master;
    };
    Object.defineProperty(MergeValue.prototype, "master", {
        get: function () {
            return this._master;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MergeValue.prototype, "type", {
        get: function () {
            return Cell.Types.Merge;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MergeValue.prototype, "effectiveType", {
        get: function () {
            return this._master.effectiveType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(MergeValue.prototype, "address", {
        get: function () {
            return this.model.address;
        },
        set: function (value) {
            this.model.address = value;
        },
        enumerable: false,
        configurable: true
    });
    MergeValue.prototype.toCsvString = function () {
        return '';
    };
    MergeValue.prototype.release = function () {
        this._master.releaseMergeRef();
    };
    MergeValue.prototype.toString = function () {
        return this.value.toString();
    };
    return MergeValue;
}());
var FormulaValue = /** @class */ (function () {
    function FormulaValue(cell, value) {
        this.cell = cell;
        this.model = {
            address: cell.address,
            type: Cell.Types.Formula,
            shareType: value ? value.shareType : undefined,
            ref: value ? value.ref : undefined,
            formula: value ? value.formula : undefined,
            sharedFormula: value ? value.sharedFormula : undefined,
            result: value ? value.result : undefined,
        };
    }
    FormulaValue.prototype._copyModel = function (model) {
        var copy = {};
        var cp = function (name) {
            var value = model[name];
            if (value) {
                copy[name] = value;
            }
        };
        cp('formula');
        cp('result');
        cp('ref');
        cp('shareType');
        cp('sharedFormula');
        return copy;
    };
    Object.defineProperty(FormulaValue.prototype, "value", {
        get: function () {
            return this._copyModel(this.model);
        },
        set: function (value) {
            this.model = this._copyModel(value);
        },
        enumerable: false,
        configurable: true
    });
    FormulaValue.prototype.validate = function (value) {
        switch (Value.getType(value)) {
            case Cell.Types.Null:
            case Cell.Types.String:
            case Cell.Types.Number:
            case Cell.Types.Date:
                break;
            case Cell.Types.Hyperlink:
            case Cell.Types.Formula:
            default:
                throw new Error('Cannot process that type of result value');
        }
    };
    Object.defineProperty(FormulaValue.prototype, "dependencies", {
        get: function () {
            // find all the ranges and cells mentioned in the formula
            var ranges = this.formula.match(/([a-zA-Z0-9]+!)?[A-Z]{1,3}\d{1,4}:[A-Z]{1,3}\d{1,4}/g);
            var cells = this.formula
                .replace(/([a-zA-Z0-9]+!)?[A-Z]{1,3}\d{1,4}:[A-Z]{1,3}\d{1,4}/g, '')
                .match(/([a-zA-Z0-9]+!)?[A-Z]{1,3}\d{1,4}/g);
            return {
                ranges: ranges,
                cells: cells,
            };
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FormulaValue.prototype, "formula", {
        get: function () {
            return this.model.formula || this._getTranslatedFormula() || '';
        },
        set: function (value) {
            this.model.formula = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FormulaValue.prototype, "formulaType", {
        get: function () {
            if (this.model.formula) {
                return Enums.FormulaType.Master;
            }
            if (this.model.sharedFormula) {
                return Enums.FormulaType.Shared;
            }
            return Enums.FormulaType.None;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FormulaValue.prototype, "result", {
        get: function () {
            return this.model.result;
        },
        set: function (value) {
            this.model.result = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FormulaValue.prototype, "type", {
        get: function () {
            return Cell.Types.Formula;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FormulaValue.prototype, "effectiveType", {
        get: function () {
            var v = this.model.result;
            if (v === null || v === undefined) {
                return Enums.ValueType.Null;
            }
            if (v instanceof String || typeof v === 'string') {
                return Enums.ValueType.String;
            }
            if (typeof v === 'number') {
                return Enums.ValueType.Number;
            }
            if (v instanceof Date) {
                return Enums.ValueType.Date;
            }
            if (v.text && v.hyperlink) {
                return Enums.ValueType.Hyperlink;
            }
            if (v.formula) {
                return Enums.ValueType.Formula;
            }
            return Enums.ValueType.Null;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(FormulaValue.prototype, "address", {
        get: function () {
            return this.model.address;
        },
        set: function (value) {
            this.model.address = value;
        },
        enumerable: false,
        configurable: true
    });
    FormulaValue.prototype._getTranslatedFormula = function () {
        if (!this._translatedFormula && this.model.sharedFormula) {
            var worksheet = this.cell.worksheet;
            var master = worksheet.findCell(this.model.sharedFormula);
            this._translatedFormula =
                master && slideFormula(master.formula, master.address, this.model.address);
        }
        return this._translatedFormula;
    };
    FormulaValue.prototype.toCsvString = function () {
        return "".concat(this.model.result || '');
    };
    FormulaValue.prototype.release = function () { };
    FormulaValue.prototype.toString = function () {
        return this.model.result ? this.model.result.toString() : '';
    };
    return FormulaValue;
}());
var SharedStringValue = /** @class */ (function () {
    function SharedStringValue(cell, value) {
        this.model = {
            address: cell.address,
            type: Cell.Types.SharedString,
            value: value,
        };
    }
    Object.defineProperty(SharedStringValue.prototype, "value", {
        get: function () {
            return this.model.value;
        },
        set: function (value) {
            this.model.value = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SharedStringValue.prototype, "type", {
        get: function () {
            return Cell.Types.SharedString;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SharedStringValue.prototype, "effectiveType", {
        get: function () {
            return Cell.Types.SharedString;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(SharedStringValue.prototype, "address", {
        get: function () {
            return this.model.address;
        },
        set: function (value) {
            this.model.address = value;
        },
        enumerable: false,
        configurable: true
    });
    SharedStringValue.prototype.toCsvString = function () {
        return this.model.value.toString();
    };
    SharedStringValue.prototype.release = function () { };
    SharedStringValue.prototype.toString = function () {
        return this.model.value.toString();
    };
    return SharedStringValue;
}());
var BooleanValue = /** @class */ (function () {
    function BooleanValue(cell, value) {
        this.model = {
            address: cell.address,
            type: Cell.Types.Boolean,
            value: value,
        };
    }
    Object.defineProperty(BooleanValue.prototype, "value", {
        get: function () {
            return this.model.value;
        },
        set: function (value) {
            this.model.value = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BooleanValue.prototype, "type", {
        get: function () {
            return Cell.Types.Boolean;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BooleanValue.prototype, "effectiveType", {
        get: function () {
            return Cell.Types.Boolean;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BooleanValue.prototype, "address", {
        get: function () {
            return this.model.address;
        },
        set: function (value) {
            this.model.address = value;
        },
        enumerable: false,
        configurable: true
    });
    BooleanValue.prototype.toCsvString = function () {
        return this.model.value ? 1 : 0;
    };
    BooleanValue.prototype.release = function () { };
    BooleanValue.prototype.toString = function () {
        return this.model.value.toString();
    };
    return BooleanValue;
}());
var ErrorValue = /** @class */ (function () {
    function ErrorValue(cell, value) {
        this.model = {
            address: cell.address,
            type: Cell.Types.Error,
            value: value,
        };
    }
    Object.defineProperty(ErrorValue.prototype, "value", {
        get: function () {
            return this.model.value;
        },
        set: function (value) {
            this.model.value = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorValue.prototype, "type", {
        get: function () {
            return Cell.Types.Error;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorValue.prototype, "effectiveType", {
        get: function () {
            return Cell.Types.Error;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ErrorValue.prototype, "address", {
        get: function () {
            return this.model.address;
        },
        set: function (value) {
            this.model.address = value;
        },
        enumerable: false,
        configurable: true
    });
    ErrorValue.prototype.toCsvString = function () {
        return this.toString();
    };
    ErrorValue.prototype.release = function () { };
    ErrorValue.prototype.toString = function () {
        return this.model.value.error.toString();
    };
    return ErrorValue;
}());
var JSONValue = /** @class */ (function () {
    function JSONValue(cell, value) {
        this.model = {
            address: cell.address,
            type: Cell.Types.String,
            value: JSON.stringify(value),
            rawValue: value,
        };
    }
    Object.defineProperty(JSONValue.prototype, "value", {
        get: function () {
            return this.model.rawValue;
        },
        set: function (value) {
            this.model.rawValue = value;
            this.model.value = JSON.stringify(value);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(JSONValue.prototype, "type", {
        get: function () {
            return Cell.Types.String;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(JSONValue.prototype, "effectiveType", {
        get: function () {
            return Cell.Types.String;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(JSONValue.prototype, "address", {
        get: function () {
            return this.model.address;
        },
        set: function (value) {
            this.model.address = value;
        },
        enumerable: false,
        configurable: true
    });
    JSONValue.prototype.toCsvString = function () {
        return this.model.value;
    };
    JSONValue.prototype.release = function () { };
    JSONValue.prototype.toString = function () {
        return this.model.value;
    };
    return JSONValue;
}());
// Value is a place to hold common static Value type functions
var Value = {
    getType: function (value) {
        if (value === null || value === undefined) {
            return Cell.Types.Null;
        }
        if (value instanceof String || typeof value === 'string') {
            return Cell.Types.String;
        }
        if (typeof value === 'number') {
            return Cell.Types.Number;
        }
        if (typeof value === 'boolean') {
            return Cell.Types.Boolean;
        }
        if (value instanceof Date) {
            return Cell.Types.Date;
        }
        if (value.text && value.hyperlink) {
            return Cell.Types.Hyperlink;
        }
        if (value.formula || value.sharedFormula) {
            return Cell.Types.Formula;
        }
        if (value.richText) {
            return Cell.Types.RichText;
        }
        if (value.sharedString) {
            return Cell.Types.SharedString;
        }
        if (value.error) {
            return Cell.Types.Error;
        }
        return Cell.Types.JSON;
    },
    // map valueType to constructor
    types: [
        { t: Cell.Types.Null, f: NullValue },
        { t: Cell.Types.Number, f: NumberValue },
        { t: Cell.Types.String, f: StringValue },
        { t: Cell.Types.Date, f: DateValue },
        { t: Cell.Types.Hyperlink, f: HyperlinkValue },
        { t: Cell.Types.Formula, f: FormulaValue },
        { t: Cell.Types.Merge, f: MergeValue },
        { t: Cell.Types.JSON, f: JSONValue },
        { t: Cell.Types.SharedString, f: SharedStringValue },
        { t: Cell.Types.RichText, f: RichTextValue },
        { t: Cell.Types.Boolean, f: BooleanValue },
        { t: Cell.Types.Error, f: ErrorValue },
    ].reduce(function (p, t) {
        p[t.t] = t.f;
        return p;
    }, []),
    create: function (type, cell, value) {
        var T = this.types[type];
        if (!T) {
            throw new Error("Could not create Value of type ".concat(type));
        }
        return new T(cell, value);
    },
};
module.exports = Cell;
