import {readFile, writeFile} from "node:fs/promises";
import {normalizeHnJobsRun} from "./hn.js";

const [, , inputPath, outputPath, collectorId, observedAt] = process.argv;
if (!inputPath || !outputPath || !collectorId || !observedAt) {
  throw new Error(
    "Usage: npm run normalize-hn -- <private-run.json> <public-output.json> <collector-id> <observed-at>",
  );
}

const input: unknown = JSON.parse(await readFile(inputPath, "utf8"));
const output = normalizeHnJobsRun(input, collectorId, observedAt);
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, {mode: 0o644});
console.log(`Wrote ${output.count} unique public job postings`);
