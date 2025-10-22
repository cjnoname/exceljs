import {Duplex} from 'stream';

// =============================================================================
// StreamBase64 - A utility to convert to/from base64 stream
// Note: does not buffer data, must be piped
class StreamBase64 extends Duplex {
  pipes: any[];
  encoding?: string;

  constructor() {
    super();

    // consuming pipe streams go here
    this.pipes = [];
  }

  // writable
  // event drain - if write returns false (which it won't), indicates when safe to write again.
  // finish - end() has been called
  // pipe(src) - pipe() has been called on readable
  // unpipe(src) - unpipe() has been called on readable
  // error - duh

  write(..._args: any[]): boolean {
    return true;
  }

  cork(): void {}

  uncork(): void {}

  end(..._args: any[]): this {
    return this;
  }

  // readable
  // event readable - some data is now available
  // event data - switch to flowing mode - feeds chunks to handler
  // event end - no more data
  // event close - optional, indicates upstream close
  // event error - duh
  read(_size?: number): any {}

  setEncoding(encoding: string): this {
    // causes stream.read or stream.on('data) to return strings of encoding instead of Buffer objects
    this.encoding = encoding;
    return this;
  }

  pause(): this {
    return this;
  }

  resume(): this {
    return this;
  }

  isPaused(): boolean {
    return false;
  }

  pipe<T extends NodeJS.WritableStream>(destination: T, _options?: {end?: boolean}): T {
    // add destination to pipe list & write current buffer
    this.pipes.push(destination);
    return destination;
  }

  unpipe(destination?: any): this {
    // remove destination from pipe list
    this.pipes = this.pipes.filter(pipe => pipe !== destination);
    return this;
  }

  unshift(_chunk: any): void {
    // some numpty has read some data that's not for them and they want to put it back!
    // Might implement this some day
    throw new Error('Not Implemented');
  }

  wrap(_stream: any): this {
    // not implemented
    throw new Error('Not Implemented');
  }
}

export default StreamBase64;
