import * as events from 'events';
import JSZip = require('jszip');
import StreamBuf = require('./stream-buf');
import {stringToBuffer} from './browser-buffer-encode';

interface ZipWriterOptions {
  type?: string;
  compression?: string;
}

interface AppendOptions {
  name: string;
  base64?: boolean;
}

// =============================================================================
// The ZipWriter class
// Packs streamed data into an output zip stream
class ZipWriter extends events.EventEmitter {
  options: ZipWriterOptions;
  zip: JSZip;
  stream: any;

  constructor(options?: ZipWriterOptions) {
    super();
    this.options = Object.assign(
      {
        type: 'nodebuffer',
        compression: 'DEFLATE',
      },
      options
    );

    this.zip = new JSZip();
    this.stream = new StreamBuf();
  }

  append(data: any, options: AppendOptions): void {
    if (options.hasOwnProperty('base64') && options.base64) {
      this.zip.file(options.name, data, {base64: true});
    } else {
      // https://www.npmjs.com/package/process
      if ((process as any).browser && typeof data === 'string') {
        // use TextEncoder in browser
        data = stringToBuffer(data);
      }
      this.zip.file(options.name, data);
    }
  }

  push(chunk: any): boolean {
    return this.stream.push(chunk);
  }

  async _finalize(): Promise<void> {
    const content = await this.zip.generateAsync(this.options as any);
    if (content) {
      this.push(content);
    }
    this.push(null);
  }

  // ==========================================================================
  // Stream.Readable interface
  read(size?: number): any {
    return this.stream.read(size);
  }

  setEncoding(encoding: string): any {
    return this.stream.setEncoding(encoding);
  }

  pause(): any {
    return this.stream.pause();
  }

  resume(): any {
    return this.stream.resume();
  }

  isPaused(): boolean {
    return this.stream.isPaused();
  }

  pipe(destination: any, options?: any): any {
    return this.stream.pipe(destination, options);
  }

  unpipe(destination?: any): any {
    return this.stream.unpipe(destination);
  }

  unshift(chunk: any): any {
    return this.stream.unshift(chunk);
  }

  wrap(stream: any): any {
    return this.stream.wrap(stream);
  }
}

// =============================================================================

export {ZipWriter};
