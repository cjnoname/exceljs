import { EventEmitter } from 'events';
// =============================================================================
// AutoDrain - kind of /dev/null
class AutoDrain extends EventEmitter {
    write(chunk) {
        this.emit('data', chunk);
    }
    end() {
        this.emit('end');
    }
}
export default AutoDrain;
//# sourceMappingURL=auto-drain.js.map