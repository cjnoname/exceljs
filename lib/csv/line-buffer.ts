import {EventEmitter} from 'events';

interface LineBufferOptions {
  encoding?: string;
}

class LineBuffer extends EventEmitter {
  public encoding?: string;
  public buffer: string | null;
  public corked: boolean;
  public queue: string[];

  constructor(options: LineBufferOptions) {
    super();

    this.encoding = options.encoding;

    this.buffer = null;

    // part of cork/uncork
    this.corked = false;
    this.queue = [];
  }

  // Events:
  //  line: here is a line
  //  done: all lines emitted

  write(chunk: string): boolean {
    // find line or lines in chunk and emit them if not corked
    // or queue them if corked
    const data = this.buffer ? this.buffer + chunk : chunk;
    const lines = data.split(/\r?\n/g);

    // save the last line
    this.buffer = lines.pop() || null;

    lines.forEach((line: string) => {
      if (this.corked) {
        this.queue.push(line);
      } else {
        this.emit('line', line);
      }
    });

    return !this.corked;
  }

  cork(): void {
    this.corked = true;
  }

  uncork(): void {
    this.corked = false;
    this._flush();

    // tell the source I'm ready again
    this.emit('drain');
  }

  setDefaultEncoding(): void {
    // ?
  }

  end(): void {
    if (this.buffer) {
      this.emit('line', this.buffer);
      this.buffer = null;
    }
    this.emit('done');
  }

  _flush(): void {
    if (!this.corked) {
      this.queue.forEach(line => {
        this.emit('line', line);
      });
      this.queue = [];
    }
  }
}

export = LineBuffer;
