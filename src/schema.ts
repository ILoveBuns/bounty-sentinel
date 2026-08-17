import {z} from "zod";

const nonEmpty = z.string().trim().min(1);

export const moneySchema = z.object({
  amount: z.number().nonnegative(),
  currency: nonEmpty,
});

export const sourceEvidenceSchema = z.object({
  field: nonEmpty,
  quote: nonEmpty.max(280),
  sourceUrl: z.url(),
});

export const opportunitySchema = z.object({
  sourceUrl: z.url(),
  sourceName: nonEmpty,
  observedAt: z.iso.datetime(),
  title: nonEmpty,
  status: z.enum(["open", "closed", "unknown"]),
  submissionDeadline: z.iso.datetime().nullable(),
  eligibility: z.array(nonEmpty).min(1),
  teamConstraints: z.array(nonEmpty),
  cashPrizes: z.array(moneySchema),
  inKindPrizes: z.array(nonEmpty),
  credits: z.array(moneySchema),
  requiredTechnology: z.array(nonEmpty),
  requiredArtifacts: z.array(nonEmpty),
  humanActions: z.array(nonEmpty),
  evidence: z.array(sourceEvidenceSchema).min(1),
  scraperVersion: nonEmpty,
});

export type Opportunity = z.infer<typeof opportunitySchema>;

export const requiredOpportunityFields = [
  "sourceUrl",
  "sourceName",
  "observedAt",
  "title",
  "status",
  "submissionDeadline",
  "eligibility",
  "cashPrizes",
  "inKindPrizes",
  "credits",
  "requiredTechnology",
  "requiredArtifacts",
  "evidence",
  "scraperVersion",
] as const;

