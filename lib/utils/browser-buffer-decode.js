"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferToString = bufferToString;
// eslint-disable-next-line node/no-unsupported-features/node-builtins
const textDecoder = typeof global.TextDecoder === 'undefined' ? null : new global.TextDecoder('utf-8');
function bufferToString(chunk) {
    if (typeof chunk === 'string') {
        return chunk;
    }
    if (textDecoder) {
        return textDecoder.decode(chunk);
    }
    return chunk.toString();
}
//# sourceMappingURL=browser-buffer-decode.js.map