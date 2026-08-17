import {describe, expect, it} from "vitest";
import {rankOpportunity} from "../src/rank.js";
import type {Opportunity} from "../src/schema.js";

const base: Opportunity = {
  sourceUrl: "https://example.test/bounty",
  sourceName: "Example",
  observedAt: "2026-08-17T14:30:00Z",
  title: "Bounty",
  status: "open",
  submissionDeadline: "2026-08-20T00:00:00Z",
  eligibility: ["Anyone"],
  teamConstraints: [],
  cashPrizes: [{amount: 200, currency: "USD"}],
  inKindPrizes: [],
  credits: [],
  requiredTechnology: ["TypeScript"],
  requiredArtifacts: ["Repository"],
  humanActions: [],
  evidence: [{field: "cashPrizes", quote: "$200 cash", sourceUrl: "https://example.test/bounty"}],
  scraperVersion: "test-v1",
};

describe("deterministic ranking", () => {
  it("does not count credits as cash", () => {
    const result = rankOpportunity({...base, cashPrizes: [], credits: [{amount: 5000, currency: "USD"}]}, new Date("2026-08-17T14:30:00Z"));
    expect(result.cashTotalUsd).toBe(0);
    expect(result.reasons).toContain("No verified cash prize");
  });

  it("penalizes unresolved human actions", () => {
    const now = new Date("2026-08-17T14:30:00Z");
    expect(rankOpportunity({...base, humanActions: ["Accept rules"]}, now).score)
      .toBeLessThan(rankOpportunity(base, now).score);
  });
});

