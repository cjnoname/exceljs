// eslint-disable-next-line node/no-unsupported-features/node-builtins
const textEncoder = typeof global.TextEncoder === 'undefined' ? null : new global.TextEncoder();
import { Buffer } from 'buffer';
function stringToBuffer(str) {
    if (typeof str !== 'string') {
        return str;
    }
    if (textEncoder) {
        return Buffer.from(textEncoder.encode(str).buffer);
    }
    return Buffer.from(str);
}
export { stringToBuffer };
//# sourceMappingURL=browser-buffer-encode.js.map