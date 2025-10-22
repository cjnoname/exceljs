import {EventEmitter} from 'events';

interface Readable extends EventEmitter {
  resume(): void;
  pause(): void;
  on(event: 'data', listener: (chunk: any) => void): this;
  on(event: 'end', listener: () => void): this;
  on(event: 'error', listener: (err: Error) => void): this;
}

async function* iterateStream(stream: Readable): AsyncGenerator<any> {
  const contents: any[] = [];
  
  const onData = (data: any) => contents.push(data);
  stream.on('data', onData);

  let resolveStreamEndedPromise: () => void;
  const streamEndedPromise = new Promise<void>(resolve => (resolveStreamEndedPromise = resolve));

  let ended = false;
  const onEnd = () => {
    ended = true;
    resolveStreamEndedPromise!();
  };
  stream.on('end', onEnd);

  let error: Error | false = false;
  const onError = (err: Error) => {
    error = err;
    resolveStreamEndedPromise!();
  };
  stream.on('error', onError);

  try {
    while (!ended || contents.length > 0) {
      if (contents.length === 0) {
        stream.resume();
        // eslint-disable-next-line no-await-in-loop
        await Promise.race([once(stream, 'data'), streamEndedPromise]);
      } else {
        stream.pause();
        const data = contents.shift();
        yield data;
      }
      if (error) throw error;
    }
  } finally {
    // Clean up listeners
    stream.removeListener('data', onData);
    stream.removeListener('end', onEnd);
    stream.removeListener('error', onError);
    resolveStreamEndedPromise!();
  }
}

function once(eventEmitter: EventEmitter, type: string): Promise<void> {
  // TODO: Use require('events').once when node v10 is dropped
  return new Promise(resolve => {
    let fired = false;
    const handler = () => {
      if (!fired) {
        fired = true;
        eventEmitter.removeListener(type, handler);
        resolve();
      }
    };
    eventEmitter.addListener(type, handler);
  });
}

export default iterateStream;
