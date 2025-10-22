import BaseXform from '../base-xform.js';
class FilterXform extends BaseXform {
    constructor() {
        super();
        this.model = { val: '' };
    }
    get tag() {
        return 'filter';
    }
    render(xmlStream, model) {
        xmlStream.leafNode(this.tag, {
            val: model.val,
        });
    }
    parseOpen(node) {
        if (node.name === this.tag) {
            this.model = {
                val: node.attributes.val,
            };
            return true;
        }
        return false;
    }
    parseText() { }
    parseClose() {
        return false;
    }
}
export default FilterXform;
//# sourceMappingURL=filter-xform.js.map