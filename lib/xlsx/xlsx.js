"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
const fs = require("fs");
const JSZip = require("jszip");
const readable_stream_1 = require("readable-stream");
const ZipStream = require("../utils/zip-stream");
const StreamBuf = require("../utils/stream-buf");
const utils = require("../utils/utils");
const XmlStream = require("../utils/xml-stream");
const browser_buffer_decode_1 = require("../utils/browser-buffer-decode");
const StylesXform = require("./xform/style/styles-xform");
const CoreXform = require("./xform/core/core-xform");
const SharedStringsXform = require("./xform/strings/shared-strings-xform");
const RelationshipsXform = require("./xform/core/relationships-xform");
const ContentTypesXform = require("./xform/core/content-types-xform");
const AppXform = require("./xform/core/app-xform");
const WorkbookXform = require("./xform/book/workbook-xform");
const WorksheetXform = require("./xform/sheet/worksheet-xform");
const DrawingXform = require("./xform/drawing/drawing-xform");
const TableXform = require("./xform/table/table-xform");
const PivotCacheRecordsXform = require("./xform/pivot-table/pivot-cache-records-xform");
const PivotCacheDefinitionXform = require("./xform/pivot-table/pivot-cache-definition-xform");
const PivotTableXform = require("./xform/pivot-table/pivot-table-xform");
const CommentsXform = require("./xform/comment/comments-xform");
const VmlNotesXform = require("./xform/comment/vml-notes-xform");
const theme1Xml = require('./xml/theme1');
function fsReadFileAsync(filename, options) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, options, (error, data) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(data);
            }
        });
    });
}
class XLSX {
    constructor(workbook) {
        this.workbook = workbook;
    }
    // ===============================================================================
    // Workbook
    // =========================================================================
    // Read
    readFile(filename, options) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(yield utils.fs.exists(filename))) {
                throw new Error(`File not found: ${filename}`);
            }
            const stream = fs.createReadStream(filename);
            try {
                const workbook = yield this.read(stream, options);
                stream.close();
                return workbook;
            }
            catch (error) {
                stream.close();
                throw error;
            }
        });
    }
    parseRels(stream) {
        const xform = new RelationshipsXform();
        return xform.parseStream(stream);
    }
    parseWorkbook(stream) {
        const xform = new WorkbookXform();
        return xform.parseStream(stream);
    }
    parseSharedStrings(stream) {
        const xform = new SharedStringsXform();
        return xform.parseStream(stream);
    }
    reconcile(model, options) {
        const workbookXform = new WorkbookXform();
        const worksheetXform = new WorksheetXform(options);
        const drawingXform = new DrawingXform();
        const tableXform = new TableXform();
        workbookXform.reconcile(model);
        // reconcile drawings with their rels
        const drawingOptions = {
            media: model.media,
            mediaIndex: model.mediaIndex,
        };
        Object.keys(model.drawings).forEach(name => {
            const drawing = model.drawings[name];
            const drawingRel = model.drawingRels[name];
            if (drawingRel) {
                drawingOptions.rels = drawingRel.reduce((o, rel) => {
                    o[rel.Id] = rel;
                    return o;
                }, {});
                (drawing.anchors || []).forEach((anchor) => {
                    const hyperlinks = anchor.picture && anchor.picture.hyperlinks;
                    if (hyperlinks && drawingOptions.rels[hyperlinks.rId]) {
                        hyperlinks.hyperlink = drawingOptions.rels[hyperlinks.rId].Target;
                        delete hyperlinks.rId;
                    }
                });
                drawingXform.reconcile(drawing, drawingOptions);
            }
        });
        // reconcile tables with the default styles
        const tableOptions = {
            styles: model.styles,
        };
        Object.values(model.tables).forEach((table) => {
            tableXform.reconcile(table, tableOptions);
        });
        const sheetOptions = {
            styles: model.styles,
            sharedStrings: model.sharedStrings,
            media: model.media,
            mediaIndex: model.mediaIndex,
            date1904: model.properties && model.properties.date1904,
            drawings: model.drawings,
            comments: model.comments,
            tables: model.tables,
            vmlDrawings: model.vmlDrawings,
        };
        model.worksheets.forEach((worksheet) => {
            worksheet.relationships = model.worksheetRels[worksheet.sheetNo];
            worksheetXform.reconcile(worksheet, sheetOptions);
        });
        // delete unnecessary parts
        delete model.worksheetHash;
        delete model.worksheetRels;
        delete model.globalRels;
        delete model.sharedStrings;
        delete model.workbookRels;
        delete model.sheetDefs;
        delete model.styles;
        delete model.mediaIndex;
        delete model.drawings;
        delete model.drawingRels;
        delete model.vmlDrawings;
    }
    _processWorksheetEntry(stream, model, sheetNo, options, path) {
        return __awaiter(this, void 0, void 0, function* () {
            const xform = new WorksheetXform(options);
            const worksheet = yield xform.parseStream(stream);
            worksheet.sheetNo = sheetNo;
            model.worksheetHash[path] = worksheet;
            model.worksheets.push(worksheet);
        });
    }
    _processCommentEntry(stream, model, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const xform = new CommentsXform();
            const comments = yield xform.parseStream(stream);
            model.comments[`../${name}.xml`] = comments;
        });
    }
    _processTableEntry(stream, model, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const xform = new TableXform();
            const table = yield xform.parseStream(stream);
            model.tables[`../tables/${name}.xml`] = table;
        });
    }
    _processWorksheetRelsEntry(stream, model, sheetNo) {
        return __awaiter(this, void 0, void 0, function* () {
            const xform = new RelationshipsXform();
            const relationships = yield xform.parseStream(stream);
            model.worksheetRels[sheetNo] = relationships;
        });
    }
    _processMediaEntry(entry, model, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            const lastDot = filename.lastIndexOf('.');
            // if we can't determine extension, ignore it
            if (lastDot >= 1) {
                const extension = filename.substr(lastDot + 1);
                const name = filename.substr(0, lastDot);
                yield new Promise((resolve, reject) => {
                    const streamBuf = new StreamBuf();
                    streamBuf.on('finish', () => {
                        model.mediaIndex[filename] = model.media.length;
                        model.mediaIndex[name] = model.media.length;
                        const medium = {
                            type: 'image',
                            name,
                            extension,
                            buffer: streamBuf.toBuffer(),
                        };
                        model.media.push(medium);
                        resolve();
                    });
                    entry.on('error', (error) => {
                        reject(error);
                    });
                    entry.pipe(streamBuf);
                });
            }
        });
    }
    _processDrawingEntry(entry, model, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const xform = new DrawingXform();
            const drawing = yield xform.parseStream(entry);
            model.drawings[name] = drawing;
        });
    }
    _processDrawingRelsEntry(entry, model, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const xform = new RelationshipsXform();
            const relationships = yield xform.parseStream(entry);
            model.drawingRels[name] = relationships;
        });
    }
    _processVmlDrawingEntry(entry, model, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const xform = new VmlNotesXform();
            const vmlDrawing = yield xform.parseStream(entry);
            model.vmlDrawings[`../drawings/${name}.vml`] = vmlDrawing;
        });
    }
    _processThemeEntry(entry, model, name) {
        return __awaiter(this, void 0, void 0, function* () {
            yield new Promise((resolve, reject) => {
                // TODO: stream entry into buffer and store the xml in the model.themes[]
                const stream = new StreamBuf();
                entry.on('error', reject);
                stream.on('error', reject);
                stream.on('finish', () => {
                    model.themes[name] = stream.read().toString();
                    resolve();
                });
                entry.pipe(stream);
            });
        });
    }
    /**
     * @deprecated since version 4.0. You should use `#read` instead. Please follow upgrade instruction: https://github.com/exceljs/exceljs/blob/master/UPGRADE-4.0.md
     */
    createInputStream() {
        throw new Error('`XLSX#createInputStream` is deprecated. You should use `XLSX#read` instead. This method will be removed in version 5.0. Please follow upgrade instruction: https://github.com/exceljs/exceljs/blob/master/UPGRADE-4.0.md');
    }
    read(stream, options) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, stream_1, stream_1_1;
            var _b, e_1, _c, _d;
            // TODO: Remove once node v8 is deprecated
            // Detect and upgrade old streams
            if (!stream[Symbol.asyncIterator] && stream.pipe) {
                stream = stream.pipe(new readable_stream_1.PassThrough());
            }
            const chunks = [];
            try {
                for (_a = true, stream_1 = __asyncValues(stream); stream_1_1 = yield stream_1.next(), _b = stream_1_1.done, !_b; _a = true) {
                    _d = stream_1_1.value;
                    _a = false;
                    const chunk = _d;
                    chunks.push(chunk);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_a && !_b && (_c = stream_1.return)) yield _c.call(stream_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            return this.load(Buffer.concat(chunks), options);
        });
    }
    load(data, options) {
        return __awaiter(this, void 0, void 0, function* () {
            let buffer;
            if (options && options.base64) {
                buffer = Buffer.from(data.toString(), 'base64');
            }
            else {
                buffer = data;
            }
            const model = {
                worksheets: [],
                worksheetHash: {},
                worksheetRels: [],
                themes: {},
                media: [],
                mediaIndex: {},
                drawings: {},
                drawingRels: {},
                comments: {},
                tables: {},
                vmlDrawings: {},
            };
            const zip = yield JSZip.loadAsync(buffer);
            for (const entry of Object.values(zip.files)) {
                /* eslint-disable no-await-in-loop */
                if (!entry.dir) {
                    let entryName = entry.name;
                    if (entryName[0] === '/') {
                        entryName = entryName.substr(1);
                    }
                    let stream;
                    if (entryName.match(/xl\/media\//) ||
                        // themes are not parsed as stream
                        entryName.match(/xl\/theme\/([a-zA-Z0-9]+)[.]xml/)) {
                        stream = new readable_stream_1.PassThrough();
                        stream.write(yield entry.async('nodebuffer'));
                    }
                    else {
                        // use object mode to avoid buffer-string convention
                        stream = new readable_stream_1.PassThrough({
                            readableObjectMode: true,
                            writableObjectMode: true,
                        });
                        stream.write((0, browser_buffer_decode_1.bufferToString)(yield entry.async('nodebuffer')));
                    }
                    stream.end();
                    let match;
                    match = entryName.match(/xl\/worksheets\/sheet(\d+)[.]xml/);
                    if (match) {
                        const sheetNo = parseInt(match[1], 10);
                        yield this._processWorksheetEntry(stream, model, sheetNo, options, entryName);
                    }
                    else {
                        switch (entryName) {
                            case '_rels/.rels':
                                model.globalRels = yield this.parseRels(stream);
                                break;
                            case 'xl/workbook.xml':
                                model.sheets = yield this.parseWorkbook(stream);
                                break;
                            case 'xl/sharedStrings.xml':
                                model.sharedStrings = yield this.parseSharedStrings(stream);
                                break;
                            case 'xl/_rels/workbook.xml.rels':
                                model.workbookRels = yield this.parseRels(stream);
                                break;
                            case 'docProps/app.xml': {
                                const xform = new AppXform();
                                model.properties = yield xform.parseStream(stream);
                                break;
                            }
                            case 'docProps/core.xml': {
                                const xform = new CoreXform();
                                Object.assign(model.properties, yield xform.parseStream(stream));
                                break;
                            }
                            case 'xl/styles.xml': {
                                const xform = new StylesXform();
                                model.styles = yield xform.parseStream(stream);
                                break;
                            }
                            default: {
                                match = entryName.match(/xl\/worksheets\/_rels\/sheet(\d+)[.]xml[.]rels/);
                                if (match) {
                                    const sheetNo = parseInt(match[1], 10);
                                    yield this._processWorksheetRelsEntry(stream, model, sheetNo);
                                    break;
                                }
                                match = entryName.match(/xl\/media\/([a-zA-Z0-9]+[.][a-zA-Z0-9]{3,4})$/);
                                if (match) {
                                    yield this._processMediaEntry(entry, model, match[1]);
                                    break;
                                }
                                match = entryName.match(/xl\/drawings\/(drawing\d+)[.]xml/);
                                if (match) {
                                    yield this._processDrawingEntry(stream, model, match[1]);
                                    break;
                                }
                                match = entryName.match(/xl\/drawings\/_rels\/(drawing\d+)[.]xml[.]rels/);
                                if (match) {
                                    yield this._processDrawingRelsEntry(stream, model, match[1]);
                                    break;
                                }
                                match = entryName.match(/xl\/drawings\/(vmlDrawing\d+)[.]vml/);
                                if (match) {
                                    yield this._processVmlDrawingEntry(stream, model, match[1]);
                                    break;
                                }
                                match = entryName.match(/xl\/comments(\d+)[.]xml/);
                                if (match) {
                                    yield this._processCommentEntry(stream, model, `comments${match[1]}`);
                                    break;
                                }
                                match = entryName.match(/xl\/tables\/(table\d+)[.]xml/);
                                if (match) {
                                    yield this._processTableEntry(stream, model, match[1]);
                                    break;
                                }
                                match = entryName.match(/xl\/theme\/([a-zA-Z0-9]+)[.]xml/);
                                if (match) {
                                    yield this._processThemeEntry(entry, model, match[1]);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
            this.reconcile(model, options);
            // apply model
            this.workbook.model = model;
            return this.workbook;
        });
    }
    // =========================================================================
    // Write
    addContentTypes(zip, model) {
        return __awaiter(this, void 0, void 0, function* () {
            const xform = new ContentTypesXform();
            const xml = xform.toXml(model);
            zip.append(xml, { name: '[Content_Types].xml' });
        });
    }
    addApp(zip, model) {
        return __awaiter(this, void 0, void 0, function* () {
            const xform = new AppXform();
            const xml = xform.toXml(model);
            zip.append(xml, { name: 'docProps/app.xml' });
        });
    }
    addCore(zip, model) {
        return __awaiter(this, void 0, void 0, function* () {
            const xform = new CoreXform();
            zip.append(xform.toXml(model), { name: 'docProps/core.xml' });
        });
    }
    addThemes(zip, _model) {
        return __awaiter(this, void 0, void 0, function* () {
            zip.append(theme1Xml, { name: 'xl/theme/theme1.xml' });
        });
    }
    addOfficeRels(zip, _model) {
        return __awaiter(this, void 0, void 0, function* () {
            const xform = new RelationshipsXform();
            const xml = xform.toXml([
                { Id: 'rId1', Type: XLSX.RelType.OfficeDocument, Target: 'xl/workbook.xml' },
                { Id: 'rId2', Type: XLSX.RelType.CoreProperties, Target: 'docProps/core.xml' },
                { Id: 'rId3', Type: XLSX.RelType.ExtenderProperties, Target: 'docProps/app.xml' },
            ]);
            zip.append(xml, { name: '_rels/.rels' });
        });
    }
    addWorkbookRels(zip, model) {
        return __awaiter(this, void 0, void 0, function* () {
            let count = 1;
            const relationships = [
                { Id: `rId${count++}`, Type: XLSX.RelType.Styles, Target: 'styles.xml' },
                { Id: `rId${count++}`, Type: XLSX.RelType.Theme, Target: 'theme/theme1.xml' },
            ];
            if (model.sharedStrings && model.sharedStrings.count) {
                relationships.push({
                    Id: `rId${count++}`,
                    Type: XLSX.RelType.SharedStrings,
                    Target: 'sharedStrings.xml',
                });
            }
            if (model.pivotTables.length) {
                relationships.push({
                    Id: `rId${count++}`,
                    Type: XLSX.RelType.PivotCacheDefinition,
                    Target: 'pivotCache/pivotCacheDefinition1.xml',
                });
            }
            model.worksheets.forEach((worksheet) => {
                worksheet.rId = `rId${count++}`;
                relationships.push({
                    Id: worksheet.rId,
                    Type: XLSX.RelType.Worksheet,
                    Target: `worksheets/sheet${worksheet.id}.xml`,
                });
            });
            const xform = new RelationshipsXform();
            const xml = xform.toXml(relationships);
            zip.append(xml, { name: 'xl/_rels/workbook.xml.rels' });
        });
    }
    addSharedStrings(zip, model) {
        return __awaiter(this, void 0, void 0, function* () {
            if (model.sharedStrings && model.sharedStrings.count) {
                zip.append(model.sharedStrings.xml, { name: 'xl/sharedStrings.xml' });
            }
        });
    }
    addStyles(zip, model) {
        return __awaiter(this, void 0, void 0, function* () {
            const { xml } = model.styles;
            if (xml) {
                zip.append(xml, { name: 'xl/styles.xml' });
            }
        });
    }
    addWorkbook(zip, model) {
        return __awaiter(this, void 0, void 0, function* () {
            const xform = new WorkbookXform();
            zip.append(xform.toXml(model), { name: 'xl/workbook.xml' });
        });
    }
    addWorksheets(zip, model) {
        return __awaiter(this, void 0, void 0, function* () {
            // preparation phase
            const worksheetXform = new WorksheetXform();
            const relationshipsXform = new RelationshipsXform();
            const commentsXform = new CommentsXform();
            const vmlNotesXform = new VmlNotesXform();
            // write sheets
            model.worksheets.forEach((worksheet) => {
                let xmlStream = new XmlStream();
                worksheetXform.render(xmlStream, worksheet);
                zip.append(xmlStream.xml, { name: `xl/worksheets/sheet${worksheet.id}.xml` });
                if (worksheet.rels && worksheet.rels.length) {
                    xmlStream = new XmlStream();
                    relationshipsXform.render(xmlStream, worksheet.rels);
                    zip.append(xmlStream.xml, { name: `xl/worksheets/_rels/sheet${worksheet.id}.xml.rels` });
                }
                if (worksheet.comments.length > 0) {
                    xmlStream = new XmlStream();
                    commentsXform.render(xmlStream, worksheet);
                    zip.append(xmlStream.xml, { name: `xl/comments${worksheet.id}.xml` });
                    xmlStream = new XmlStream();
                    vmlNotesXform.render(xmlStream, worksheet);
                    zip.append(xmlStream.xml, { name: `xl/drawings/vmlDrawing${worksheet.id}.vml` });
                }
            });
        });
    }
    addMedia(zip, model) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all(model.media.map((medium) => __awaiter(this, void 0, void 0, function* () {
                if (medium.type === 'image') {
                    const filename = `xl/media/${medium.name}.${medium.extension}`;
                    if (medium.filename) {
                        const data = yield fsReadFileAsync(medium.filename);
                        return zip.append(data, { name: filename });
                    }
                    if (medium.buffer) {
                        return zip.append(medium.buffer, { name: filename });
                    }
                    if (medium.base64) {
                        const dataimg64 = medium.base64;
                        const content = dataimg64.substring(dataimg64.indexOf(',') + 1);
                        return zip.append(content, { name: filename, base64: true });
                    }
                }
                throw new Error('Unsupported media');
            })));
        });
    }
    addDrawings(zip, model) {
        const drawingXform = new DrawingXform();
        const relsXform = new RelationshipsXform();
        model.worksheets.forEach((worksheet) => {
            const { drawing } = worksheet;
            if (drawing) {
                drawingXform.prepare(drawing);
                let xml = drawingXform.toXml(drawing);
                zip.append(xml, { name: `xl/drawings/${drawing.name}.xml` });
                xml = relsXform.toXml(drawing.rels);
                zip.append(xml, { name: `xl/drawings/_rels/${drawing.name}.xml.rels` });
            }
        });
    }
    addTables(zip, model) {
        const tableXform = new TableXform();
        model.worksheets.forEach((worksheet) => {
            const { tables } = worksheet;
            tables.forEach((table) => {
                tableXform.prepare(table, {});
                const tableXml = tableXform.toXml(table);
                zip.append(tableXml, { name: `xl/tables/${table.target}` });
            });
        });
    }
    addPivotTables(zip, model) {
        if (!model.pivotTables.length)
            return;
        const pivotTable = model.pivotTables[0];
        const pivotCacheRecordsXform = new PivotCacheRecordsXform();
        const pivotCacheDefinitionXform = new PivotCacheDefinitionXform();
        const pivotTableXform = new PivotTableXform();
        const relsXform = new RelationshipsXform();
        // pivot cache records
        let xml = pivotCacheRecordsXform.toXml(pivotTable);
        zip.append(xml, { name: 'xl/pivotCache/pivotCacheRecords1.xml' });
        // pivot cache definition
        xml = pivotCacheDefinitionXform.toXml(pivotTable);
        zip.append(xml, { name: 'xl/pivotCache/pivotCacheDefinition1.xml' });
        // pivot cache definition rels
        xml = relsXform.toXml([
            {
                Id: 'rId1',
                Type: XLSX.RelType.PivotCacheRecords,
                Target: 'pivotCacheRecords1.xml',
            },
        ]);
        zip.append(xml, { name: 'xl/pivotCache/_rels/pivotCacheDefinition1.xml.rels' });
        // pivot table
        xml = pivotTableXform.toXml(pivotTable);
        const pivotTableName = pivotTable.name;
        zip.append(xml, { name: `xl/pivotTables/${pivotTableName}.xml` });
    }
    _finalize(zip) {
        return new Promise((resolve, reject) => {
            zip.on('finish', () => {
                resolve(this);
            });
            zip.on('error', reject);
            zip.finalize();
        });
    }
    prepareModel(model, options) {
        // ensure following properties have sane values
        model.creator = model.creator || 'ExcelJS';
        model.lastModifiedBy = model.lastModifiedBy || 'ExcelJS';
        model.created = model.created || new Date();
        model.modified = model.modified || new Date();
        model.useSharedStrings = options.useSharedStrings !== undefined ? options.useSharedStrings : true;
        model.useStyles = options.useStyles !== undefined ? options.useStyles : true;
        // Manage the shared strings
        model.sharedStrings = new SharedStringsXform();
        // add a style manager to handle cell formats, fonts, etc.
        model.styles = model.useStyles ? new StylesXform(true) : new StylesXform.Mock();
        // prepare all of the things before the render
        const workbookXform = new WorkbookXform();
        const worksheetXform = new WorksheetXform();
        workbookXform.prepare(model);
        const worksheetOptions = {
            sharedStrings: model.sharedStrings,
            styles: model.styles,
            date1904: model.properties.date1904,
            drawingsCount: 0,
            media: model.media,
        };
        worksheetOptions.drawings = model.drawings = [];
        worksheetOptions.commentRefs = model.commentRefs = [];
        let tableCount = 0;
        model.tables = [];
        model.worksheets.forEach((worksheet) => {
            // assign unique filenames to tables
            worksheet.tables.forEach((table) => {
                tableCount++;
                table.target = `table${tableCount}.xml`;
                table.id = tableCount;
                model.tables.push(table);
            });
            worksheetXform.prepare(worksheet, worksheetOptions);
        });
        // TODO: workbook drawing list
    }
    write(stream, options) {
        return __awaiter(this, void 0, void 0, function* () {
            options = options || {};
            const { model } = this.workbook;
            const zip = new ZipStream.ZipWriter(options.zip);
            zip.pipe(stream);
            this.prepareModel(model, options);
            // render
            yield this.addContentTypes(zip, model);
            yield this.addOfficeRels(zip, model);
            yield this.addWorkbookRels(zip, model);
            yield this.addWorksheets(zip, model);
            yield this.addSharedStrings(zip, model); // always after worksheets
            yield this.addDrawings(zip, model);
            yield this.addTables(zip, model);
            yield this.addPivotTables(zip, model);
            yield Promise.all([this.addThemes(zip, model), this.addStyles(zip, model)]);
            yield this.addMedia(zip, model);
            yield Promise.all([this.addApp(zip, model), this.addCore(zip, model)]);
            yield this.addWorkbook(zip, model);
            return this._finalize(zip);
        });
    }
    writeFile(filename, options) {
        const stream = fs.createWriteStream(filename);
        return new Promise((resolve, reject) => {
            stream.on('finish', () => {
                resolve();
            });
            stream.on('error', (error) => {
                reject(error);
            });
            this.write(stream, options)
                .then(() => {
                stream.end();
            })
                .catch(err => {
                reject(err);
            });
        });
    }
    writeBuffer(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const stream = new StreamBuf();
            yield this.write(stream, options);
            return stream.read();
        });
    }
}
XLSX.RelType = require('./rel-type');
module.exports = XLSX;
//# sourceMappingURL=xlsx.js.map