/* eslint-disable import/no-extraneous-dependencies,node/no-unpublished-require */
// ES2020+ browsers support all these features natively:
// - Promise, async/await
// - Object.assign, Object.keys, Object.values
// - Array methods: find, findIndex, includes, iterator
// - String methods: includes, fromCodePoint
// - Symbol, Symbol.asyncIterator
// - Number.isNaN
import Workbook from './doc/workbook.js';
import Enums from './doc/enums.js';
const ExcelJS = {
    Workbook,
};
Object.keys(Enums).forEach(key => {
    ExcelJS[key] = Enums[key];
});
export default ExcelJS;
export { Workbook };
export * from './doc/enums.js';
//# sourceMappingURL=exceljs.browser.js.map