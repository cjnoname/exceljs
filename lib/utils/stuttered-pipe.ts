import * as events from 'events';

interface StutteredPipeOptions {
  bufSize?: number;
  autoPause?: boolean;
}

interface Readable extends NodeJS.ReadableStream {
  read(size?: number): any;
  on(event: 'end', listener: () => void): this;
  on(event: 'readable', listener: () => void): this;
}

interface Writable {
  write(chunk: any): boolean;
  end(): void;
}

// =============================================================================
// StutteredPipe - Used to slow down streaming so GC can get a look in
class StutteredPipe extends events.EventEmitter {
  readable: Readable;
  writable: Writable;
  bufSize: number;
  autoPause: boolean;
  paused: boolean;
  eod: boolean;
  scheduled: NodeJS.Immediate | null;

  constructor(readable: Readable, writable: Writable, options?: StutteredPipeOptions) {
    super();

    options = options || {};

    this.readable = readable;
    this.writable = writable;
    this.bufSize = options.bufSize || 16384;
    this.autoPause = options.autoPause || false;

    this.paused = false;
    this.eod = false;
    this.scheduled = null;

    readable.on('end', () => {
      this.eod = true;
      writable.end();
    });

    // need to have some way to communicate speed of stream
    // back from the consumer
    readable.on('readable', () => {
      if (!this.paused) {
        this.resume();
      }
    });
    this._schedule();
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    if (!this.eod) {
      if (this.scheduled !== null) {
        clearImmediate(this.scheduled);
      }
      this._schedule();
    }
  }

  private _schedule(): void {
    this.scheduled = setImmediate(() => {
      this.scheduled = null;
      if (!this.eod && !this.paused) {
        const data = this.readable.read(this.bufSize);
        if (data && data.length) {
          this.writable.write(data);

          if (!this.paused && !this.autoPause) {
            this._schedule();
          }
        } else if (!this.paused) {
          this._schedule();
        }
      }
    });
  }
}

export default StutteredPipe;
