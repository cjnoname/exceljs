// this bundle is built without polyfill leaving apps the freedom to add their own
import Workbook from './doc/workbook';
import Enums from './doc/enums';

const ExcelJS: any = {
  Workbook,
};

// Object.assign mono-fill
Object.keys(Enums).forEach(key => {
  ExcelJS[key] = (Enums as any)[key];
});

export = ExcelJS;
