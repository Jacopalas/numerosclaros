/** ROI (Return on Investment) calculator */

export interface RoiInput {
  /** Initial investment amount */
  initialInvestment: number;
  /** Final value of the investment */
  finalValue: number;
  /** Investment period in years */
  years: number;
}

export interface RoiResult {
  /** Total ROI as percentage */
  totalRoi: number;
  /** Annualized ROI (CAGR) as percentage */
  annualizedRoi: number;
  /** Net profit (final - initial) */
  netProfit: number;
}

/**
 * Calculate ROI and annualized ROI (CAGR).
 * ROI = (Final - Initial) / Initial * 100
 * CAGR = ((Final / Initial)^(1/years) - 1) * 100
 */
export function calculateRoi(input: RoiInput): RoiResult {
  const { initialInvestment, finalValue, years } = input;

  const netProfit = finalValue - initialInvestment;
  const totalRoi = (netProfit / initialInvestment) * 100;

  let annualizedRoi: number;
  if (years <= 0) {
    annualizedRoi = totalRoi;
  } else {
    annualizedRoi = (Math.pow(finalValue / initialInvestment, 1 / years) - 1) * 100;
  }

  return {
    totalRoi: round2(totalRoi),
    annualizedRoi: round2(annualizedRoi),
    netProfit: round2(netProfit),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
