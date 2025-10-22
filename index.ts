// Core exports - shared by all environments
import Workbook from './lib/doc/workbook.js';
import ModelContainer from './lib/doc/modelcontainer.js';
import WorkbookWriter from './lib/stream/xlsx/workbook-writer.js';
import WorkbookReader from './lib/stream/xlsx/workbook-reader.js';
import Enums from './lib/doc/enums.js';

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
export * from './lib/doc/enums.js';
