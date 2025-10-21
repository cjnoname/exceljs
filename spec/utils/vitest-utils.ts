// Vitest-specific testUtils - ES6 module version
import Row from '../../lib/doc/row.js';
import Column from '../../lib/doc/column.js';

// Local utility functions
const _ = {
  get: function get(obj: any, path: string | string[], dflt?: any): any {
    let pathArray = typeof path === 'string' ? path.split('.') : path;
    let current = obj;
    while (current && pathArray.length) {
      current = current[pathArray.shift()!];
    }
    return current !== undefined ? current : dflt;
  },

  each: function each(obj: any, fn: (value: any, key: string | number) => void): void {
    if (Array.isArray(obj)) {
      obj.forEach((value, index) => fn(value, index));
    } else if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(key => fn(obj[key], key));
    }
  },
};

const tools = {
  dtMatcher: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[.]\d{3}Z$/,
  fix: function fix(o: any): any {
    let clone: any;
    if (o instanceof Array) {
      clone = [];
    } else if (typeof o === 'object') {
      clone = {};
    } else if (typeof o === 'string' && tools.dtMatcher.test(o)) {
      return new Date(o);
    } else {
      return o;
    }
    _.each(o, (value: any, name: string | number) => {
      if (value !== undefined) {
        clone[name] = fix(value);
      }
    });
    return clone;
  },

  concatenateFormula(...args: string[]): { formula: string } {
    const values = args.map(value => `"${value}"`);
    return {
      formula: `CONCATENATE(${values.join(',')})`,
    };
  },
};

// Load JSON data files
import viewsData from './data/views.json';
import sheetValuesData from './data/sheet-values.json';
import stylesData from './data/styles.json';
import sheetPropertiesData from './data/sheet-properties.json';
import pageSetupData from './data/page-setup.json';
import conditionalFormattingData from './data/conditional-formatting.json';
import headerFooterData from './data/header-footer.json';

export const views = tools.fix(viewsData);
export const testValues = tools.fix(sheetValuesData);
export const styles = tools.fix(stylesData);
export const properties = tools.fix(sheetPropertiesData);
export const pageSetup = tools.fix(pageSetupData);
export const conditionalFormatting = tools.fix(conditionalFormattingData);
export const headerFooter = tools.fix(headerFooterData);

export function createSheetMock(): any {
  return {
    _keys: {},
    _cells: {},
    rows: [],
    columns: [],
    properties: {
      outlineLevelCol: 0,
      outlineLevelRow: 0,
    },

    addColumn(colNumber: number, defn?: any) {
      const newColumn = new Column(this, colNumber, defn);
      this.columns[colNumber - 1] = newColumn;
      return newColumn;
    },
    getColumn(colNumber: number | string) {
      let column = this.columns[(colNumber as number) - 1] || this._keys[colNumber];
      if (!column) {
        column = this.columns[(colNumber as number) - 1] = new Column(this, colNumber as number);
      }
      return column;
    },
    getRow(rowNumber: number) {
      let row = this.rows[rowNumber - 1];
      if (!row) {
        row = this.rows[rowNumber - 1] = new Row(this, rowNumber);
      }
      return row;
    },
    getCell(rowNumber: number, colNumber: number) {
      return this.getRow(rowNumber).getCell(colNumber);
    },
    getColumnKey(key: string) {
      return this._keys[key];
    },
    setColumnKey(key: string, value: any) {
      this._keys[key] = value;
    },
    deleteColumnKey(key: string) {
      delete this._keys[key];
    },
    eachColumnKey(f: (value: any, key: string | number) => void) {
      _.each(this._keys, f);
    },
    eachRow(opt: any, f?: (row: any, index: number) => void) {
      if (!f) {
        f = opt;
        opt = {};
      }
      if (opt && opt.includeEmpty) {
        const n = this.rows.length;
        for (let i = 1; i <= n; i++) {
          f!(this.getRow(i), i);
        }
      } else {
        this.rows.forEach((r: any, i: number) => {
          if (r) {
            f!(r, i + 1);
          }
        });
      }
    },
  };
}

export default {
  views,
  testValues,
  styles,
  properties,
  pageSetup,
  conditionalFormatting,
  headerFooter,
  createSheetMock,
};
