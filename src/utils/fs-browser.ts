// Browser-compatible fs implementation
// Supports File objects from <input type="file"> and ArrayBuffer/Buffer

import { PassThrough } from 'stream';

function isFile(obj: any): obj is File {
  return typeof File !== 'undefined' && obj instanceof File;
}

function isArrayBufferView(obj: any): obj is ArrayBufferView {
  return obj && obj.buffer instanceof ArrayBuffer && typeof obj.byteLength === 'number';
}

// Convert File/ArrayBuffer/Buffer to Buffer
async function toBuffer(input: any): Promise<Buffer> {
  if (Buffer.isBuffer(input)) {
    return input;
  }
  if (input instanceof ArrayBuffer) {
    return Buffer.from(input);
  }
  if (isArrayBufferView(input)) {
    return Buffer.from(input.buffer, input.byteOffset, input.byteLength);
  }
  if (isFile(input)) {
    const arrayBuffer = await input.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
  throw new Error('Unsupported input type. Expected File, ArrayBuffer, TypedArray, or Buffer.');
}

function readFile(path: string | File, options: any, callback: any): void {
  if (typeof options === 'function') {
    callback = options;
    options = undefined;
  }

  if (typeof path === 'string') {
    callback(
      new Error('fs.readFile with file path is not supported in browser. Use File object from <input type="file">.')
    );
    return;
  }

  toBuffer(path)
    .then(buffer => callback(null, buffer))
    .catch(err => callback(err));
}

function writeFile(_path: string, _data: any, _options: any, callback: any): void {
  if (typeof _options === 'function') {
    callback = _options;
  }
  callback(
    new Error('fs.writeFile is not supported in browser. Use workbook.xlsx.writeBuffer() and trigger download instead.')
  );
}

function createReadStream(path: string | File): any {
  if (typeof path === 'string') {
    const stream = new PassThrough();
    process.nextTick(() => {
      stream.destroy(
        new Error(
          'fs.createReadStream with file path is not supported in browser. Use File object from <input type="file">.'
        )
      );
    });
    return stream;
  }

  const stream = new PassThrough();
  toBuffer(path)
    .then(buffer => {
      stream.end(buffer);
    })
    .catch(err => {
      stream.destroy(err);
    });
  return stream;
}

function createWriteStream(_path: string): any {
  const stream = new PassThrough();
  process.nextTick(() => {
    stream.destroy(
      new Error('fs.createWriteStream is not supported in browser. Use workbook.xlsx.writeBuffer() instead.')
    );
  });
  return stream;
}

const noop = () => {};

export const fs = {
  readFile,
  writeFile,
  readFileSync: () => {
    throw new Error('fs.readFileSync is not supported in browser.');
  },
  writeFileSync: () => {
    throw new Error('fs.writeFileSync is not supported in browser.');
  },
  createReadStream,
  createWriteStream,
  existsSync: () => false,
  mkdirSync: noop,
  copyFileSync: noop,
  promises: {
    readFile: async (path: string | File) => {
      if (typeof path === 'string') {
        throw new Error(
          'fs.promises.readFile with file path is not supported in browser. Use File object from <input type="file">.'
        );
      }
      return toBuffer(path);
    },
    writeFile: async () => {
      throw new Error('fs.promises.writeFile is not supported in browser. Use workbook.xlsx.writeBuffer() instead.');
    },
    mkdir: async () => {},
    mkdtemp: async () => {
      throw new Error('fs.promises.mkdtemp is not supported in browser.');
    },
    rm: async () => {},
  },
};
