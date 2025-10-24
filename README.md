# ExcelTS

[![Build Status](https://github.com/cjnoname/exceljs/actions/workflows/tests.yml/badge.svg?branch=master&event=push)](https://github.com/cjnoname/exceljs/actions/workflows/tests.yml)

Modern TypeScript Excel Workbook Manager - Read, manipulate and write spreadsheet data and styles to XLSX and JSON.

## About This Project

ExcelTS is a modernized fork of [ExcelJS](https://github.com/exceljs/exceljs) with:

- ✅ **Full TypeScript Support** - Complete type definitions and modern TypeScript patterns
- ✅ **Updated Dependencies** - All dependencies upgraded to latest stable versions
- ✅ **Modern Build System** - Using Rolldown for faster builds
- ✅ **Enhanced Testing** - Migrated to Vitest with browser testing support
- ✅ **ESM First** - Native ES Module support with CommonJS compatibility
- ✅ **Node 20+** - Optimized for modern Node.js versions
- ✅ **Named Exports** - All exports are named for better tree-shaking

## Translations

- [中文文档](README_zh.md)

## Installation

```shell
npm install excelts
```

```shell
pnpm add excelts
```

```shell
yarn add excelts
```

## Quick Start

### Creating a Workbook

```javascript
import { Workbook } from "excelts";

const workbook = new Workbook();
const sheet = workbook.addWorksheet("My Sheet");

// Add data
sheet.addRow(["Name", "Age", "Email"]);
sheet.addRow(["John Doe", 30, "john@example.com"]);
sheet.addRow(["Jane Smith", 25, "jane@example.com"]);

// Save to file
await workbook.xlsx.writeFile("output.xlsx");
```

### Reading a Workbook

```javascript
import { Workbook } from "excelts";

const workbook = new Workbook();
await workbook.xlsx.readFile("input.xlsx");

const worksheet = workbook.getWorksheet(1);
worksheet.eachRow((row, rowNumber) => {
  console.log("Row " + rowNumber + " = " + JSON.stringify(row.values));
});
```

### Styling Cells

```javascript
// Set cell value and style
const cell = worksheet.getCell("A1");
cell.value = "Hello";
cell.font = {
  name: "Arial",
  size: 16,
  bold: true,
  color: { argb: "FFFF0000" }
};
cell.fill = {
  type: "pattern",
  pattern: "solid",
  fgColor: { argb: "FFFFFF00" }
};
```

## Features

- **Excel Operations**
  - Create, read, and modify XLSX files
  - Multiple worksheet support
  - Cell styling (fonts, colors, borders, fills)
  - Cell merging and formatting
  - Row and column properties
  - Freeze panes and split views

- **Data Handling**
  - Rich text support
  - Formulas and calculated values
  - Data validation
  - Conditional formatting
  - Images and charts
  - Hyperlinks
  - Pivot tables

- **Advanced Features**
  - Streaming for large files
  - CSV import/export
  - Tables with auto-filters
  - Page setup and printing options
  - Data protection
  - Comments and notes

## Browser Support

ExcelTS supports both Node.js and browser environments:

```javascript
// Browser usage
import { Workbook } from "excelts/browser";

const workbook = new Workbook();
// ... use workbook API
```

## Requirements

### Node.js

- **Node.js >= 14.0.0** (ES2020 native support)
- Recommended: Node.js >= 20.0.0 for best performance

### Browsers (No Polyfills Required)

- **Chrome >= 85** (August 2020)
- **Edge >= 85** (August 2020)
- **Firefox >= 79** (July 2020)
- **Safari >= 14** (September 2020)
- **Opera >= 71** (September 2020)

All ES2020 features (optional chaining `?.`, nullish coalescing `??`, Promise.allSettled, etc.) are natively supported in these versions.

## API Documentation

For detailed API documentation, please refer to the comprehensive documentation sections:

- Workbook Management
- Worksheets
- Cells and Values
- Styling
- Formulas
- Data Validation
- Conditional Formatting
- File I/O

The API remains largely compatible with the original ExcelJS.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

If you submit a pull request for a bugfix, please add a unit-test or integration-test (in the spec folder) that catches the problem.

Note: Please try to avoid modifying the package version in a PR. Versions are updated on release and any change will most likely result in merge collisions.

To be clear, all contributions added to this library will be included in the library's MIT license.

## License

MIT License

Based on [ExcelJS](https://github.com/exceljs/exceljs) by [Guyon Roche](https://github.com/guyonroche)

## Credits

This project is a fork of ExcelJS with modernization improvements. All credit for the original implementation goes to:

- **Guyon Roche** - Original author of ExcelJS
- All [ExcelJS contributors](https://github.com/exceljs/exceljs/graphs/contributors)

## Links

- [GitHub Repository](https://github.com/cjnoname/exceljs)
- [Original ExcelJS](https://github.com/exceljs/exceljs)
- [Issue Tracker](https://github.com/cjnoname/exceljs/issues)

## Changelog

### 0.1.0 (2025-10-24)

- Initial release of ExcelTS
- Full TypeScript rewrite with strict typing
- All default exports converted to named exports
- Updated all dependencies to latest versions
- Migrated to Vitest for testing
- Switched to Rolldown for bundling
- Modern ES Module support
- Node 20+ support
- Enhanced type safety with proper access modifiers
- Browser testing support
- Performance optimizations
