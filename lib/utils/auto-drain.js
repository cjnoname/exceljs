"use strict";
const events_1 = require("events");
// =============================================================================
// AutoDrain - kind of /dev/null
class AutoDrain extends events_1.EventEmitter {
    write(chunk) {
        this.emit('data', chunk);
    }
    end() {
        this.emit('end');
    }
}
module.exports = AutoDrain;
//# sourceMappingURL=auto-drain.js.map