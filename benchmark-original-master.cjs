/* eslint-disable no-console */
const { WorkbookReader } = require('./lib/exceljs.nodejs.js');

const runs = 3;

runProfiling('huge xlsx file async iteration', async () => {
  const workbookReader = new WorkbookReader('spec/integration/data/huge.xlsx');
  let worksheetCount = 0;
  let rowCount = 0;
  for await (const worksheetReader of workbookReader) {
    worksheetCount += 1;
    console.log(`Reading worksheet ${worksheetCount}`);
    for await (const row of worksheetReader) {
      rowCount += 1;
      if (rowCount % 50000 === 0) console.log(`Reading row ${rowCount}`);
    }
  }
  console.log(`Processed ${worksheetCount} worksheets and ${rowCount} rows`);
});

async function runProfiling(name, run) {
  console.log('');
  console.log('####################################################');
  console.log(`WARMUP: Current memory usage: ${currentMemoryUsage({ runGarbageCollector: true })} MB`);
  console.log(`WARMUP: ${name} profiling started`);
  const warmupStartTime = Date.now();
  await run();
  console.log(`WARMUP: ${name} profiling finished in ${Date.now() - warmupStartTime}ms`);
  console.log(`WARMUP: Current memory usage (before GC): ${currentMemoryUsage({ runGarbageCollector: false })} MB`);
  console.log(`WARMUP: Current memory usage (after GC): ${currentMemoryUsage({ runGarbageCollector: true })} MB`);

  for (let i = 1; i <= runs; i += 1) {
    console.log('');
    console.log('####################################################');
    console.log(`RUN ${i}: ${name} profiling started`);
    const startTime = Date.now();
    await run();
    console.log(`RUN ${i}: ${name} profiling finished in ${Date.now() - startTime}ms`);
    console.log(`RUN ${i}: Current memory usage (before GC): ${currentMemoryUsage({ runGarbageCollector: false })} MB`);
    console.log(`RUN ${i}: Current memory usage (after GC): ${currentMemoryUsage({ runGarbageCollector: true })} MB`);
  }
}

function currentMemoryUsage({ runGarbageCollector }) {
  if (runGarbageCollector) global.gc();
  return Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100;
}
