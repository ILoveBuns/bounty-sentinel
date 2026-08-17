import {createHash} from "node:crypto";
import {z} from "zod";

const postingSchema = z.object({
  title: z.string().trim().min(1).max(240),
  url: z.url(),
});

const pageSchema = z.object({
  job_postings: z.array(postingSchema).default([]),
}).passthrough();

const runSchema = z.array(pageSchema);

export type PublicJobsRun = {
  sourceUrl: string;
  collectorId: string;
  observedAt: string;
  count: number;
  sourceDigest: string;
  jobs: Array<{title: string; url: string}>;
};

export function normalizeHnJobsRun(
  input: unknown,
  collectorId: string,
  observedAt: string,
): PublicJobsRun {
  const pages = runSchema.parse(input);
  const jobsByUrl = new Map<string, {title: string; url: string}>();
  for (const page of pages) {
    for (const posting of page.job_postings) {
      const url = new URL(posting.url);
      if (url.protocol !== "https:" || url.hostname !== "news.ycombinator.com") {
        continue;
      }
      jobsByUrl.set(url.toString(), posting);
    }
  }
  const jobs = [...jobsByUrl.values()].sort((left, right) => left.url.localeCompare(right.url));
  return {
    sourceUrl: "https://news.ycombinator.com/jobs",
    collectorId,
    observedAt: z.iso.datetime().parse(observedAt),
    count: jobs.length,
    sourceDigest: createHash("sha256").update(JSON.stringify(input)).digest("hex"),
    jobs,
  };
}
