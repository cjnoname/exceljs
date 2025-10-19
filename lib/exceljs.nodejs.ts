import Workbook = require('./doc/workbook');
import ModelContainer = require('./doc/modelcontainer');
import WorkbookWriter = require('./stream/xlsx/workbook-writer');
import WorkbookReader = require('./stream/xlsx/workbook-reader');
import Enums = require('./doc/enums');

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

export = ExcelJS;
