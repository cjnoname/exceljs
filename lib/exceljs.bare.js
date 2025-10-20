"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// this bundle is built without polyfill leaving apps the freedom to add their own
const workbook_1 = __importDefault(require("./doc/workbook"));
const enums_1 = __importDefault(require("./doc/enums"));
const ExcelJS = {
    Workbook: workbook_1.default,
};
// Object.assign mono-fill
Object.keys(enums_1.default).forEach(key => {
    ExcelJS[key] = enums_1.default[key];
});
exports.default = ExcelJS;
//# sourceMappingURL=exceljs.bare.js.map