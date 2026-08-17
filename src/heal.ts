import {createHash} from "node:crypto";
import {detectSchemaDrift} from "./validate.js";

export type HealStatus = "healthy" | "blocked" | "proposed" | "approved" | "rejected" | "verified";

export type AuditEvent = {
  at: string;
  status: HealStatus;
  message: string;
  artifactHash: string;
};

export type HealProposal = {
  id: string;
  collectorId: string;
  fromVersion: string;
  proposedVersion: string;
  missingFields: string[];
  status: "proposed" | "approved" | "rejected" | "verified";
  events: AuditEvent[];
};

function digest(value: unknown): string {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function event(at: string, status: HealStatus, message: string, artifact: unknown): AuditEvent {
  return {at, status, message, artifactHash: digest(artifact)};
}

export function proposeHeal(
  collectorId: string,
  fromVersion: string,
  candidateOutput: unknown,
  at: string,
): HealProposal | null {
  const drift = detectSchemaDrift(candidateOutput);
  if (drift.length === 0) {
    return null;
  }
  const missingFields = drift.map((message) => message.replace("Missing required field: ", ""));
  const seed = {collectorId, fromVersion, missingFields};
  const id = `heal-${digest(seed).slice(0, 12)}`;
  const proposedVersion = `${fromVersion}-heal-${digest(candidateOutput).slice(0, 8)}`;
  return {
    id,
    collectorId,
    fromVersion,
    proposedVersion,
    missingFields,
    status: "proposed",
    events: [
      event(at, "blocked", `Publication blocked: ${drift.join("; ")}`, candidateOutput),
      event(at, "proposed", `Repair ${proposedVersion} awaits human review`, seed),
    ],
  };
}
export function reviewHeal(
  proposal: HealProposal,
  decision: "approve" | "reject",
  at: string,
  rationale: string,
): HealProposal {
  if (proposal.status !== "proposed") {
    throw new Error(`Heal proposal is already ${proposal.status}`);
  }
  if (!rationale.trim()) {
    throw new Error("Human review rationale is required");
  }
  const status = decision === "approve" ? "approved" : "rejected";
  return {
    ...proposal,
    status,
    events: [...proposal.events, event(at, status, rationale, {decision, rationale})],
  };
}

export function verifyHeal(proposal: HealProposal, repairedOutput: unknown, at: string): HealProposal {
  if (proposal.status !== "approved") {
    throw new Error("Only an approved heal can be verified");
  }
  const remainingDrift = detectSchemaDrift(repairedOutput);
  if (remainingDrift.length > 0) {
    throw new Error(`Repaired output still drifts: ${remainingDrift.join("; ")}`);
  }
  return {
    ...proposal,
    status: "verified",
    events: [
      ...proposal.events,
      event(at, "verified", "Required schema restored; publication gate reopened", repairedOutput),
    ],
  };
}
