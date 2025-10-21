// this module allows the specs to load source code from lib/ directory

/* eslint-disable import/no-dynamic-require */

const libs = {};
const basePath = '../../lib/';

// Always load from lib/ directory (ES6+ source)
const mainMod = require('../../lib/exceljs.nodejs');

libs.exceljs = mainMod.default || mainMod;

module.exports = function verquire(path) {
  if (!libs[path]) {
    const mod = require(basePath + path);
    // Handle ES6 default exports
    libs[path] = mod.default || mod;
  }
  return libs[path];
};
