"use strict";
var DataValidations = /** @class */ (function () {
    function DataValidations(model) {
        this.model = model || {};
    }
    DataValidations.prototype.add = function (address, validation) {
        return (this.model[address] = validation);
    };
    DataValidations.prototype.find = function (address) {
        return this.model[address];
    };
    DataValidations.prototype.remove = function (address) {
        this.model[address] = undefined;
    };
    return DataValidations;
}());
module.exports = DataValidations;
