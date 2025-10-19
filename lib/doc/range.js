"use strict";
var colCache = require("../utils/col-cache");
// used by worksheet to calculate sheet dimensions
var Range = /** @class */ (function () {
    function Range() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this.decode(args);
    }
    Range.prototype.setTLBR = function (t, l, b, r, s) {
        if (arguments.length < 4) {
            // setTLBR(tl, br, s)
            var tl = colCache.decodeAddress(t);
            var br = colCache.decodeAddress(l);
            this.model = {
                top: Math.min(tl.row, br.row),
                left: Math.min(tl.col, br.col),
                bottom: Math.max(tl.row, br.row),
                right: Math.max(tl.col, br.col),
                sheetName: b,
            };
            this.setTLBR(tl.row, tl.col, br.row, br.col, s);
        }
        else {
            // setTLBR(t, l, b, r, s)
            this.model = {
                top: Math.min(t, b),
                left: Math.min(l, r),
                bottom: Math.max(t, b),
                right: Math.max(l, r),
                sheetName: s,
            };
        }
    };
    Range.prototype.decode = function (argv) {
        switch (argv.length) {
            case 5: // [t,l,b,r,s]
                this.setTLBR(argv[0], argv[1], argv[2], argv[3], argv[4]);
                break;
            case 4: // [t,l,b,r]
                this.setTLBR(argv[0], argv[1], argv[2], argv[3]);
                break;
            case 3: // [tl,br,s]
                this.setTLBR(argv[0], argv[1], argv[2]);
                break;
            case 2: // [tl,br]
                this.setTLBR(argv[0], argv[1]);
                break;
            case 1: {
                var value = argv[0];
                if (value instanceof Range) {
                    // copy constructor
                    this.model = {
                        top: value.model.top,
                        left: value.model.left,
                        bottom: value.model.bottom,
                        right: value.model.right,
                        sheetName: value.sheetName,
                    };
                }
                else if (value instanceof Array) {
                    // an arguments array
                    this.decode(value);
                }
                else if (value.top && value.left && value.bottom && value.right) {
                    // a model
                    this.model = {
                        top: value.top,
                        left: value.left,
                        bottom: value.bottom,
                        right: value.right,
                        sheetName: value.sheetName,
                    };
                }
                else {
                    // [sheetName!]tl:br
                    var tlbr = colCache.decodeEx(value);
                    if (tlbr.top) {
                        this.model = {
                            top: tlbr.top,
                            left: tlbr.left,
                            bottom: tlbr.bottom,
                            right: tlbr.right,
                            sheetName: tlbr.sheetName,
                        };
                    }
                    else {
                        this.model = {
                            top: tlbr.row,
                            left: tlbr.col,
                            bottom: tlbr.row,
                            right: tlbr.col,
                            sheetName: tlbr.sheetName,
                        };
                    }
                }
                break;
            }
            case 0:
                this.model = {
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                };
                break;
            default:
                throw new Error("Invalid number of arguments to _getDimensions() - ".concat(argv.length));
        }
    };
    Object.defineProperty(Range.prototype, "top", {
        get: function () {
            return this.model.top || 1;
        },
        set: function (value) {
            this.model.top = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "left", {
        get: function () {
            return this.model.left || 1;
        },
        set: function (value) {
            this.model.left = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "bottom", {
        get: function () {
            return this.model.bottom || 1;
        },
        set: function (value) {
            this.model.bottom = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "right", {
        get: function () {
            return this.model.right || 1;
        },
        set: function (value) {
            this.model.right = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "sheetName", {
        get: function () {
            return this.model.sheetName;
        },
        set: function (value) {
            this.model.sheetName = value;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "_serialisedSheetName", {
        get: function () {
            var sheetName = this.model.sheetName;
            if (sheetName) {
                if (/^[a-zA-Z0-9]*$/.test(sheetName)) {
                    return "".concat(sheetName, "!");
                }
                return "'".concat(sheetName, "'!");
            }
            return '';
        },
        enumerable: false,
        configurable: true
    });
    Range.prototype.expand = function (top, left, bottom, right) {
        if (!this.model.top || top < this.top)
            this.top = top;
        if (!this.model.left || left < this.left)
            this.left = left;
        if (!this.model.bottom || bottom > this.bottom)
            this.bottom = bottom;
        if (!this.model.right || right > this.right)
            this.right = right;
    };
    Range.prototype.expandRow = function (row) {
        if (row) {
            var dimensions = row.dimensions, number = row.number;
            if (dimensions) {
                this.expand(number, dimensions.min, number, dimensions.max);
            }
        }
    };
    Range.prototype.expandToAddress = function (addressStr) {
        var address = colCache.decodeEx(addressStr);
        this.expand(address.row, address.col, address.row, address.col);
    };
    Object.defineProperty(Range.prototype, "tl", {
        get: function () {
            return colCache.n2l(this.left) + this.top;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "$t$l", {
        get: function () {
            return "$".concat(colCache.n2l(this.left), "$").concat(this.top);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "br", {
        get: function () {
            return colCache.n2l(this.right) + this.bottom;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "$b$r", {
        get: function () {
            return "$".concat(colCache.n2l(this.right), "$").concat(this.bottom);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "range", {
        get: function () {
            return "".concat(this._serialisedSheetName + this.tl, ":").concat(this.br);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "$range", {
        get: function () {
            return "".concat(this._serialisedSheetName + this.$t$l, ":").concat(this.$b$r);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "shortRange", {
        get: function () {
            return this.count > 1 ? this.range : this._serialisedSheetName + this.tl;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "$shortRange", {
        get: function () {
            return this.count > 1 ? this.$range : this._serialisedSheetName + this.$t$l;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Range.prototype, "count", {
        get: function () {
            return (1 + this.bottom - this.top) * (1 + this.right - this.left);
        },
        enumerable: false,
        configurable: true
    });
    Range.prototype.toString = function () {
        return this.range;
    };
    Range.prototype.intersects = function (other) {
        if (other.sheetName && this.sheetName && other.sheetName !== this.sheetName)
            return false;
        if (other.bottom < this.top)
            return false;
        if (other.top > this.bottom)
            return false;
        if (other.right < this.left)
            return false;
        if (other.left > this.right)
            return false;
        return true;
    };
    Range.prototype.contains = function (addressStr) {
        var address = colCache.decodeEx(addressStr);
        return this.containsEx(address);
    };
    Range.prototype.containsEx = function (address) {
        if (address.sheetName && this.sheetName && address.sheetName !== this.sheetName)
            return false;
        return (address.row >= this.top &&
            address.row <= this.bottom &&
            address.col >= this.left &&
            address.col <= this.right);
    };
    Range.prototype.forEachAddress = function (cb) {
        for (var col = this.left; col <= this.right; col++) {
            for (var row = this.top; row <= this.bottom; row++) {
                cb(colCache.encodeAddress(row, col), row, col);
            }
        }
    };
    return Range;
}());
module.exports = Range;
