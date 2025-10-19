import colCache = require('../utils/col-cache');

const _ = require('../utils/under-dash');

interface ColumnDefn {
  header?: any;
  key?: string;
  width?: number;
  outlineLevel?: number;
  hidden?: boolean;
  style?: any;
  collapsed?: boolean;
  isCustomWidth?: boolean;
}

interface ColumnModel {
  min: number;
  max: number;
  width?: number;
  style?: any;
  isCustomWidth?: boolean;
  hidden?: boolean;
  outlineLevel?: number;
  collapsed?: boolean;
}

// Column defines the column properties for 1 column
// This includes header rows, widths, key, (style), etc.
const DEFAULT_COLUMN_WIDTH = 15;

class Column {
  public _worksheet: any;
  public _number: number;
  public _width: number | undefined;
  public _hidden: boolean;
  public _outlineLevel: number;
  public defn: ColumnDefn;
  public isCustomWidth: boolean;
  public collapsed: boolean;
  public style: any;

  constructor(worksheet: any, number: number, defn?: ColumnDefn) {
    this._worksheet = worksheet;
    this._number = number;

    if (defn) {
      this.defn = defn;
    } else {
      this.defn = {};
    }

    if (this.isCustomWidth) {
      this._width = this.width;
    }

    this.style = this.defn.style || {};
    this.hidden = this.defn.hidden || false;
    this.outlineLevel = this.defn.outlineLevel || 0;
    this.collapsed = this.defn.collapsed || false;
  }

  // =============================================================================
  // Property Getters and Setters

  get number(): number {
    return this._number;
  }

  get worksheet(): any {
    return this._worksheet;
  }

  get letter(): string {
    return colCache.n2l(this._number);
  }

  get isDefault(): boolean {
    if (
      !this._width &&
      !this._hidden &&
      !this._outlineLevel &&
      !this.collapsed &&
      _.isEqual(this.style, {})
    ) {
      return true;
    }
    return false;
  }

  get headers(): any[] {
    const cellCount = this._worksheet._rows.length;
    if (cellCount) {
      const headers = [];
      for (let i = 0; i < cellCount; i++) {
        const cell = this._worksheet.getCell(i + 1, this._number);
        headers.push(cell.value);
      }
      return headers;
    }
    return undefined;
  }

  set headers(value: any[]) {
    value.forEach((header, index) => {
      const row = index + 1;
      const cell = this._worksheet.getCell(row, this._number);
      cell.value = header;
    });
  }

  get header(): any {
    return this._worksheet ? this._worksheet.getCell(1, this._number).value : undefined;
  }

  set header(value: any) {
    if (this._worksheet) {
      this._worksheet.getCell(1, this._number).value = value;
    }
    this.defn.header = value;
  }

  get key(): string | undefined {
    return this.defn.key;
  }

  set key(value: string | undefined) {
    this.defn.key = value;
  }

  get hidden(): boolean {
    return this._hidden;
  }

  set hidden(value: boolean) {
    this._hidden = value;
  }

  get outlineLevel(): number {
    return this._outlineLevel;
  }

  set outlineLevel(value: number) {
    this._outlineLevel = value;
  }

  get width(): number | undefined {
    return this._width;
  }

  set width(value: number | undefined) {
    if (value) {
      this._width = value;
      this.isCustomWidth = true;
    } else {
      this._width = undefined;
    }
  }

  // =============================================================================

  defn_fn(value?: ColumnDefn): ColumnDefn {
    if (value) {
      this.header = value.header;
      this.key = value.key;
      if (value.width) {
        this.width = value.width;
      }
      this.outlineLevel = value.outlineLevel || 0;
      this.hidden = !!value.hidden;
      this.style = value.style;
      this.collapsed = value.collapsed || false;
      this.isCustomWidth = !!value.isCustomWidth;
    } else {
      return {
        header: this.header,
        key: this.key,
        width: this.width,
        outlineLevel: this.outlineLevel,
        hidden: this.hidden,
        style: this.style,
        collapsed: this.collapsed,
        isCustomWidth: this.isCustomWidth,
      };
    }
  }

  toString(): string {
    return JSON.stringify({
      key: this.key,
      width: this.width,
      headers: this.headers,
    });
  }

  equivalentTo(other: Column): boolean {
    return (
      this.width === other.width &&
      this.hidden === other.hidden &&
      this.outlineLevel === other.outlineLevel &&
      this.collapsed === other.collapsed &&
      _.isEqual(this.style, other.style)
    );
  }

  eachCell(options: any, callback?: (cell: any, rowNumber: number) => void): void {
    const colNumber = this.number;
    if (!callback) {
      callback = options;
      options = null;
    }
    this._worksheet.eachRow(options, (row: any, rowNumber: number) => {
      callback(row.getCell(colNumber), rowNumber);
    });
  }

  // =============================================================================
  // styles

  _applyStyle(name: string, value: any): void {
    this.style[name] = value;
    this.eachCell((cell: any) => {
      cell[name] = value;
    });
  }

  get numFmt(): any {
    return this.style.numFmt;
  }

  set numFmt(value: any) {
    this._applyStyle('numFmt', value);
  }

  get font(): any {
    return this.style.font;
  }

  set font(value: any) {
    this._applyStyle('font', value);
  }

  get alignment(): any {
    return this.style.alignment;
  }

  set alignment(value: any) {
    this._applyStyle('alignment', value);
  }

  get protection(): any {
    return this.style.protection;
  }

  set protection(value: any) {
    this._applyStyle('protection', value);
  }

  get border(): any {
    return this.style.border;
  }

  set border(value: any) {
    this._applyStyle('border', value);
  }

  get fill(): any {
    return this.style.fill;
  }

  set fill(value: any) {
    this._applyStyle('fill', value);
  }

  // =============================================================================
  // static functions

  static toModel(columns: Column[] | undefined): ColumnModel[] | undefined {
    // Convert array of Column into compressed list cols
    const cols: ColumnModel[] = [];
    let col: ColumnModel | null = null;
    if (columns) {
      columns.forEach((column, index) => {
        if (column.isDefault) {
          if (col) {
            col = null;
          }
        } else if (!col || !column.equivalentTo(col as any)) {
          col = {
            min: index + 1,
            max: index + 1,
            width: column.width !== undefined ? column.width : DEFAULT_COLUMN_WIDTH,
            style: column.style,
            isCustomWidth: column.isCustomWidth,
            hidden: column.hidden,
            outlineLevel: column.outlineLevel,
            collapsed: column.collapsed,
          };
          cols.push(col);
        } else {
          col.max = index + 1;
        }
      });
    }
    return cols.length ? cols : undefined;
  }

  static fromModel(worksheet: any, cols?: ColumnModel[]): Column[] | null {
    cols = cols || [];
    const columns: Column[] = [];
    let count = 1;
    let index = 0;
    /**
     * sort cols by min
     * If it is not sorted, the subsequent column configuration will be overwritten
     * */
    cols = cols.sort(function(pre, next)  {
      return pre.min - next.min;
    });
    while (index < cols.length) {
      const col = cols[index++];
      while (count < col.min) {
        columns.push(new Column(worksheet, count++));
      }
      while (count <= col.max) {
        columns.push(new Column(worksheet, count++, col));
      }
    }
    return columns.length ? columns : null;
  }
}

export = Column;
