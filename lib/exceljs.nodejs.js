"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const workbook_1 = __importDefault(require("./doc/workbook"));
const modelcontainer_1 = __importDefault(require("./doc/modelcontainer"));
const workbook_writer_1 = __importDefault(require("./stream/xlsx/workbook-writer"));
const workbook_reader_1 = __importDefault(require("./stream/xlsx/workbook-reader"));
const enums_1 = __importDefault(require("./doc/enums"));
const ExcelJS = {
    Workbook: workbook_1.default,
    ModelContainer: modelcontainer_1.default,
    stream: {
        xlsx: {
            WorkbookWriter: workbook_writer_1.default,
            WorkbookReader: workbook_reader_1.default,
        },
    },
};
Object.assign(ExcelJS, enums_1.default);
exports.default = ExcelJS;
//# sourceMappingURL=exceljs.nodejs.js.map