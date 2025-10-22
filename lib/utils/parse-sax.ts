import {Parser} from 'htmlparser2';
import {bufferToString} from './browser-buffer-decode.js';

interface SaxEvent {
  eventType: 'opentag' | 'text' | 'closetag';
  value: any;
}

async function* parseSax(iterable: any): AsyncGenerator<SaxEvent[]> {
  let error: Error | undefined;
  let events: SaxEvent[] = [];
  let depth = 0;
  let hasInvalidText = false;
  let invalidTextForError = '';
  
  const parser = new Parser({
    onopentag(name: string, attribs: Record<string, string>) {
      if (depth === 0 && hasInvalidText) {
        // Text outside root node - report error at root element position
        error = new Error(`${invalidTextForError.split('\n').length}:1: text data outside of root node.`);
      }
      depth++;
      events.push({
        eventType: 'opentag',
        value: {name, attributes: attribs, isSelfClosing: false}
      });
    },
    ontext(text: string) {
      if (depth === 0 && text.trim()) {
        hasInvalidText = true;
        // Only accumulate text for error message when outside root
        invalidTextForError += text;
      }
      events.push({eventType: 'text', value: text});
    },
    onclosetag(name: string) {
      depth--;
      events.push({
        eventType: 'closetag',
        value: {name}
      });
    },
    onerror(err: Error) {
      error = err;
    }
  }, {
    xmlMode: true,
    decodeEntities: true
  });
  
  for await (const chunk of iterable) {
    parser.write(bufferToString(chunk));
    // parser.write and callbacks are synchronous,
    // so we can only reach the below line once all events have been emitted
    if (error) throw error;
    // As a performance optimization, we gather all events instead of passing
    // them one by one, which would cause each event to go through the event queue
    yield events;
    events = [];
  }
  
  parser.end();
}

export default parseSax;
