"use strict";
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
var addressRegex = /^[A-Z]+\d+$/;
// =========================================================================
// Column Letter to Number conversion
var colCache = {
    _dictionary: [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
    ],
    _l2nFill: 0,
    _l2n: {},
    _n2l: [],
    _level: function (n) {
        if (n <= 26) {
            return 1;
        }
        if (n <= 26 * 26) {
            return 2;
        }
        return 3;
    },
    _fill: function (level) {
        var c;
        var v;
        var l1;
        var l2;
        var l3;
        var n = 1;
        if (level >= 4) {
            throw new Error('Out of bounds. Excel supports columns from 1 to 16384');
        }
        if (this._l2nFill < 1 && level >= 1) {
            while (n <= 26) {
                c = this._dictionary[n - 1];
                this._n2l[n] = c;
                this._l2n[c] = n;
                n++;
            }
            this._l2nFill = 1;
        }
        if (this._l2nFill < 2 && level >= 2) {
            n = 27;
            while (n <= 26 + (26 * 26)) {
                v = n - (26 + 1);
                l1 = v % 26;
                l2 = Math.floor(v / 26);
                c = this._dictionary[l2] + this._dictionary[l1];
                this._n2l[n] = c;
                this._l2n[c] = n;
                n++;
            }
            this._l2nFill = 2;
        }
        if (this._l2nFill < 3 && level >= 3) {
            n = 26 + (26 * 26) + 1;
            while (n <= 16384) {
                v = n - ((26 * 26) + 26 + 1);
                l1 = v % 26;
                l2 = Math.floor(v / 26) % 26;
                l3 = Math.floor(v / (26 * 26));
                c = this._dictionary[l3] + this._dictionary[l2] + this._dictionary[l1];
                this._n2l[n] = c;
                this._l2n[c] = n;
                n++;
            }
            this._l2nFill = 3;
        }
    },
    l2n: function (l) {
        if (!this._l2n[l]) {
            this._fill(l.length);
        }
        if (!this._l2n[l]) {
            throw new Error("Out of bounds. Invalid column letter: ".concat(l));
        }
        return this._l2n[l];
    },
    n2l: function (n) {
        if (n < 1 || n > 16384) {
            throw new Error("".concat(n, " is out of bounds. Excel supports columns from 1 to 16384"));
        }
        if (!this._n2l[n]) {
            this._fill(this._level(n));
        }
        return this._n2l[n];
    },
    // =========================================================================
    // Address processing
    _hash: {},
    // check if value looks like an address
    validateAddress: function (value) {
        if (!addressRegex.test(value)) {
            throw new Error("Invalid Address: ".concat(value));
        }
        return true;
    },
    // convert address string into structure
    decodeAddress: function (value) {
        var addr = value.length < 5 && this._hash[value];
        if (addr) {
            return addr;
        }
        var hasCol = false;
        var col = '';
        var colNumber = 0;
        var hasRow = false;
        var row = '';
        var rowNumber = 0;
        for (var i = 0, char = void 0; i < value.length; i++) {
            char = value.charCodeAt(i);
            // col should before row
            if (!hasRow && char >= 65 && char <= 90) {
                // 65 = 'A'.charCodeAt(0)
                // 90 = 'Z'.charCodeAt(0)
                hasCol = true;
                col += value[i];
                // colNumber starts from 1
                colNumber = (colNumber * 26) + char - 64;
            }
            else if (char >= 48 && char <= 57) {
                // 48 = '0'.charCodeAt(0)
                // 57 = '9'.charCodeAt(0)
                hasRow = true;
                row += value[i];
                // rowNumber starts from 0
                rowNumber = (rowNumber * 10) + char - 48;
            }
            else if (hasRow && hasCol && char !== 36) {
                // 36 = '$'.charCodeAt(0)
                break;
            }
        }
        if (!hasCol) {
            colNumber = undefined;
        }
        else if (colNumber > 16384) {
            throw new Error("Out of bounds. Invalid column letter: ".concat(col));
        }
        if (!hasRow) {
            rowNumber = undefined;
        }
        // in case $row$col
        value = col + row;
        var address = {
            address: value,
            col: colNumber,
            row: rowNumber,
            $col$row: "$".concat(col, "$").concat(row),
        };
        // mem fix - cache only the tl 100x100 square
        if (colNumber <= 100 && rowNumber <= 100) {
            this._hash[value] = address;
            this._hash[address.$col$row] = address;
        }
        return address;
    },
    // convert r,c into structure (if only 1 arg, assume r is address string)
    getAddress: function (r, c) {
        if (c) {
            var address = this.n2l(c) + r;
            return this.decodeAddress(address);
        }
        return this.decodeAddress(r);
    },
    // convert [address], [tl:br] into address structures
    decode: function (value) {
        var parts = value.split(':');
        if (parts.length === 2) {
            var tl = this.decodeAddress(parts[0]);
            var br = this.decodeAddress(parts[1]);
            var result = {
                top: Math.min(tl.row, br.row),
                left: Math.min(tl.col, br.col),
                bottom: Math.max(tl.row, br.row),
                right: Math.max(tl.col, br.col),
                tl: '',
                br: '',
                dimensions: '',
            };
            // reconstruct tl, br and dimensions
            result.tl = this.n2l(result.left) + result.top;
            result.br = this.n2l(result.right) + result.bottom;
            result.dimensions = "".concat(result.tl, ":").concat(result.br);
            return result;
        }
        return this.decodeAddress(value);
    },
    // convert [sheetName!][$]col[$]row[[$]col[$]row] into address or range structures
    decodeEx: function (value) {
        var groups = value.match(/(?:(?:(?:'((?:[^']|'')*)')|([^'^ !]*))!)?(.*)/);
        var sheetName = groups[1] || groups[2]; // Qouted and unqouted groups
        var reference = groups[3]; // Remaining address
        var parts = reference.split(':');
        if (parts.length > 1) {
            var tl = this.decodeAddress(parts[0]);
            var br = this.decodeAddress(parts[1]);
            var top_1 = Math.min(tl.row, br.row);
            var left = Math.min(tl.col, br.col);
            var bottom = Math.max(tl.row, br.row);
            var right = Math.max(tl.col, br.col);
            var tlStr = this.n2l(left) + top_1;
            var brStr = this.n2l(right) + bottom;
            return {
                top: top_1,
                left: left,
                bottom: bottom,
                right: right,
                sheetName: sheetName,
                tl: { address: tlStr, col: left, row: top_1, $col$row: "$".concat(this.n2l(left), "$").concat(top_1), sheetName: sheetName },
                br: {
                    address: brStr,
                    col: right,
                    row: bottom,
                    $col$row: "$".concat(this.n2l(right), "$").concat(bottom),
                    sheetName: sheetName,
                },
                dimensions: "".concat(tlStr, ":").concat(brStr),
            };
        }
        if (reference.indexOf('#') === 0) {
            return sheetName ? { sheetName: sheetName, error: reference } : { error: reference };
        }
        var address = this.decodeAddress(reference);
        return sheetName ? __assign({ sheetName: sheetName }, address) : address;
    },
    // convert row,col into address string
    encodeAddress: function (row, col) {
        return colCache.n2l(col) + row;
    },
    // convert row,col into string address or t,l,b,r into range
    encode: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        switch (args.length) {
            case 2:
                return colCache.encodeAddress(args[0], args[1]);
            case 4:
                return "".concat(colCache.encodeAddress(args[0], args[1]), ":").concat(colCache.encodeAddress(args[2], args[3]));
            default:
                throw new Error('Can only encode with 2 or 4 arguments');
        }
    },
    // return true if address is contained within range
    inRange: function (range, address) {
        var left = range[0], top = range[1], right = range[3], bottom = range[4];
        var col = address[0], row = address[1];
        return col >= left && col <= right && row >= top && row <= bottom;
    },
};
module.exports = colCache;
