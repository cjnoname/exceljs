"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const base_xform_1 = __importDefault(require("../base-xform"));
//   <t xml:space="preserve"> is </t>
class TextXform extends base_xform_1.default {
    get tag() {
        return 't';
    }
    render(xmlStream, model) {
        xmlStream.openNode('t');
        if (/^\s|\n|\s$/.test(model)) {
            xmlStream.addAttribute('xml:space', 'preserve');
        }
        xmlStream.writeText(model);
        xmlStream.closeNode();
    }
    parseOpen(node) {
        switch (node.name) {
            case 't':
                this._text = [];
                this.model = ''; // Initialize model to empty string
                return true;
            default:
                return false;
        }
    }
    parseText(text) {
        this._text.push(text);
        // Update model immediately after receiving text
        this.model = this._text
            .join('')
            .replace(/_x([0-9A-F]{4})_/g, ($0, $1) => String.fromCharCode(parseInt($1, 16)));
    }
    parseClose() {
        return false;
    }
}
exports.default = TextXform;
//# sourceMappingURL=text-xform.js.map