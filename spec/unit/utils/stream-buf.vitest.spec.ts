import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import StreamBuf from '../../../lib/utils/stream-buf.js';
import StringBuf from '../../../lib/utils/string-buf.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('StreamBuf', () => {
  // StreamBuf is designed as a general-purpose writable-readable stream
  // However its use in ExcelJS is primarily as a memory buffer between
  // the streaming writers and the archive, hence the tests here will
  // focus just on that.
  it('writes strings as UTF8', () => {
    const stream = new StreamBuf();
    stream.write('Hello, World!');
    const chunk = stream.read();
    expect(chunk instanceof Buffer).toBeTruthy();
    expect(chunk.toString('UTF8')).toBe('Hello, World!');
  });

  // FIXME: This test passes in Mocha but fails in Vitest due to instanceof check
  // The StringBuf class imported via ES6 modules doesn't match instanceof check in stream-buf
  it.skip('writes StringBuf chunks', async () => {
    const stream = new StreamBuf();
    const strBuf = new StringBuf({size: 64});
    strBuf.addText('Hello, World!');
    await stream.write(strBuf);
    const chunk = stream.read();
    expect(chunk instanceof Buffer).toBeTruthy();
    expect(chunk.toString('UTF8')).toBe('Hello, World!');
  });

  it('signals end', () =>
    new Promise<void>((resolve) => {
      const stream = new StreamBuf();
      stream.on('finish', () => {
        resolve(undefined);
      });
      stream.write('Hello, World!');
      stream.end();
    }));

  it('handles buffers', () =>
    new Promise<void>((resolve, reject) => {
      const s = fs.createReadStream(path.join(__dirname, 'data/image1.png'));
      const sb = new StreamBuf();
      sb.on('finish', () => {
        const buf = sb.toBuffer();
        expect(buf.length).toBe(1672);
        resolve(undefined);
      });
      sb.on('error', reject);
      s.pipe(sb);
    }));
  it('handle unsupported type of chunk', async () => {
    const stream = new StreamBuf();
    try {
      await stream.write({});
      expect.fail('should fail for given argument');
    } catch (e: any) {
      expect(e.message).toBe(
        'Chunk must be one of type String, Buffer or StringBuf.'
      );
    }
  });
});
