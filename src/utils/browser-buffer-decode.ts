// eslint-disable-next-line node/no-unsupported-features/node-builtins
const textDecoder =
  typeof (global as any).TextDecoder === 'undefined' ? null : new (global as any).TextDecoder('utf-8');

function bufferToString(chunk: any): string {
  if (typeof chunk === 'string') {
    return chunk;
  }
  if (textDecoder) {
    return textDecoder.decode(chunk);
  }
  return chunk.toString();
}

export { bufferToString };
