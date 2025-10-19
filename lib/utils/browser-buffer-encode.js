"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToBuffer = stringToBuffer;
// eslint-disable-next-line node/no-unsupported-features/node-builtins
const textEncoder = typeof global.TextEncoder === 'undefined' ? null : new global.TextEncoder();
const buffer_1 = require("buffer");
function stringToBuffer(str) {
    if (typeof str !== 'string') {
        return str;
    }
    if (textEncoder) {
        return buffer_1.Buffer.from(textEncoder.encode(str).buffer);
    }
    return buffer_1.Buffer.from(str);
}
//# sourceMappingURL=browser-buffer-encode.js.map