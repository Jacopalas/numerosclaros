/** Debt payoff calculator — Snowball vs Avalanche */

export interface DebtItem {
  name: string;
  balance: number;
  /** Annual interest rate as percentage */
  annualRate: number;
  /** Minimum monthly payment */
  minimumPayment: number;
}

export interface DebtPayoffMonth {
  month: number;
  totalBalance: number;
  totalPaid: number;
}

export interface DebtStrategyResult {
  strategy: 'snowball' | 'avalanche';
  totalMonths: number;
  totalPaid: number;
  totalInterest: number;
  timeline: DebtPayoffMonth[];
}

export interface DebtResult {
  snowball: DebtStrategyResult;
  avalanche: DebtStrategyResult;
  /** Savings by choosing the cheaper strategy */
  savings: number;
  /** Which strategy is cheaper */
  recommended: 'snowball' | 'avalanche';
}

/**
 * Compare Snowball (smallest balance first) vs Avalanche (highest rate first).
 * Extra budget goes to the priority debt after minimums are paid.
 */
export function calculateDebt(debts: DebtItem[], monthlyBudget: number): DebtResult {
  const snowball = simulate(debts, monthlyBudget, 'snowball');
  const avalanche = simulate(debts, monthlyBudget, 'avalanche');

  const recommended = avalanche.totalPaid <= snowball.totalPaid ? 'avalanche' : 'snowball';
  const savings = round2(Math.abs(snowball.totalPaid - avalanche.totalPaid));

  return { snowball, avalanche, savings, recommended };
}

function simulate(
  debtsInput: DebtItem[],
  monthlyBudget: number,
  strategy: 'snowball' | 'avalanche'
): DebtStrategyResult {
  const debts = debtsInput.map((d) => ({
    ...d,
    balance: d.balance,
    monthlyRate: d.annualRate / 100 / 12,
  }));

  // Sort: snowball by balance ascending, avalanche by rate descending
  if (strategy === 'snowball') {
    debts.sort((a, b) => a.balance - b.balance);
  } else {
    debts.sort((a, b) => b.annualRate - a.annualRate);
  }

  let totalPaid = 0;
  let month = 0;
  const timeline: DebtPayoffMonth[] = [];
  const maxMonths = 1200; // 100 years cap

  while (debts.some((d) => d.balance > 0.01) && month < maxMonths) {
    month++;
    let budget = monthlyBudget;

    // Apply interest to all debts
    for (const debt of debts) {
      if (debt.balance > 0) {
        debt.balance += debt.balance * debt.monthlyRate;
      }
    }

    // Pay minimums first
    for (const debt of debts) {
      if (debt.balance <= 0) continue;
      const payment = Math.min(debt.minimumPayment, debt.balance);
      debt.balance -= payment;
      budget -= payment;
      totalPaid += payment;
    }

    // Extra goes to priority debt
    for (const debt of debts) {
      if (debt.balance <= 0 || budget <= 0) continue;
      const extra = Math.min(budget, debt.balance);
      debt.balance -= extra;
      budget -= extra;
      totalPaid += extra;
    }

    const totalBalance = debts.reduce((sum, d) => sum + Math.max(0, d.balance), 0);
    if (month % 1 === 0) {
      timeline.push({
        month,
        totalBalance: round2(totalBalance),
        totalPaid: round2(totalPaid),
      });
    }
  }

  const totalOriginalBalance = debtsInput.reduce((sum, d) => sum + d.balance, 0);

  return {
    strategy,
    totalMonths: month,
    totalPaid: round2(totalPaid),
    totalInterest: round2(totalPaid - totalOriginalBalance),
    timeline,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
