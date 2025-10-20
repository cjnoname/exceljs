"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const index_js_1 = __importDefault(require("../../index.js"));
(0, vitest_1.describe)('typescript', () => {
    (0, vitest_1.it)('can create and buffer xlsx', async () => {
        const wb = new index_js_1.default.Workbook();
        const ws = wb.addWorksheet('blort');
        ws.getCell('A1').value = 7;
        const buffer = await wb.xlsx.writeBuffer({
            useStyles: true,
            useSharedStrings: true,
        });
        const wb2 = new index_js_1.default.Workbook();
        await wb2.xlsx.load(buffer);
        const ws2 = wb2.getWorksheet('blort');
        (0, vitest_1.expect)(ws2.getCell('A1').value).toBe(7);
    });
});
//# sourceMappingURL=exceljs.vitest.spec.js.map