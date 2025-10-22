import BaseXform from '../base-xform.js';
import utils from '../../../utils/utils.js';
const Enums = {
    ReadingOrder: {
        LeftToRight: 1,
        RightToLeft: 2,
    },
};
const validation = {
    horizontalValues: [
        'left',
        'center',
        'right',
        'fill',
        'centerContinuous',
        'distributed',
        'justify',
    ].reduce((p, v) => {
        p[v] = true;
        return p;
    }, {}),
    horizontal(value) {
        return this.horizontalValues[value] ? value : undefined;
    },
    verticalValues: ['top', 'middle', 'bottom', 'distributed', 'justify'].reduce((p, v) => {
        p[v] = true;
        return p;
    }, {}),
    vertical(value) {
        if (value === 'middle')
            return 'center';
        return this.verticalValues[value] ? value : undefined;
    },
    wrapText(value) {
        return value ? true : undefined;
    },
    shrinkToFit(value) {
        return value ? true : undefined;
    },
    textRotation(value) {
        switch (value) {
            case 'vertical':
                return value;
            default: {
                const numValue = utils.validInt(value);
                return numValue !== undefined && numValue >= -90 && numValue <= 90 ? numValue : undefined;
            }
        }
    },
    indent(value) {
        const numValue = utils.validInt(value);
        return Math.max(0, numValue);
    },
    readingOrder(value) {
        switch (value) {
            case 'ltr':
                return Enums.ReadingOrder.LeftToRight;
            case 'rtl':
                return Enums.ReadingOrder.RightToLeft;
            default:
                return undefined;
        }
    },
};
const textRotationXform = {
    toXml(textRotation) {
        const validated = validation.textRotation(textRotation);
        if (validated) {
            if (validated === 'vertical') {
                return 255;
            }
            const tr = Math.round(validated);
            if (tr >= 0 && tr <= 90) {
                return tr;
            }
            if (tr < 0 && tr >= -90) {
                return 90 - tr;
            }
        }
        return undefined;
    },
    toModel(textRotation) {
        const tr = utils.validInt(textRotation);
        if (tr !== undefined) {
            if (tr === 255) {
                return 'vertical';
            }
            if (tr >= 0 && tr <= 90) {
                return tr;
            }
            if (tr > 90 && tr <= 180) {
                return 90 - tr;
            }
        }
        return undefined;
    },
};
// Alignment encapsulates translation from style.alignment model to/from xlsx
class AlignmentXform extends BaseXform {
    get tag() {
        return 'alignment';
    }
    render(xmlStream, model) {
        xmlStream.addRollback();
        xmlStream.openNode('alignment');
        let isValid = false;
        function add(name, value) {
            if (value) {
                xmlStream.addAttribute(name, value);
                isValid = true;
            }
        }
        add('horizontal', validation.horizontal(model.horizontal));
        add('vertical', validation.vertical(model.vertical));
        add('wrapText', validation.wrapText(model.wrapText) ? '1' : false);
        add('shrinkToFit', validation.shrinkToFit(model.shrinkToFit) ? '1' : false);
        add('indent', validation.indent(model.indent));
        add('textRotation', textRotationXform.toXml(model.textRotation));
        add('readingOrder', validation.readingOrder(model.readingOrder));
        xmlStream.closeNode();
        if (isValid) {
            xmlStream.commit();
        }
        else {
            xmlStream.rollback();
        }
    }
    parseOpen(node) {
        const model = {};
        let valid = false;
        function add(truthy, name, value) {
            if (truthy) {
                model[name] = value;
                valid = true;
            }
        }
        add(node.attributes.horizontal, 'horizontal', node.attributes.horizontal);
        add(node.attributes.vertical, 'vertical', node.attributes.vertical === 'center' ? 'middle' : node.attributes.vertical);
        add(node.attributes.wrapText, 'wrapText', utils.parseBoolean(node.attributes.wrapText));
        add(node.attributes.shrinkToFit, 'shrinkToFit', utils.parseBoolean(node.attributes.shrinkToFit));
        add(node.attributes.indent, 'indent', parseInt(node.attributes.indent, 10));
        add(node.attributes.textRotation, 'textRotation', textRotationXform.toModel(node.attributes.textRotation));
        add(node.attributes.readingOrder, 'readingOrder', node.attributes.readingOrder === '2' ? 'rtl' : 'ltr');
        this.model = valid ? model : null;
    }
    parseText() { }
    parseClose() {
        return false;
    }
}
export default AlignmentXform;
//# sourceMappingURL=alignment-xform.js.map