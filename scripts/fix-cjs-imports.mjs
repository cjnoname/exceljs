#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const cjsDir = path.join(__dirname, "../dist/cjs");

function fixImports(dir) {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      fixImports(filePath);
    } else if (file.endsWith(".js")) {
      let content = fs.readFileSync(filePath, "utf8");

      // Remove .js extensions from require() calls
      content = content.replace(/require\("([^"]+)\.js"\)/g, 'require("$1")');

      fs.writeFileSync(filePath, content);
    }
  }
}

console.log("Fixing CJS imports...");
fixImports(cjsDir);

// Create package.json for CJS directory
const cjsPackageJson = {
  type: "commonjs"
};
fs.writeFileSync(path.join(cjsDir, "package.json"), JSON.stringify(cjsPackageJson, null, 2));

console.log("Done!");
