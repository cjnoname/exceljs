// this bundle is built without polyfill leaving apps the freedom to add their own
import Workbook = require('./doc/workbook');
import Enums = require('./doc/enums');

const ExcelJS: any = {
  Workbook,
};

// Object.assign mono-fill
Object.keys(Enums).forEach(key => {
  ExcelJS[key] = (Enums as any)[key];
});

export = ExcelJS;
