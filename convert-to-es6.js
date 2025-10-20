const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Find all TypeScript files in lib directory
const tsFiles = glob.sync('lib/**/*.ts', { cwd: __dirname });

console.log(`Found ${tsFiles.length} TypeScript files to convert`);

let filesChanged = 0;
let errors = [];

tsFiles.forEach((file) => {
  const filePath = path.join(__dirname, file);
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  try {
    // Convert import statements: import X = require('y') -> import X from 'y'
    // Handle cases with spaces and different quote types
    content = content.replace(/^import\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?$/gm, "import $1 from '$2';");
    
    // Convert const requires: const X = require('y') -> import X from 'y'
    content = content.replace(/^const\s+(\w+)\s*=\s*require\(['"]([^'"]+)['"]\);?$/gm, "import $1 from '$2';");
    
    // Convert destructured const requires: const {X, Y} = require('z') -> import {X, Y} from 'z'
    content = content.replace(/^const\s+\{([^}]+)\}\s*=\s*require\(['"]([^'"]+)['"]\);?$/gm, "import {$1} from '$2';");
    
    // Convert export = X -> export default X
    content = content.replace(/^export\s*=\s*([^;]+);?$/gm, 'export default $1;');
    
    // Write back if changed
    if (content !== originalContent) {
      fs.writeFileSync(filePath, content, 'utf8');
      filesChanged++;
      console.log(`✓ Converted: ${file}`);
    }
  } catch (error) {
    errors.push({ file, error: error.message });
    console.error(`✗ Error in ${file}: ${error.message}`);
  }
});

console.log(`\nConversion complete!`);
console.log(`Files changed: ${filesChanged}`);
console.log(`Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log('\nErrors:');
  errors.forEach(({ file, error }) => {
    console.log(`  - ${file}: ${error}`);
  });
}
