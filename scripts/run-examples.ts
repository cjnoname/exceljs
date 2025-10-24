#!/usr/bin/env node
/**
 * 运行指定的 example 文件并报告结果
 */
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 要测试的 example 文件列表及说明
interface ExampleTest {
  file: string;
  description: string;
  outputFiles?: string[]; // 生成的文件路径（相对于项目根目录）
  args?: string[]; // 传递给脚本的参数
}

const examples: ExampleTest[] = [
  {
    file: "test-a1.ts",
    description: "测试 A1 样式单元格引用",
    outputFiles: []
  },
  {
    file: "test-colour-cell.ts",
    description: "测试单元格颜色和填充",
    outputFiles: ["src/examples/data/test-colour-cell.xlsx"],
    args: ["src/examples/data/test-colour-cell.xlsx"]
  },
  {
    file: "test-formula.ts",
    description: "测试公式功能",
    outputFiles: ["src/examples/data/test-formula.xlsx"],
    args: ["src/examples/data/test-formula.xlsx"]
  },
  {
    file: "test-hyperlink.ts",
    description: "测试超链接功能",
    outputFiles: ["src/examples/data/test-hyperlink.xlsx"],
    args: ["src/examples/data/test-hyperlink.xlsx"]
  },
  {
    file: "test-merge-align.ts",
    description: "测试单元格合并和对齐",
    outputFiles: ["src/examples/data/test-merge-align.xlsx"],
    args: ["src/examples/data/test-merge-align.xlsx"]
  },
  {
    file: "testBookOut.ts",
    description: "测试完整工作簿输出（字体、边框、填充等）",
    outputFiles: ["src/examples/data/test.xlsx"],
    args: ["src/examples/data/test.xlsx"]
  },
  {
    file: "test-table.ts",
    description: "测试 Excel 表格功能",
    outputFiles: ["src/examples/data/test-table.xlsx"],
    args: ["src/examples/data/test-table.xlsx"]
  },
  {
    file: "test-newline.ts",
    description: "测试单元格内换行",
    outputFiles: ["src/examples/data/test-newline.xlsx"],
    args: ["src/examples/data/test-newline.xlsx"]
  },
  {
    file: "testTinyBookOut.ts",
    description: "测试最小工作簿输出",
    outputFiles: ["src/examples/data/test-tiny.xlsx"],
    args: ["src/examples/data/test-tiny.xlsx"]
  }
];

interface TestResult {
  file: string;
  description: string;
  success: boolean;
  duration: number;
  error?: string;
  outputFiles?: string[];
}

async function runExample(example: ExampleTest): Promise<TestResult> {
  const startTime = Date.now();
  const examplePath = path.join(__dirname, "../src/examples", example.file);

  // 准备命令参数
  const args = ["tsx", examplePath];
  if (example.args) {
    args.push(...example.args);
  }

  return new Promise(resolve => {
    const proc = spawn("npx", args, {
      stdio: "pipe",
      cwd: path.join(__dirname, "..")
    });

    let stdout = "";
    let stderr = "";

    proc.stdout?.on("data", data => {
      stdout += data.toString();
    });

    proc.stderr?.on("data", data => {
      stderr += data.toString();
    });

    proc.on("close", code => {
      const duration = Date.now() - startTime;

      if (code === 0) {
        resolve({
          file: example.file,
          description: example.description,
          success: true,
          duration,
          outputFiles: example.outputFiles
        });
      } else {
        resolve({
          file: example.file,
          description: example.description,
          success: false,
          duration,
          error: stderr || stdout,
          outputFiles: example.outputFiles
        });
      }
    });

    proc.on("error", error => {
      resolve({
        file: example.file,
        description: example.description,
        success: false,
        duration: Date.now() - startTime,
        error: error.message,
        outputFiles: example.outputFiles
      });
    });
  });
}

async function runAll() {
  console.log(`🧪 Running ${examples.length} examples...\n`);

  const results: TestResult[] = [];

  for (const example of examples) {
    console.log(`\n📝 ${example.description}`);
    process.stdout.write(`   Testing ${example.file}... `);
    const result = await runExample(example);
    results.push(result);

    if (result.success) {
      console.log(`✅ (${result.duration}ms)`);
      if (result.outputFiles && result.outputFiles.length > 0) {
        console.log(`   📄 Output: ${result.outputFiles.join(", ")}`);
      }
    } else {
      console.log(`❌ (${result.duration}ms)`);
      if (result.error) {
        const errorLines = result.error.split("\n").slice(0, 3);
        console.log(`   ❗ Error: ${errorLines.join("\n   ")}`);
      }
    }
  }

  console.log("\n" + "=".repeat(60));
  console.log("📊 Summary:");
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📈 Total:  ${results.length}`);

  if (failed > 0) {
    console.log("\n❌ Failed examples:");
    results
      .filter(r => !r.success)
      .forEach(r => {
        console.log(`   - ${r.file}: ${r.description}`);
      });
    process.exit(1);
  } else {
    console.log("\n✨ All examples passed! Check the output files above.");
  }
}

runAll().catch(console.error);
