#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function getAllTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts') && !file.endsWith('.spec.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function convertFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Convert: import X = require('y') -> import X from 'y'
  content = content.replace(/^import\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?$/gm, "import $1 from '$2';");
  
  // Convert: const X = require('y') -> import X from 'y'
  content = content.replace(/^const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?$/gm, "import $1 from '$2';");
  
  // Convert: const {X, Y} = require('z') -> import {X, Y} from 'z'
  content = content.replace(/^const\s+\{([^}]+)\}\s*=\s*require\(['"]([^'"]+)['"]\);?$/gm, "import {$1} from '$2';");
  
  // Convert: export = X -> export default X
  content = content.replace(/^export\s*=\s*([^;]+);?$/gm, 'export default $1;');
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  
  return false;
}

const libDir = path.join(__dirname, 'lib');
const excelTs = path.join(__dirname, 'excel.ts');
const indexTs = path.join(__dirname, 'index.ts');

const tsFiles = getAllTsFiles(libDir);

// Also convert root files
if (fs.existsSync(excelTs)) {
  tsFiles.push(excelTs);
}
if (fs.existsSync(indexTs) && !indexTs.endsWith('.d.ts')) {
  tsFiles.push(indexTs);
}

console.log(`Found ${tsFiles.length} TypeScript files to convert\n`);

let filesChanged = 0;

tsFiles.forEach(file => {
  const changed = convertFile(file);
  if (changed) {
    filesChanged++;
    console.log(`✓ ${path.relative(__dirname, file)}`);
  }
});

console.log(`\n✅ Conversion complete!`);
console.log(`📝 Files changed: ${filesChanged} / ${tsFiles.length}`);
