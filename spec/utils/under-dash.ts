import underDash from '../../lib/utils/under-dash.js';

const _ = Object.assign(
  {
    get: function get(obj: any, path: string | string[], dflt?: any): any {
      let pathArray: string[];
      if (typeof path === 'string') {
        pathArray = path.split('.');
      } else {
        pathArray = path;
      }
      let current = obj;
      while (current && pathArray.length) {
        current = current[pathArray.shift()!];
      }
      return current !== undefined ? current : dflt;
    },

    has: function has(obj: any, path: string | string[]): boolean {
      const dummy = {};
      return _.get(obj, path, dummy) !== dummy;
    },

    cloneDeep: function cloneDeep(obj: any, preserveUndefined?: boolean): any {
      if (preserveUndefined === undefined) {
        preserveUndefined = true;
      }
      let clone: any;
      if (obj === null) {
        return null;
      }
      if (obj instanceof Date) {
        return obj;
      }
      if (obj instanceof Array) {
        clone = [];
      } else if (typeof obj === 'object') {
        clone = {};
      } else {
        return obj;
      }
      _.each(obj, (value: any, name: string | number) => {
        if (value !== undefined) {
          clone[name] = cloneDeep(value, preserveUndefined);
        } else if (preserveUndefined) {
          clone[name] = undefined;
        }
      });
      return clone;
    },
  },
  underDash
);

export default _;
