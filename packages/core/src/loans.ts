/** Loan comparison calculator */

export interface LoanInput {
  /** Loan name/label */
  name: string;
  /** Loan principal */
  principal: number;
  /** Annual interest rate as percentage */
  annualRate: number;
  /** Loan term in years */
  years: number;
}

export interface LoanResult {
  name: string;
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  effectiveRate: number;
}

export interface LoanComparisonResult {
  loans: LoanResult[];
  cheapestIndex: number;
}

/**
 * Compare multiple loans side by side.
 * Calculates monthly payment, total cost, and identifies the cheapest.
 */
export function compareLoans(loans: LoanInput[]): LoanComparisonResult {
  const results: LoanResult[] = loans.map((loan) => {
    const n = loan.years * 12;
    const r = loan.annualRate / 100 / 12;

    let monthlyPayment: number;
    if (r === 0) {
      monthlyPayment = loan.principal / n;
    } else {
      monthlyPayment = loan.principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    }

    const totalPayment = monthlyPayment * n;
    const totalInterest = totalPayment - loan.principal;

    return {
      name: loan.name,
      monthlyPayment: round2(monthlyPayment),
      totalPayment: round2(totalPayment),
      totalInterest: round2(totalInterest),
      effectiveRate: round2((totalInterest / loan.principal) * 100),
    };
  });

  let cheapestIndex = 0;
  for (let i = 1; i < results.length; i++) {
    if (results[i].totalPayment < results[cheapestIndex].totalPayment) {
      cheapestIndex = i;
    }
  }

  return { loans: results, cheapestIndex };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
