"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("regenerator-runtime/runtime");
const chai_1 = require("chai");
const index_1 = __importDefault(require("../../index"));
describe('typescript', () => {
    it('can create and buffer xlsx', async () => {
        const wb = new index_1.default.Workbook();
        const ws = wb.addWorksheet('blort');
        ws.getCell('A1').value = 7;
        const buffer = await wb.xlsx.writeBuffer({
            useStyles: true,
            useSharedStrings: true,
        });
        const wb2 = new index_1.default.Workbook();
        await wb2.xlsx.load(buffer);
        const ws2 = wb2.getWorksheet('blort');
        (0, chai_1.expect)(ws2.getCell('A1').value).to.equal(7);
    });
    it('can create and stream xlsx', async () => {
        const wb = new index_1.default.Workbook();
        const ws = wb.addWorksheet('blort');
        ws.getCell('A1').value = 7;
        const wb2 = new index_1.default.Workbook();
        const stream = wb2.xlsx.createInputStream();
        await wb.xlsx.write(stream);
        stream.end();
        await new Promise((resolve, reject) => {
            stream.on('done', () => {
                const ws2 = wb2.getWorksheet('blort');
                (0, chai_1.expect)(ws2.getCell('A1').value).to.equal(7);
                resolve();
            });
            stream.on('error', reject);
        });
    });
});
//# sourceMappingURL=exceljs.spec.js.map