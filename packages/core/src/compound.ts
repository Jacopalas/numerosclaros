/** Compound interest calculator with periodic contributions */

export interface CompoundInput {
  /** Initial investment */
  principal: number;
  /** Annual interest rate as percentage */
  annualRate: number;
  /** Number of years */
  years: number;
  /** Monthly contribution (default 0) */
  monthlyContribution?: number;
  /** Compounding frequency per year (default 12) */
  compoundingFrequency?: number;
}

export interface CompoundYearRow {
  year: number;
  balance: number;
  totalContributions: number;
  totalInterest: number;
}

export interface CompoundResult {
  finalBalance: number;
  totalContributions: number;
  totalInterest: number;
  yearByYear: CompoundYearRow[];
}

/**
 * Calculate compound interest with optional periodic contributions.
 * Formula: A = P(1 + r/n)^(nt) + PMT * [((1 + r/n)^(nt) - 1) / (r/n)]
 */
export function calculateCompound(input: CompoundInput): CompoundResult {
  const { principal, annualRate, years, monthlyContribution = 0, compoundingFrequency = 12 } = input;
  const r = annualRate / 100;
  const n = compoundingFrequency;
  const periodicRate = r / n;
  const contributionPerPeriod = monthlyContribution * (12 / n);

  const yearByYear: CompoundYearRow[] = [];
  let balance = principal;
  let totalContributed = principal;

  for (let year = 1; year <= years; year++) {
    for (let period = 0; period < n; period++) {
      balance = balance * (1 + periodicRate) + contributionPerPeriod;
    }
    totalContributed += monthlyContribution * 12;

    yearByYear.push({
      year,
      balance: round2(balance),
      totalContributions: round2(totalContributed),
      totalInterest: round2(balance - totalContributed),
    });
  }

  return {
    finalBalance: round2(balance),
    totalContributions: round2(totalContributed),
    totalInterest: round2(balance - totalContributed),
    yearByYear,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
