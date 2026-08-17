import {createHash} from "node:crypto";
import {z} from "zod";

const collectorEnvelopeSchema = z.object({
  collector_id: z.string().trim().min(1),
  name: z.string().trim().min(1),
  status: z.string().trim().min(1),
  completed_steps: z.array(z.string()).default([]),
  view_url: z.url().optional(),
  created_at: z.string().optional(),
}).passthrough();

export type PublicCollectorReceipt = {
  collectorId: string;
  name: string;
  status: string;
  completedSteps: string[];
  viewUrl?: string;
  createdAt?: string;
  sourceDigest: string;
};

export function sanitizeCollectorReceipt(input: unknown): PublicCollectorReceipt {
  const parsed = collectorEnvelopeSchema.parse(input);
  const sourceDigest = createHash("sha256").update(JSON.stringify(input)).digest("hex");
  const receipt: PublicCollectorReceipt = {
    collectorId: parsed.collector_id,
    name: parsed.name,
    status: parsed.status,
    completedSteps: parsed.completed_steps,
    sourceDigest,
  };
  if (parsed.view_url) receipt.viewUrl = parsed.view_url;
  if (parsed.created_at) receipt.createdAt = parsed.created_at;
  return receipt;
}

export function assertReceiptIsPublicSafe(receipt: PublicCollectorReceipt): void {
  const serialized = JSON.stringify(receipt).toLowerCase();
  const forbidden = ["api_key", "apikey", "authorization", "bearer ", "cookie", "customer_id", "email"];
  const match = forbidden.find((term) => serialized.includes(term));
  if (match) {
    throw new Error(`Public receipt contains forbidden material: ${match}`);
  }
}
