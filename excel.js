"use strict";
/**
 * Copyright (c) 2014-2019 Guyon Roche
 * LICENCE: MIT - please refer to LICENSE file included with this module
 * or https://github.com/exceljs/exceljs/blob/master/LICENSE
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
if (parseInt(process.versions.node.split('.')[0], 10) < 10) {
    throw new Error('For node versions older than 10, please use the ES5 Import: https://github.com/exceljs/exceljs#es5-imports');
}
var exceljs_nodejs_1 = require("./lib/exceljs.nodejs");
Object.defineProperty(exports, "default", { enumerable: true, get: function () { return __importDefault(exceljs_nodejs_1).default; } });
//# sourceMappingURL=excel.js.map