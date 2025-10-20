"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DataValidations {
    constructor(model) {
        this.model = model || {};
    }
    add(address, validation) {
        return (this.model[address] = validation);
    }
    find(address) {
        return this.model[address];
    }
    remove(address) {
        this.model[address] = undefined;
    }
}
exports.default = DataValidations;
//# sourceMappingURL=data-validations.js.map