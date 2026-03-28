/** Inflation / Purchasing power calculator */

export interface InflationInput {
  /** Amount in original year */
  amount: number;
  /** Annual inflation rate as percentage */
  annualInflation: number;
  /** Number of years */
  years: number;
}

export interface InflationResult {
  /** Equivalent amount adjusted for inflation */
  adjustedAmount: number;
  /** Purchasing power lost as percentage */
  purchasingPowerLost: number;
  /** Year-by-year breakdown */
  yearByYear: { year: number; value: number }[];
}

/**
 * Calculate the effect of inflation on purchasing power.
 * Adjusted = Amount / (1 + rate)^years  (what amount buys today in future terms)
 * Or: Adjusted = Amount * (1 + rate)^years  (what you need in the future to match today's amount)
 *
 * We calculate: "X€ of [years ago] = Y€ today" → future value (what you'd need)
 */
export function calculateInflation(input: InflationInput): InflationResult {
  const { amount, annualInflation, years } = input;
  const rate = annualInflation / 100;

  const yearByYear: { year: number; value: number }[] = [];
  let value = amount;

  for (let y = 1; y <= years; y++) {
    value = value * (1 + rate);
    yearByYear.push({ year: y, value: round2(value) });
  }

  const adjustedAmount = round2(value);
  const purchasingPowerLost = round2(((adjustedAmount - amount) / adjustedAmount) * 100);

  return {
    adjustedAmount,
    purchasingPowerLost,
    yearByYear,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
