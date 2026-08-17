import {describe, expect, it} from "vitest";
import {normalizeHnJobsRun} from "../src/hn.js";

const observedAt = "2026-08-17T15:04:00Z";

describe("Hacker News Jobs adapter", () => {
  it("flattens, deduplicates, and sorts collector pages", () => {
    const output = normalizeHnJobsRun([
      {job_postings: [{title: "Second", url: "https://news.ycombinator.com/item?id=2"}]},
      {job_postings: [{title: "First", url: "https://news.ycombinator.com/item?id=1"}]},
      {job_postings: [{title: "Second duplicate", url: "https://news.ycombinator.com/item?id=2"}]},
    ], "collector-1", observedAt);

    expect(output.count).toBe(2);
    expect(output.jobs.map((job) => job.url)).toEqual([
      "https://news.ycombinator.com/item?id=1",
      "https://news.ycombinator.com/item?id=2",
    ]);
    expect(output.sourceDigest).toMatch(/^[a-f0-9]{64}$/);
  });

  it("drops off-domain and non-HTTPS output", () => {
    const output = normalizeHnJobsRun([
      {job_postings: [{title: "External", url: "https://example.com/job"}]},
      {job_postings: [{title: "Unsafe", url: "http://news.ycombinator.com/item?id=1"}]},
    ], "collector-1", observedAt);
    expect(output.jobs).toEqual([]);
  });

  it("rejects malformed scraper output", () => {
    expect(() => normalizeHnJobsRun({jobs: []}, "collector-1", observedAt)).toThrow();
  });
});
