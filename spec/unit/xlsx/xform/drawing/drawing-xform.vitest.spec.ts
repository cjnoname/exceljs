import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe } from 'vitest';
import testXformHelper from '../test-xform-helper';

import DrawingXform from '../../../../../lib/xlsx/xform/drawing/drawing-xform.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
  rels: {
    rId1: {Target: '../media/image1.jpg'},
    rId2: {Target: '../media/image2.jpg'},
  },
  mediaIndex: {image1: 0, image2: 1},
  media: [{}, {}],
};

// Import data files
const drawing10 = await import('./data/drawing.1.0.js').then(m => m.default);
const drawing11 = await import('./data/drawing.1.1.js').then(m => m.default);
const drawing13 = await import('./data/drawing.1.3.js').then(m => m.default);
const drawing14 = await import('./data/drawing.1.4.js').then(m => m.default);

const expectations = [
  {
    title: 'Drawing 1',
    create() {
      return new DrawingXform();
    },
    initialModel: drawing10,
    preparedModel: drawing11,
    xml: fs.readFileSync(path.join(__dirname, 'data', 'drawing.1.2.xml')).toString(),
    parsedModel: drawing13,
    reconciledModel: drawing14,
    // Now using fast-xml-parser which can handle element ordering differences
    tests: ['prepare', 'render', 'renderIn', 'parse', 'reconcile'],
    options,
  },
];

describe('DrawingXform', () => {
  testXformHelper(expectations);
});
