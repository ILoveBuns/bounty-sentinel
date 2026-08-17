import {describe, expect, it} from "vitest";
import {proposeHeal, reviewHeal, verifyHeal} from "../src/heal.js";

const complete = {
  sourceUrl: "https://example.test/bounty",
  sourceName: "Example",
  observedAt: "2026-08-17T14:30:00Z",
  title: "Bounty",
  status: "open",
  submissionDeadline: "2026-08-20T00:00:00Z",
  eligibility: ["Anyone"],
  cashPrizes: [],
  inKindPrizes: [],
  credits: [],
  requiredTechnology: ["TypeScript"],
  requiredArtifacts: ["Repository"],
  evidence: [{field: "title", quote: "Bounty", sourceUrl: "https://example.test/bounty"}],
  scraperVersion: "v1",
};

describe("human-approved healing", () => {
  it("does not propose a repair for healthy output", () => {
    expect(proposeHeal("collector-1", "v1", complete, "2026-08-17T14:30:00Z")).toBeNull();
  });

  it("blocks drift and creates a deterministic proposal", () => {
    const {eligibility: _eligibility, ...drifted} = complete;
    const first = proposeHeal("collector-1", "v1", drifted, "2026-08-17T14:31:00Z");
    const second = proposeHeal("collector-1", "v1", drifted, "2026-08-17T14:31:00Z");

    expect(first?.id).toBe(second?.id);
    expect(first?.missingFields).toEqual(["eligibility"]);
    expect(first?.events.map((item) => item.status)).toEqual(["blocked", "proposed"]);
  });

  it("requires an explicit rationale and preserves rejection", () => {
    const {eligibility: _eligibility, ...drifted} = complete;
    const proposal = proposeHeal("collector-1", "v1", drifted, "2026-08-17T14:31:00Z");
    expect(proposal).not.toBeNull();
    if (!proposal) return;

    expect(() => reviewHeal(proposal, "approve", "2026-08-17T14:32:00Z", "")).toThrow(
      "Human review rationale is required",
    );
    const rejected = reviewHeal(
      proposal,
      "reject",
      "2026-08-17T14:32:00Z",
      "Generated selector matches a decorative eligibility label",
    );
    expect(rejected.status).toBe("rejected");
    expect(() => verifyHeal(rejected, complete, "2026-08-17T14:33:00Z")).toThrow(
      "Only an approved heal can be verified",
    );
  });

  it("reopens publication only after approval and schema parity", () => {
    const {eligibility: _eligibility, ...drifted} = complete;
    const proposal = proposeHeal("collector-1", "v1", drifted, "2026-08-17T14:31:00Z");
    expect(proposal).not.toBeNull();
    if (!proposal) return;

    const approved = reviewHeal(
      proposal,
      "approve",
      "2026-08-17T14:32:00Z",
      "Selector is scoped to the official eligibility section",
    );
    expect(() => verifyHeal(approved, drifted, "2026-08-17T14:33:00Z")).toThrow(
      "Repaired output still drifts",
    );
    const verified = verifyHeal(approved, complete, "2026-08-17T14:34:00Z");
    expect(verified.status).toBe("verified");
    expect(verified.events.at(-1)?.artifactHash).toMatch(/^[a-f0-9]{64}$/);
  });
});
