import type {Opportunity} from "./schema.js";

export type RankedOpportunity = Opportunity & {
  cashTotalUsd: number;
  score: number;
  reasons: string[];
};

const usdRates: Record<string, number> = {USD: 1, EUR: 1.1};

export function rankOpportunity(opportunity: Opportunity, now: Date): RankedOpportunity {
  const cashTotalUsd = opportunity.cashPrizes.reduce(
    (total, prize) => total + prize.amount * (usdRates[prize.currency.toUpperCase()] ?? 0),
    0,
  );
  const reasons: string[] = [];
  let score = Math.min(40, Math.log10(cashTotalUsd + 1) * 10);

  if (opportunity.status === "open") {
    score += 20;
    reasons.push("Verified open status");
  }
  if (opportunity.submissionDeadline) {
    const hours = (Date.parse(opportunity.submissionDeadline) - now.getTime()) / 3_600_000;
    if (hours > 0 && hours <= 168) {
      score += 25;
      reasons.push("Deadline is within seven days");
    }
  }
  if (opportunity.cashPrizes.length === 0) {
    reasons.push("No verified cash prize");
  } else {
    reasons.push(`Verified cash total: $${cashTotalUsd.toFixed(2)} USD equivalent`);
  }
  if (opportunity.humanActions.length > 0) {
    score -= Math.min(15, opportunity.humanActions.length * 3);
    reasons.push(`${opportunity.humanActions.length} human action(s) remain`);
  }

  return {...opportunity, cashTotalUsd, score: Math.max(0, Math.round(score)), reasons};
}

