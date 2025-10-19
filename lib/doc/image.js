"use strict";
var colCache = require("../utils/col-cache");
var Anchor = require("./anchor");
var Image = /** @class */ (function () {
    function Image(worksheet, model) {
        this.worksheet = worksheet;
        if (model) {
            this.model = model;
        }
    }
    Object.defineProperty(Image.prototype, "model", {
        get: function () {
            switch (this.type) {
                case 'background':
                    return {
                        type: this.type,
                        imageId: this.imageId,
                    };
                case 'image':
                    return {
                        type: this.type,
                        imageId: this.imageId,
                        hyperlinks: this.range.hyperlinks,
                        range: {
                            tl: this.range.tl.model,
                            br: this.range.br && this.range.br.model,
                            ext: this.range.ext,
                            editAs: this.range.editAs,
                        },
                    };
                default:
                    throw new Error('Invalid Image Type');
            }
        },
        set: function (_a) {
            var type = _a.type, imageId = _a.imageId, range = _a.range, hyperlinks = _a.hyperlinks;
            this.type = type;
            this.imageId = imageId;
            if (type === 'image') {
                if (typeof range === 'string') {
                    var decoded = colCache.decode(range);
                    this.range = {
                        tl: new Anchor(this.worksheet, { col: decoded.left, row: decoded.top }, -1),
                        br: new Anchor(this.worksheet, { col: decoded.right, row: decoded.bottom }, 0),
                        editAs: 'oneCell',
                    };
                }
                else {
                    this.range = {
                        tl: new Anchor(this.worksheet, range.tl, 0),
                        br: range.br && new Anchor(this.worksheet, range.br, 0),
                        ext: range.ext,
                        editAs: range.editAs,
                        hyperlinks: hyperlinks || range.hyperlinks,
                    };
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    return Image;
}());
module.exports = Image;
