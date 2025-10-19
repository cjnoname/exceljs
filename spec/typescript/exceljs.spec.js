"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("regenerator-runtime/runtime");
const chai_1 = require("chai");
const index_1 = __importDefault(require("../../index"));
describe('typescript', () => {
    it('can create and buffer xlsx', () => __awaiter(void 0, void 0, void 0, function* () {
        const wb = new index_1.default.Workbook();
        const ws = wb.addWorksheet('blort');
        ws.getCell('A1').value = 7;
        const buffer = yield wb.xlsx.writeBuffer({
            useStyles: true,
            useSharedStrings: true,
        });
        const wb2 = new index_1.default.Workbook();
        yield wb2.xlsx.load(buffer);
        const ws2 = wb2.getWorksheet('blort');
        (0, chai_1.expect)(ws2.getCell('A1').value).to.equal(7);
    }));
    it('can create and stream xlsx', () => __awaiter(void 0, void 0, void 0, function* () {
        const wb = new index_1.default.Workbook();
        const ws = wb.addWorksheet('blort');
        ws.getCell('A1').value = 7;
        const wb2 = new index_1.default.Workbook();
        const stream = wb2.xlsx.createInputStream();
        yield wb.xlsx.write(stream);
        stream.end();
        yield new Promise((resolve, reject) => {
            stream.on('done', () => {
                const ws2 = wb2.getWorksheet('blort');
                (0, chai_1.expect)(ws2.getCell('A1').value).to.equal(7);
                resolve();
            });
            stream.on('error', reject);
        });
    }));
});
//# sourceMappingURL=exceljs.spec.js.map