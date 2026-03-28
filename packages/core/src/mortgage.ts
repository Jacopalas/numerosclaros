/** Mortgage / Hipoteca calculator */

export interface MortgageInput {
  /** Loan principal amount */
  principal: number;
  /** Annual interest rate as percentage (e.g. 3.5 for 3.5%) */
  annualRate: number;
  /** Loan term in years */
  years: number;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface MortgageResult {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  amortization: AmortizationRow[];
}

/**
 * Calculate monthly mortgage payment and full amortization schedule.
 * Uses standard annuity formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMortgage(input: MortgageInput): MortgageResult {
  const { principal, annualRate, years } = input;
  const n = years * 12;
  const r = annualRate / 100 / 12;

  let monthlyPayment: number;
  if (r === 0) {
    monthlyPayment = principal / n;
  } else {
    monthlyPayment = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  const amortization: AmortizationRow[] = [];
  let balance = principal;

  for (let month = 1; month <= n; month++) {
    const interest = balance * r;
    const principalPart = monthlyPayment - interest;
    balance = Math.max(0, balance - principalPart);

    amortization.push({
      month,
      payment: round2(monthlyPayment),
      principal: round2(principalPart),
      interest: round2(interest),
      balance: round2(balance),
    });
  }

  const totalPayment = monthlyPayment * n;
  const totalInterest = totalPayment - principal;

  return {
    monthlyPayment: round2(monthlyPayment),
    totalPayment: round2(totalPayment),
    totalInterest: round2(totalInterest),
    amortization,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
