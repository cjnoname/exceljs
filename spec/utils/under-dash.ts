export function get(obj: any, path: string | string[], dflt?: any): any {
  const pathArray = typeof path === 'string' ? path.split('.') : [...path];
  return pathArray.reduce((current, key) => current?.[key], obj) ?? dflt;
}

export function has(obj: any, path: string | string[]): boolean {
  const pathArray = typeof path === 'string' ? path.split('.') : path;
  return pathArray.reduce((current, key) => 
    current != null && key in current ? current[key] : undefined, 
    obj
  ) !== undefined;
}

export function cloneDeep(obj: any, preserveUndefined?: boolean): any {
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
    obj.forEach((value: any, index: number) => {
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
}
