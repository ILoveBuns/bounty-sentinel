import {readFile} from "node:fs/promises";
import {detectSchemaDrift, validateOpportunity} from "./validate.js";
import {rankOpportunity} from "./rank.js";

const path = new URL("../fixtures/scrape-verse.json", import.meta.url);
const input: unknown = JSON.parse(await readFile(path, "utf8"));
const drift = detectSchemaDrift(input);
if (drift.length > 0) {
  throw new Error(`Fail-closed drift gate: ${drift.join("; ")}`);
}
const validated = validateOpportunity(input);
if (!validated.ok) {
  throw new Error(`Invalid scraper output: ${validated.errors.join("; ")}`);
}
console.log(JSON.stringify(rankOpportunity(validated.value, new Date("2026-08-17T14:30:00Z")), null, 2));

