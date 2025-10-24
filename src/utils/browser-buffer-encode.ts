const textEncoder = typeof (global as any).TextEncoder === 'undefined' ? null : new (global as any).TextEncoder();
import { Buffer } from 'buffer';

function stringToBuffer(str: any): Buffer {
  if (typeof str !== 'string') {
    return str;
  }
  if (textEncoder) {
    return Buffer.from(textEncoder.encode(str).buffer as ArrayBuffer);
  }
  return Buffer.from(str);
}

export { stringToBuffer };
