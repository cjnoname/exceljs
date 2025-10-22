import underDash from '../../src/utils/under-dash.js';

const _ = Object.assign(
  {
    get: function get(obj, path, dflt) {
      if (typeof path === 'string') {
        path = path.split('.');
      }
      while (obj && path.length) {
        obj = obj[path.shift()];
      }
      return obj !== undefined ? obj : dflt;
    },

    has: function has(obj, path) {
      const dummy = {};
      return _.get(obj, path, dummy) !== dummy;
    },

    cloneDeep: function cloneDeep(obj, preserveUndefined) {
      if (preserveUndefined === undefined) {
        preserveUndefined = true;
      }
      let clone;
      if (obj === null) {
        return null;
      }
      if (obj instanceof Date) {
        return obj;
      }
      if (obj instanceof Array) {
        clone = [];
        obj.forEach((value, index) => {
          if (value !== undefined) {
            clone[index] = cloneDeep(value, preserveUndefined);
          } else if (preserveUndefined) {
            clone[index] = undefined;
          }
        });
      } else if (typeof obj === 'object') {
        clone = {};
        Object.keys(obj).forEach(name => {
          const value = obj[name];
          if (value !== undefined) {
            clone[name] = cloneDeep(value, preserveUndefined);
          } else if (preserveUndefined) {
            clone[name] = undefined;
          }
        });
      } else {
        return obj;
      }
      return clone;
    },
  },
  underDash
);

export default _;
