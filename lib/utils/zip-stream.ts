import events from 'events';
import {zipSync} from 'fflate';
import StreamBuf from './stream-buf.js';
import {stringToBuffer} from './browser-buffer-encode.js';

interface ZipWriterOptions {
  type?: string;
  compression?: string;
}

interface AppendOptions {
  name: string;
  base64?: boolean;
}

interface ZipFile {
  data: Uint8Array;
  base64?: boolean;
}

// =============================================================================
// The ZipWriter class
// Packs streamed data into an output zip stream
class ZipWriter extends events.EventEmitter {
  options: ZipWriterOptions;
  files: Record<string, ZipFile>;
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

    this.files = {};
    this.stream = new StreamBuf();
  }

  append(data: any, options: AppendOptions): void {
    let buffer: Uint8Array;
    
    if (options.hasOwnProperty('base64') && options.base64) {
      // Use Buffer.from for efficient base64 decoding
      const base64Data = typeof data === 'string' ? data : data.toString();
      if ((process as any).browser) {
        // Browser fallback: use atob but convert more efficiently
        const binaryString = atob(base64Data);
        buffer = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          buffer[i] = binaryString.charCodeAt(i);
        }
      } else {
        // Node.js: use efficient Buffer.from
        buffer = Buffer.from(base64Data, 'base64');
      }
    } else {
      if (typeof data === 'string') {
        // Convert string to Uint8Array
        if ((process as any).browser) {
          buffer = stringToBuffer(data);
        } else {
          buffer = Buffer.from(data, 'utf8');
        }
      } else if (Buffer.isBuffer(data)) {
        buffer = new Uint8Array(data);
      } else {
        buffer = data;
      }
    }
    
    this.files[options.name] = {data: buffer};
  }

  push(chunk: any): boolean {
    return this.stream.push(chunk);
  }

  async finalize(): Promise<void> {
    // Convert files object to fflate format
    const fflateFiles: Record<string, Uint8Array> = {};
    for (const [name, file] of Object.entries(this.files)) {
      fflateFiles[name] = file.data;
    }
    
    // Use zipSync to create the zip buffer
    const zipBuffer = zipSync(fflateFiles, {
      level: 6, // Compression level (0-9)
    });
    
    // Clear files to free memory
    this.files = {};
    
    // Convert Uint8Array to Buffer if needed
    const content = Buffer.from(zipBuffer);
    this.stream.end(content);
    this.emit('finish');
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
