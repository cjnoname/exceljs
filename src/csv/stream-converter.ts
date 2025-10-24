// =======================================================================================================
// StreamConverter
//
// convert between encoding schemes in a stream
// Work in Progress - Will complete this at some point
const jconv: any = undefined; // TODO: jconv is not currently implemented

interface StreamConverterOptions {
  innerEncoding?: string;
  outerEncoding?: string;
  innerBOM?: Buffer | null;
  outerBOM?: Buffer | null;
}

class StreamConverter {
  declare inner: any;
  declare innerEncoding: string;
  declare outerEncoding: string;
  declare innerBOM: Buffer | null;
  declare outerBOM: Buffer | null;
  declare writeStarted: boolean;

  constructor(inner: any, options?: StreamConverterOptions) {
    this.inner = inner;

    options = options || {};
    this.innerEncoding = (options.innerEncoding || 'UTF8').toUpperCase();
    this.outerEncoding = (options.outerEncoding || 'UTF8').toUpperCase();

    this.innerBOM = options.innerBOM || null;
    this.outerBOM = options.outerBOM || null;

    this.writeStarted = false;
  }

  convertInwards(data: string | Buffer): Buffer | undefined {
    if (data) {
      let buffer: Buffer;
      if (typeof data === 'string') {
        buffer = Buffer.from(data, this.outerEncoding as BufferEncoding);
      } else {
        buffer = data;
      }

      if (this.innerEncoding !== this.outerEncoding) {
        buffer = jconv.convert(buffer, this.outerEncoding, this.innerEncoding);
      }

      return buffer;
    }

    return undefined;
  }

  convertOutwards(data: string | Buffer): Buffer {
    let buffer: Buffer;
    if (typeof data === 'string') {
      buffer = Buffer.from(data, this.innerEncoding as BufferEncoding);
    } else {
      buffer = data;
    }

    if (this.innerEncoding !== this.outerEncoding) {
      buffer = jconv.convert(buffer, this.innerEncoding, this.outerEncoding);
    }
    return buffer;
  }

  addListener(event: string, handler: (...args: any[]) => void): void {
    this.inner.addListener(event, handler);
  }

  removeListener(event: string, handler: (...args: any[]) => void): void {
    this.inner.removeListener(event, handler);
  }

  write(data: string | Buffer, encoding?: BufferEncoding | (() => void), callback?: () => void): void {
    if (encoding instanceof Function) {
      callback = encoding as () => void;
      encoding = undefined;
    }

    if (!this.writeStarted) {
      // if inner encoding has BOM, write it now
      if (this.innerBOM) {
        this.inner.write(this.innerBOM);
      }

      // if outer encoding has BOM, delete it now
      if (this.outerBOM && Buffer.isBuffer(data)) {
        if (data.length <= this.outerBOM.length) {
          if (callback) {
            callback();
          }
          return;
        }
        const bomless = Buffer.alloc(data.length - this.outerBOM.length);
        data.copy(bomless, 0, this.outerBOM.length, data.length);
        data = bomless;
      }

      this.writeStarted = true;
    }

    this.inner.write(this.convertInwards(data), encoding ? this.innerEncoding : undefined, callback);
  }

  read(): any {
    // TBD
  }

  pipe(destination: any, options?: any): void {
    const reverseConverter = new StreamConverter(destination, {
      innerEncoding: this.outerEncoding,
      outerEncoding: this.innerEncoding,
      innerBOM: this.outerBOM,
      outerBOM: this.innerBOM,
    });

    this.inner.pipe(reverseConverter, options);
  }

  close(): void {
    this.inner.close();
  }

  on(type: string, callback: (...args: any[]) => void): this {
    switch (type) {
      case 'data':
        this.inner.on('data', (chunk: Buffer) => {
          callback(this.convertOutwards(chunk));
        });
        return this;
      default:
        this.inner.on(type, callback);
        return this;
    }
  }

  once(type: string, callback: (...args: any[]) => void): void {
    this.inner.once(type, callback);
  }

  end(chunk?: string | Buffer, encoding?: BufferEncoding, callback?: () => void): void {
    this.inner.end(this.convertInwards(chunk as any), this.innerEncoding, callback);
  }

  emit(type: string, value?: any): void {
    this.inner.emit(type, value);
  }
}

export default StreamConverter;
