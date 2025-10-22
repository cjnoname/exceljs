import {SaxesParser, SaxesTag} from 'saxes';
import {PassThrough} from 'readable-stream';
import {bufferToString} from './browser-buffer-decode.js';

interface SaxEvent {
  eventType: 'opentag' | 'text' | 'closetag';
  value: any;
}

async function* parseSax(iterable: any): AsyncGenerator<SaxEvent[]> {
  // TODO: Remove once node v8 is deprecated
  // Detect and upgrade old streams
  if (iterable.pipe && !iterable[Symbol.asyncIterator]) {
    iterable = iterable.pipe(new PassThrough());
  }
  const saxesParser = new SaxesParser();
  let error: Error | undefined;
  saxesParser.on('error', (err: Error) => {
    error = err;
  });
  let events: SaxEvent[] = [];
  saxesParser.on('opentag', (value: SaxesTag) => events.push({eventType: 'opentag', value}));
  saxesParser.on('text', (value: string) => events.push({eventType: 'text', value}));
  saxesParser.on('closetag', (value: SaxesTag) => events.push({eventType: 'closetag', value}));
  for await (const chunk of iterable) {
    saxesParser.write(bufferToString(chunk));
    // saxesParser.write and saxesParser.on() are synchronous,
    // so we can only reach the below line once all events have been emitted
    if (error) throw error;
    // As a performance optimization, we gather all events instead of passing
    // them one by one, which would cause each event to go through the event queue
    yield events;
    events = [];
  }
}

export default parseSax;
