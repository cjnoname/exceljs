// this bundle is built without polyfill leaving apps the freedom to add their own
import Workbook from './doc/workbook.js';
import Enums from './doc/enums.js';

const ExcelJS = {
  Workbook,
};

// Object.assign mono-fill
Object.keys(Enums).forEach(key => {
  ExcelJS[key] = Enums[key];
});

export default ExcelJS;

export { Workbook };
export * from './doc/enums.js';
