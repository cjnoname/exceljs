import Workbook from './doc/workbook';
import ModelContainer from './doc/modelcontainer';
import WorkbookWriter from './stream/xlsx/workbook-writer';
import WorkbookReader from './stream/xlsx/workbook-reader';
import Enums from './doc/enums';

const ExcelJS = {
  Workbook,
  ModelContainer,
  stream: {
    xlsx: {
      WorkbookWriter,
      WorkbookReader,
    },
  },
};

Object.assign(ExcelJS, Enums);

export default ExcelJS;
