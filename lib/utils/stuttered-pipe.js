"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
const events = __importStar(require("events"));
// =============================================================================
// StutteredPipe - Used to slow down streaming so GC can get a look in
class StutteredPipe extends events.EventEmitter {
    constructor(readable, writable, options) {
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
    pause() {
        this.paused = true;
    }
    resume() {
        if (!this.eod) {
            if (this.scheduled !== null) {
                clearImmediate(this.scheduled);
            }
            this._schedule();
        }
    }
    _schedule() {
        this.scheduled = setImmediate(() => {
            this.scheduled = null;
            if (!this.eod && !this.paused) {
                const data = this.readable.read(this.bufSize);
                if (data && data.length) {
                    this.writable.write(data);
                    if (!this.paused && !this.autoPause) {
                        this._schedule();
                    }
                }
                else if (!this.paused) {
                    this._schedule();
                }
            }
        });
    }
}
module.exports = StutteredPipe;
//# sourceMappingURL=stuttered-pipe.js.map