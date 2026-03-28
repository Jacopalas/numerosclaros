/** Savings goal calculator */

export interface SavingsInput {
  /** Target amount to save */
  goal: number;
  /** Number of months to reach goal */
  months: number;
  /** Current savings (default 0) */
  currentSavings?: number;
  /** Expected annual return rate as percentage (default 0) */
  annualReturn?: number;
}

export interface SavingsMonthRow {
  month: number;
  contribution: number;
  interest: number;
  balance: number;
  percentComplete: number;
}

export interface SavingsResult {
  /** Required monthly contribution */
  monthlyContribution: number;
  /** Total amount contributed */
  totalContributed: number;
  /** Total interest earned */
  totalInterest: number;
  /** Month-by-month progress */
  timeline: SavingsMonthRow[];
}

/**
 * Calculate required monthly savings to reach a goal.
 * With interest: PMT = (FV - PV*(1+r)^n) * r / ((1+r)^n - 1)
 * Without interest: PMT = (FV - PV) / n
 */
export function calculateSavings(input: SavingsInput): SavingsResult {
  const { goal, months, currentSavings = 0, annualReturn = 0 } = input;
  const remaining = Math.max(0, goal - currentSavings);
  const r = annualReturn / 100 / 12;

  let monthlyContribution: number;
  if (r === 0 || months === 0) {
    monthlyContribution = months > 0 ? remaining / months : remaining;
  } else {
    // Future value of present savings
    const fvPresent = currentSavings * Math.pow(1 + r, months);
    const needed = goal - fvPresent;
    // PMT for annuity
    monthlyContribution = needed * r / (Math.pow(1 + r, months) - 1);
    monthlyContribution = Math.max(0, monthlyContribution);
  }

  const timeline: SavingsMonthRow[] = [];
  let balance = currentSavings;
  let totalContributed = 0;
  let totalInterest = 0;

  for (let month = 1; month <= months; month++) {
    const interest = balance * r;
    totalInterest += interest;
    balance += interest + monthlyContribution;
    totalContributed += monthlyContribution;

    timeline.push({
      month,
      contribution: round2(monthlyContribution),
      interest: round2(interest),
      balance: round2(balance),
      percentComplete: round2(Math.min(100, (balance / goal) * 100)),
    });
  }

  return {
    monthlyContribution: round2(monthlyContribution),
    totalContributed: round2(totalContributed),
    totalInterest: round2(totalInterest),
    timeline,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
