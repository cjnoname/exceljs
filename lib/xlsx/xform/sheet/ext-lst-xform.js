/* eslint-disable max-classes-per-file */
import CompositeXform from '../composite-xform.js';
import ConditionalFormattingsExt from './cf-ext/conditional-formattings-ext-xform.js';
class ExtXform extends CompositeXform {
    constructor() {
        super();
        this.map = {
            'x14:conditionalFormattings': (this.conditionalFormattings = new ConditionalFormattingsExt()),
        };
    }
    get tag() {
        return 'ext';
    }
    hasContent(model) {
        return this.conditionalFormattings.hasContent(model.conditionalFormattings);
    }
    prepare(model) {
        this.conditionalFormattings.prepare(model.conditionalFormattings);
    }
    render(xmlStream, model) {
        xmlStream.openNode('ext', {
            uri: '{78C0D931-6437-407d-A8EE-F0AAD7539E65}',
            'xmlns:x14': 'http://schemas.microsoft.com/office/spreadsheetml/2009/9/main',
        });
        this.conditionalFormattings.render(xmlStream, model.conditionalFormattings);
        xmlStream.closeNode();
    }
    createNewModel() {
        return {};
    }
    onParserClose(name, parser) {
        this.model[name] = parser.model;
    }
}
class ExtLstXform extends CompositeXform {
    constructor() {
        super();
        this.map = {
            ext: (this.ext = new ExtXform()),
        };
    }
    get tag() {
        return 'extLst';
    }
    prepare(model, _options) {
        this.ext.prepare(model);
    }
    hasContent(model) {
        return this.ext.hasContent(model);
    }
    render(xmlStream, model) {
        if (!this.hasContent(model)) {
            return;
        }
        xmlStream.openNode('extLst');
        this.ext.render(xmlStream, model);
        xmlStream.closeNode();
    }
    createNewModel() {
        return {};
    }
    onParserClose(name, parser) {
        this.model[name] = parser.model;
    }
}
export default ExtLstXform;
//# sourceMappingURL=ext-lst-xform.js.map