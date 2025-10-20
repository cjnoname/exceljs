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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZipWriter = void 0;
const events = __importStar(require("events"));
const jszip_1 = __importDefault(require("jszip"));
const stream_buf_1 = __importDefault(require("./stream-buf"));
const browser_buffer_encode_1 = require("./browser-buffer-encode");
// =============================================================================
// The ZipWriter class
// Packs streamed data into an output zip stream
class ZipWriter extends events.EventEmitter {
    constructor(options) {
        super();
        this.options = Object.assign({
            type: 'nodebuffer',
            compression: 'DEFLATE',
        }, options);
        this.zip = new jszip_1.default();
        this.stream = new stream_buf_1.default();
    }
    append(data, options) {
        if (options.hasOwnProperty('base64') && options.base64) {
            this.zip.file(options.name, data, { base64: true });
        }
        else {
            // https://www.npmjs.com/package/process
            if (process.browser && typeof data === 'string') {
                // use TextEncoder in browser
                data = (0, browser_buffer_encode_1.stringToBuffer)(data);
            }
            this.zip.file(options.name, data);
        }
    }
    push(chunk) {
        return this.stream.push(chunk);
    }
    finalize() {
        return __awaiter(this, void 0, void 0, function* () {
            const content = yield this.zip.generateAsync(this.options);
            this.stream.end(content);
            this.emit('finish');
        });
    }
    // ==========================================================================
    // Stream.Readable interface
    read(size) {
        return this.stream.read(size);
    }
    setEncoding(encoding) {
        return this.stream.setEncoding(encoding);
    }
    pause() {
        return this.stream.pause();
    }
    resume() {
        return this.stream.resume();
    }
    isPaused() {
        return this.stream.isPaused();
    }
    pipe(destination, options) {
        return this.stream.pipe(destination, options);
    }
    unpipe(destination) {
        return this.stream.unpipe(destination);
    }
    unshift(chunk) {
        return this.stream.unshift(chunk);
    }
    wrap(stream) {
        return this.stream.wrap(stream);
    }
}
exports.ZipWriter = ZipWriter;
//# sourceMappingURL=zip-stream.js.map