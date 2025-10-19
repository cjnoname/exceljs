"use strict";
const RichTextXform = require("../strings/rich-text-xform");
const BaseXform = require("../base-xform");
class CommentXform extends BaseXform {
    constructor(model) {
        super();
        this.model = model || { type: 'note', note: { texts: [] }, ref: '' };
    }
    get tag() {
        return 'r';
    }
    get richTextXform() {
        if (!this._richTextXform) {
            this._richTextXform = new RichTextXform();
        }
        return this._richTextXform;
    }
    render(xmlStream, model) {
        const renderModel = model || this.model;
        xmlStream.openNode('comment', {
            ref: renderModel.ref,
            authorId: 0,
        });
        xmlStream.openNode('text');
        if (renderModel && renderModel.note && renderModel.note.texts) {
            renderModel.note.texts.forEach(text => {
                this.richTextXform.render(xmlStream, text);
            });
        }
        xmlStream.closeNode();
        xmlStream.closeNode();
    }
    parseOpen(node) {
        if (this.parser) {
            this.parser.parseOpen(node);
            return true;
        }
        switch (node.name) {
            case 'comment':
                this.model = Object.assign({ type: 'note', note: {
                        texts: [],
                    } }, node.attributes);
                return true;
            case 'r':
                this.parser = this.richTextXform;
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
            case 'comment':
                return false;
            case 'r':
                this.model.note.texts.push(this.parser.model);
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
module.exports = CommentXform;
//# sourceMappingURL=comment-xform.js.map