/** Budget calculator — 50/30/20 rule */

export interface BudgetInput {
  /** Monthly net income */
  monthlyIncome: number;
}

export interface BudgetResult {
  needs: number;      // 50%
  wants: number;      // 30%
  savings: number;    // 20%
  yearly: {
    needs: number;
    wants: number;
    savings: number;
    total: number;
  };
}

/**
 * Apply the 50/30/20 budget rule.
 * 50% Needs (housing, food, utilities, insurance)
 * 30% Wants (entertainment, dining out, hobbies)
 * 20% Savings (emergency fund, investments, debt extra)
 */
export function calculateBudget(input: BudgetInput): BudgetResult {
  const { monthlyIncome } = input;

  const needs = round2(monthlyIncome * 0.5);
  const wants = round2(monthlyIncome * 0.3);
  const savings = round2(monthlyIncome * 0.2);

  return {
    needs,
    wants,
    savings,
    yearly: {
      needs: round2(needs * 12),
      wants: round2(wants * 12),
      savings: round2(savings * 12),
      total: round2(monthlyIncome * 12),
    },
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
