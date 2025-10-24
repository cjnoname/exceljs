import { EventEmitter } from 'events';

// =============================================================================
// AutoDrain - kind of /dev/null
class AutoDrain extends EventEmitter {
  write(chunk: any): void {
    this.emit('data', chunk);
  }

  end(): void {
    this.emit('end');
  }
}

export { AutoDrain };
export default AutoDrain;
