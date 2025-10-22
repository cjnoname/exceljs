const { toString } = Object.prototype;
const escapeHtmlRegex = /["&<>]/;

type Callback<T, R = void> = (value: T, key: number | string) => R;

const _ = {
  // Helper methods for object/array iteration
  // Note: Consider using native Object.keys().forEach() or for...of instead
  each: function each<T>(obj: T[] | Record<string, T> | null | undefined, cb: Callback<T>): void {
    if (obj) {
      if (Array.isArray(obj)) {
        obj.forEach(cb);
      } else {
        Object.keys(obj).forEach(key => {
          cb(obj[key], key);
        });
      }
    }
  },

  // Note: Consider using Object.values(obj).every(cb) for objects
  every: function every<T>(obj: T[] | Record<string, T> | null | undefined, cb: Callback<T, boolean>): boolean {
    if (obj) {
      if (Array.isArray(obj)) {
        return obj.every(cb);
      }
      return Object.keys(obj).every(key => cb(obj[key], key));
    }
    return true;
  },

  // Note: Consider using Object.keys(obj).map(key => cb(obj[key], key)) for objects
  map: function map<T, R>(obj: T[] | Record<string, T> | null | undefined, cb: Callback<T, R>): R[] {
    if (obj) {
      if (Array.isArray(obj)) {
        return obj.map(cb);
      }
      return Object.keys(obj).map(key => cb(obj[key], key));
    }
    return [];
  },

  // Useful utility - consider keeping
  keyBy<T extends Record<string, any>>(a: T[], p: keyof T): Record<string, T> {
    return a.reduce((o: Record<string, T>, v: T) => {
      o[v[p]] = v;
      return o;
    }, {});
  },

  isEqual: function isEqual(a: any, b: any): boolean {
    const aType = typeof a;
    const bType = typeof b;
    const aArray = Array.isArray(a);
    const bArray = Array.isArray(b);
    let keys: string[];

    if (aType !== bType) {
      return false;
    }
    switch (typeof a) {
      case 'object':
        if (aArray || bArray) {
          if (aArray && bArray) {
            return (
              a.length === b.length &&
              a.every((aValue: any, index: number) => {
                const bValue = b[index];
                return _.isEqual(aValue, bValue);
              })
            );
          }
          return false;
        }

        if (a === null || b === null) {
          return a === b;
        }

        // Compare object keys and values
        keys = Object.keys(a);

        if (Object.keys(b).length !== keys.length) {
          return false;
        }

        for (const key of keys) {
          if (!b.hasOwnProperty(key)) {
            return false;
          }
        }

        return _.every(a, (aValue: any, key: string) => {
          const bValue = b[key];
          return _.isEqual(aValue, bValue);
        });

      default:
        return a === b;
    }
  },

  escapeHtml(html: string): string {
    const regexResult = escapeHtmlRegex.exec(html);
    if (!regexResult) return html;

    let result = '';
    let escape = '';
    let lastIndex = 0;
    let i = regexResult.index;
    for (; i < html.length; i++) {
      switch (html.charAt(i)) {
        case '"':
          escape = '&quot;';
          break;
        case '&':
          escape = '&amp;';
          break;
        case "'":
          escape = '&apos;';
          break;
        case '<':
          escape = '&lt;';
          break;
        case '>':
          escape = '&gt;';
          break;
        default:
          continue;
      }
      if (lastIndex !== i) result += html.substring(lastIndex, i);
      lastIndex = i + 1;
      result += escape;
    }
    if (lastIndex !== i) return result + html.substring(lastIndex, i);
    return result;
  },

  // Use native String.prototype.localeCompare() instead: a.localeCompare(b)
  strcmp(a: string, b: string): number {
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  },

  isUndefined(val: any): val is undefined {
    return toString.call(val) === '[object Undefined]';
  },

  isObject(val: any): val is Record<string, any> {
    return toString.call(val) === '[object Object]';
  },

  deepMerge<T = any>(...args: any[]): T {
    const target: any = args[0] || {};
    const { length } = args;
    // eslint-disable-next-line one-var
    let src: any, clone: any, copyIsArray: boolean;

    function assignValue(val: any, key: string): void {
      src = target[key];
      copyIsArray = Array.isArray(val);
      if (_.isObject(val) || copyIsArray) {
        if (copyIsArray) {
          copyIsArray = false;
          clone = src && Array.isArray(src) ? src : [];
        } else {
          clone = src && _.isObject(src) ? src : {};
        }
        target[key] = _.deepMerge(clone, val);
      } else if (!_.isUndefined(val)) {
        target[key] = val;
      }
    }

    for (let i = 0; i < length; i++) {
      _.each(args[i], assignValue);
    }
    return target;
  },
};

export default _;
