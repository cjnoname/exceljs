class TypedStack<T> {
  declare private _type: new () => T;
  declare private _stack: T[];

  constructor(type: new () => T) {
    this._type = type;
    this._stack = [];
  }

  get size(): number {
    return this._stack.length;
  }

  pop(): T {
    const tos = this._stack.pop();
    return tos || new this._type();
  }

  push(instance: T): void {
    if (!(instance instanceof this._type)) {
      throw new Error('Invalid type pushed to TypedStack');
    }
    this._stack.push(instance);
  }
}

export { TypedStack };
export default TypedStack;
