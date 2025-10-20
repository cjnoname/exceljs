import fs from 'fs';
import {EventEmitter} from 'events';
import {PassThrough, Readable} from 'readable-stream';
import nodeStream from 'stream';
import unzip from 'unzipper';
import tmp from 'tmp';
import iterateStream from '../../utils/iterate-stream';
import parseSax from '../../utils/parse-sax';

import StyleManager from '../../xlsx/xform/style/styles-xform';
import WorkbookXform from '../../xlsx/xform/book/workbook-xform';
import RelationshipsXform from '../../xlsx/xform/core/relationships-xform';

import WorksheetReader from './worksheet-reader';
import HyperlinkReader from './hyperlink-reader';

tmp.setGracefulCleanup();

interface WorkbookReaderOptions {
  worksheets?: string;
  sharedStrings?: string;
  hyperlinks?: string;
  styles?: string;
  entries?: string;
}

interface WaitingWorksheet {
  sheetNo: string;
  path: string;
  tempFileCleanupCallback: () => void;
}

class WorkbookReader extends EventEmitter {
  input: any;
  options: WorkbookReaderOptions;
  styles: any;
  stream?: any;
  sharedStrings?: any[];
  workbookRels?: any[];
  properties?: any;
  model?: any;

  constructor(input: any, options: WorkbookReaderOptions = {}) {
    super();

    this.input = input;

    this.options = {
      worksheets: 'emit',
      sharedStrings: 'cache',
      hyperlinks: 'ignore',
      styles: 'ignore',
      entries: 'ignore',
      ...options,
    };

    this.styles = new StyleManager();
    this.styles.init();
  }

  _getStream(input: any): any {
    if (input instanceof nodeStream.Readable || input instanceof Readable) {
      return input;
    }
    if (typeof input === 'string') {
      return fs.createReadStream(input);
    }
    throw new Error(`Could not recognise input: ${input}`);
  }

  async read(input?: any, options?: WorkbookReaderOptions): Promise<void> {
    try {
      for await (const {eventType, value} of this.parse(input, options)) {
        switch (eventType) {
          case 'shared-strings':
            this.emit(eventType, value);
            break;
          case 'worksheet':
            this.emit(eventType, value);
            await value.read();
            break;
          case 'hyperlinks':
            this.emit(eventType, value);
            break;
        }
      }
      this.emit('end');
      this.emit('finished');
    } catch (error) {
      this.emit('error', error);
    }
  }

  async *[Symbol.asyncIterator](): AsyncIterableIterator<any> {
    for await (const {eventType, value} of this.parse()) {
      if (eventType === 'worksheet') {
        yield value;
      }
    }
  }

  async *parse(input?: any, options?: WorkbookReaderOptions): AsyncIterableIterator<{eventType: string; value: any}> {
    if (options) this.options = options;
    const stream = (this.stream = this._getStream(input || this.input));
    const zip = unzip.Parse({forceStream: true});
    stream.pipe(zip);

    // worksheets, deferred for parsing after shared strings reading
    const waitingWorkSheets: WaitingWorksheet[] = [];

    for await (const entry of iterateStream(zip)) {
      let match;
      let sheetNo;
      switch (entry.path) {
        case '_rels/.rels':
          break;
        case 'xl/_rels/workbook.xml.rels':
          await this._parseRels(entry);
          break;
        case 'xl/workbook.xml':
          await this._parseWorkbook(entry);
          break;
        case 'xl/sharedStrings.xml':
          for await (const item of this._parseSharedStrings(entry)) {
            yield {eventType: 'shared-strings', value: item};
          }
          break;
        case 'xl/styles.xml':
          await this._parseStyles(entry);
          break;
        default:
          if (entry.path.match(/xl\/worksheets\/sheet\d+[.]xml/)) {
            match = entry.path.match(/xl\/worksheets\/sheet(\d+)[.]xml/);
            sheetNo = match![1];
            if (this.sharedStrings && this.workbookRels) {
              yield* this._parseWorksheet(iterateStream(entry), sheetNo);
            } else {
              // create temp file for each worksheet
              await new Promise<void>((resolve, reject) => {
                tmp.file((err: any, path: string, fd: number, tempFileCleanupCallback: () => void) => {
                  if (err) {
                    return reject(err);
                  }
                  waitingWorkSheets.push({sheetNo, path, tempFileCleanupCallback});

                  const tempStream = fs.createWriteStream(path);
                  tempStream.on('error', reject);
                  entry.pipe(tempStream);
                  return tempStream.on('finish', () => {
                    return resolve();
                  });
                });
              });
            }
          } else if (entry.path.match(/xl\/worksheets\/_rels\/sheet\d+[.]xml.rels/)) {
            match = entry.path.match(/xl\/worksheets\/_rels\/sheet(\d+)[.]xml.rels/);
            sheetNo = match![1];
            yield* this._parseHyperlinks(iterateStream(entry), sheetNo);
          }
          break;
      }
      entry.autodrain();
    }

    for (const {sheetNo, path, tempFileCleanupCallback} of waitingWorkSheets) {
      let fileStream: any = fs.createReadStream(path);
      // TODO: Remove once node v8 is deprecated
      // Detect and upgrade old fileStreams
      if (!fileStream[Symbol.asyncIterator]) {
        fileStream = fileStream.pipe(new PassThrough());
      }
      yield* this._parseWorksheet(fileStream, sheetNo);
      tempFileCleanupCallback();
    }
  }

