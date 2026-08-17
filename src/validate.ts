import {opportunitySchema, requiredOpportunityFields, type Opportunity} from "./schema.js";

export type ValidationResult =
  | {ok: true; value: Opportunity; warnings: string[]}
  | {ok: false; errors: string[]};

export function validateOpportunity(input: unknown): ValidationResult {
  const result = opportunitySchema.safeParse(input);
  if (!result.success) {
    return {
      ok: false,
      errors: result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`),
    };
  }

  const value = result.data;
  const warnings: string[] = [];
  const cashEvidence = value.evidence.some((item) => item.field === "cashPrizes");
  if (value.cashPrizes.length > 0 && !cashEvidence) {
    return {ok: false, errors: ["cashPrizes: cash claims require direct source evidence"]};
  }
  if (value.status === "open" && value.submissionDeadline === null) {
    warnings.push("Open opportunity has no verified submission deadline");
  }
  return {ok: true, value, warnings};
}

export function detectSchemaDrift(input: unknown): string[] {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return ["Scraper output is not an object"];
  }
  const record = input as Record<string, unknown>;
  return requiredOpportunityFields
    .filter((field) => !(field in record))
    .map((field) => `Missing required field: ${field}`);
}

