import {describe, expect, it} from "vitest";
import {assertReceiptIsPublicSafe, sanitizeCollectorReceipt} from "../src/receipt.js";

const privateEnvelope = {
  collector_id: "c_public_identifier",
  name: "freecad-eligible-issue",
  status: "ready",
  completed_steps: ["schema", "collector", "validation"],
  view_url: "https://brightdata.example/collectors/c_public_identifier",
  created_at: "2026-08-17T14:40:00Z",
  api_key: "must-never-leave-private-storage",
  customer_id: "private-account",
  debug: {cookie: "private-cookie"},
};

describe("collector receipt boundary", () => {
  it("keeps only the allowlisted public envelope", () => {
    const receipt = sanitizeCollectorReceipt(privateEnvelope);
    expect(receipt).toEqual({
      collectorId: "c_public_identifier",
      name: "freecad-eligible-issue",
      status: "ready",
      completedSteps: ["schema", "collector", "validation"],
      viewUrl: "https://brightdata.example/collectors/c_public_identifier",
      createdAt: "2026-08-17T14:40:00Z",
      sourceDigest: expect.stringMatching(/^[a-f0-9]{64}$/),
    });
    expect(JSON.stringify(receipt)).not.toContain("must-never-leave-private-storage");
    expect(JSON.stringify(receipt)).not.toContain("private-account");
    expect(JSON.stringify(receipt)).not.toContain("private-cookie");
  });

  it("rejects malformed envelopes", () => {
    expect(() => sanitizeCollectorReceipt({status: "ready"})).toThrow();
  });

  it("fails if an allowlisted value itself contains secret markers", () => {
    const receipt = sanitizeCollectorReceipt({...privateEnvelope, name: "Bearer private"});
    expect(() => assertReceiptIsPublicSafe(receipt)).toThrow("forbidden material: bearer ");
  });

  it("accepts a sanitized public receipt", () => {
    expect(() => assertReceiptIsPublicSafe(sanitizeCollectorReceipt(privateEnvelope))).not.toThrow();
  });
});
