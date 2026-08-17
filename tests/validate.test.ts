import {describe, expect, it} from "vitest";
import {detectSchemaDrift, validateOpportunity} from "../src/validate.js";

const valid = {
  sourceUrl: "https://example.test/bounty",
  sourceName: "Example",
  observedAt: "2026-08-17T14:30:00Z",
  title: "Verified bounty",
  status: "open",
  submissionDeadline: "2026-08-20T00:00:00Z",
  eligibility: ["Open source contributors"],
  teamConstraints: [],
  cashPrizes: [{amount: 200, currency: "USD"}],
  inKindPrizes: [],
  credits: [],
  requiredTechnology: ["TypeScript"],
  requiredArtifacts: ["Pull request"],
  humanActions: [],
  evidence: [{field: "cashPrizes", quote: "$200 funded bounty", sourceUrl: "https://example.test/bounty"}],
  scraperVersion: "test-v1",
};

describe("opportunity validation", () => {
  it("accepts a complete evidence-backed cash opportunity", () => {
    expect(validateOpportunity(valid).ok).toBe(true);
  });

  it("rejects cash without direct evidence", () => {
    const input = {...valid, evidence: [{...valid.evidence[0], field: "title"}]};
    expect(validateOpportunity(input)).toEqual({
      ok: false,
      errors: ["cashPrizes: cash claims require direct source evidence"],
    });
  });

  it("keeps credits separate from cash", () => {
    const input = {...valid, cashPrizes: [], credits: [{amount: 50, currency: "USD"}]};
    const result = validateOpportunity(input);
    expect(result.ok && result.value.cashPrizes).toEqual([]);
    expect(result.ok && result.value.credits[0]?.amount).toBe(50);
  });

  it("fails closed when a scraper silently drops required fields", () => {
    const {eligibility: _eligibility, ...drifted} = valid;
    expect(detectSchemaDrift(drifted)).toContain("Missing required field: eligibility");
  });
});