  _emitEntry(payload: any): void {
    if (this.options.entries === 'emit') {
      this.emit('entry', payload);
    }
  }

  async _parseRels(entry: any): Promise<void> {
    const xform = new RelationshipsXform();
    this.workbookRels = await xform.parseStream(iterateStream(entry));
  }

  async _parseWorkbook(entry: any): Promise<void> {
    this._emitEntry({type: 'workbook'});

    const workbook = new WorkbookXform();
    this.model = await workbook.parseStream(iterateStream(entry));

    this.properties = workbook.map.workbookPr;
  }

  async *_parseSharedStrings(entry: any): AsyncIterableIterator<{index: number; text: any}> {
    this._emitEntry({type: 'shared-strings'});
    switch (this.options.sharedStrings) {
      case 'cache':
        this.sharedStrings = [];
        break;
      case 'emit':
        break;
      default:
        return;
    }

    let text: string | null = null;
    let richText: any[] = [];
    let index = 0;
    let font: any = null;
    for await (const events of parseSax(iterateStream(entry))) {
      for (const {eventType, value} of events) {
        if (eventType === 'opentag') {
          const node = value;
          switch (node.name) {
            case 'b':
              font = font || {};
              font.bold = true;
              break;
            case 'charset':
              font = font || {};
              font.charset = parseInt(node.attributes.charset, 10);
              break;
            case 'color':
              font = font || {};
              font.color = {};
              if (node.attributes.rgb) {
                font.color.argb = node.attributes.argb;
              }
              if (node.attributes.val) {
                font.color.argb = node.attributes.val;
              }
              if (node.attributes.theme) {
                font.color.theme = node.attributes.theme;
              }
              break;
            case 'family':
              font = font || {};
              font.family = parseInt(node.attributes.val, 10);
              break;
            case 'i':
              font = font || {};
              font.italic = true;
              break;
            case 'outline':
              font = font || {};
              font.outline = true;
              break;
            case 'rFont':
              font = font || {};
              font.name = node.value;
              break;
            case 'si':
              font = null;
              richText = [];
              text = null;
              break;
            case 'sz':
              font = font || {};
              font.size = parseInt(node.attributes.val, 10);
              break;
            case 'strike':
              break;
            case 't':
              text = null;
              break;
            case 'u':
              font = font || {};
              font.underline = true;
              break;
            case 'vertAlign':
              font = font || {};
              font.vertAlign = node.attributes.val;
              break;
          }
        } else if (eventType === 'text') {
          text = text ? text + value : value;
        } else if (eventType === 'closetag') {
          const node = value;
          switch (node.name) {
            case 'r':
              richText.push({
                font,
                text,
              });

              font = null;
              text = null;
              break;
            case 'si':
              if (this.options.sharedStrings === 'cache') {
                this.sharedStrings!.push(richText.length ? {richText} : text);
              } else if (this.options.sharedStrings === 'emit') {
                yield {index: index++, text: richText.length ? {richText} : text};
              }

              richText = [];
              font = null;
              text = null;
              break;
          }
        }
      }
    }
  }

  async _parseStyles(entry: any): Promise<void> {
    this._emitEntry({type: 'styles'});
    if (this.options.styles === 'cache') {
      this.styles = new StyleManager();
      await this.styles.parseStream(iterateStream(entry));
    }
  }

  *_parseWorksheet(iterator: any, sheetNo: string): IterableIterator<{eventType: string; value: any}> {
    this._emitEntry({type: 'worksheet', id: sheetNo});
    const worksheetReader = new WorksheetReader({
      workbook: this,
      id: parseInt(sheetNo, 10),
      iterator,
      options: this.options,
    });

    const matchingRel = (this.workbookRels || []).find((rel: any) => rel.Target === `worksheets/sheet${sheetNo}.xml`);
    const matchingSheet = matchingRel && (this.model.sheets || []).find((sheet: any) => sheet.rId === matchingRel.Id);
    if (matchingSheet) {
      worksheetReader.id = matchingSheet.id;
      worksheetReader.name = matchingSheet.name;
      worksheetReader.state = matchingSheet.state;
    }
    if (this.options.worksheets === 'emit') {
      yield {eventType: 'worksheet', value: worksheetReader};
    }
  }

  *_parseHyperlinks(iterator: any, sheetNo: string): IterableIterator<{eventType: string; value: any}> {
    this._emitEntry({type: 'hyperlinks', id: sheetNo});
    const hyperlinksReader = new HyperlinkReader({
      workbook: this,
      id: parseInt(sheetNo, 10),
      iterator,
      options: this.options,
    });
    if (this.options.hyperlinks === 'emit') {
      yield {eventType: 'hyperlinks', value: hyperlinksReader};
    }
  }
}

// for reference - these are the valid values for options
namespace WorkbookReader {
  export const Options = {
    worksheets: ['emit', 'ignore'],
    sharedStrings: ['cache', 'emit', 'ignore'],
    hyperlinks: ['cache', 'emit', 'ignore'],
    styles: ['cache', 'ignore'],
    entries: ['emit', 'ignore'],
  };
}

export default WorkbookReader;
