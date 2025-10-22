// Core exports - shared by all environments
import Workbook from './doc/workbook.js';
import ModelContainer from './doc/modelcontainer.js';
import WorkbookWriter from './stream/xlsx/workbook-writer.js';
import WorkbookReader from './stream/xlsx/workbook-reader.js';
import Enums from './doc/enums.js';

const stream = {
  xlsx: {
    WorkbookWriter,
    WorkbookReader,
  },
};

const ExcelJS = {
  Workbook,
  ModelContainer,
  stream,
};

Object.assign(ExcelJS, Enums);

export default ExcelJS;
export { Workbook, ModelContainer, WorkbookWriter, WorkbookReader, stream };
export * from './doc/enums.js';
