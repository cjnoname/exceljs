"use strict";
// this bundle is built without polyfill leaving apps the freedom to add their own
const Workbook = require("./doc/workbook");
const Enums = require("./doc/enums");
const ExcelJS = {
    Workbook,
};
// Object.assign mono-fill
Object.keys(Enums).forEach(key => {
    ExcelJS[key] = Enums[key];
});
module.exports = ExcelJS;
//# sourceMappingURL=exceljs.bare.js.map