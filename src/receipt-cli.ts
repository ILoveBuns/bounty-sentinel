import {readFile, writeFile} from "node:fs/promises";
import {assertReceiptIsPublicSafe, sanitizeCollectorReceipt} from "./receipt.js";

const [, , inputPath, outputPath] = process.argv;
if (!inputPath || !outputPath) {
  throw new Error("Usage: npm run sanitize-receipt -- <private-input.json> <public-output.json>");
}

const input: unknown = JSON.parse(await readFile(inputPath, "utf8"));
const receipt = sanitizeCollectorReceipt(input);
assertReceiptIsPublicSafe(receipt);
await writeFile(outputPath, `${JSON.stringify(receipt, null, 2)}\n`, {mode: 0o644});
console.log(`Wrote public-safe receipt for ${receipt.collectorId}`);
