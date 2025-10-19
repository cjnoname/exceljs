"use strict";
const TextXform = require("./text-xform");
const FontXform = require("../style/font-xform");
const BaseXform = require("../base-xform");
class RichTextXform extends BaseXform {
    constructor(model) {
        super();
        this.model = model;
    }
    get tag() {
        return 'r';
    }
    get textXform() {
        return this._textXform || (this._textXform = new TextXform());
    }
    get fontXform() {
        return this._fontXform || (this._fontXform = new FontXform(RichTextXform.FONT_OPTIONS));
    }
    render(xmlStream, model) {
        const renderModel = model || this.model;
        xmlStream.openNode('r');
        if (renderModel.font) {
            this.fontXform.render(xmlStream, renderModel.font);
        }
        this.textXform.render(xmlStream, renderModel.text);
        xmlStream.closeNode();
    }
    parseOpen(node) {
        if (this.parser) {
            this.parser.parseOpen(node);
            return true;
        }
        switch (node.name) {
            case 'r':
                this.model = {};
                return true;
            case 't':
                this.parser = this.textXform;
                this.parser.parseOpen(node);
                return true;
            case 'rPr':
                this.parser = this.fontXform;
                this.parser.parseOpen(node);
                return true;
            default:
                return false;
        }
    }
    parseText(text) {
        if (this.parser) {
            this.parser.parseText(text);
        }
    }
    parseClose(name) {
        switch (name) {
            case 'r':
                return false;
            case 't':
                this.model.text = this.parser.model;
                this.parser = undefined;
                return true;
            case 'rPr':
                this.model.font = this.parser.model;
                this.parser = undefined;
                return true;
            default:
                if (this.parser) {
                    this.parser.parseClose(name);
                }
                return true;
        }
    }
}
RichTextXform.FONT_OPTIONS = {
    tagName: 'rPr',
    fontNameTag: 'rFont',
};
module.exports = RichTextXform;
//# sourceMappingURL=rich-text-xform.js.map