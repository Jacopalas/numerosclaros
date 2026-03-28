import { describe, it, expect } from 'vitest';
import { calculateRoi } from '../src/roi.js';

describe('calculateRoi', () => {
  it('calculates simple ROI', () => {
    const result = calculateRoi({ initialInvestment: 10000, finalValue: 15000, years: 3 });
    expect(result.totalRoi).toBe(50);
    expect(result.netProfit).toBe(5000);
    // CAGR: (15000/10000)^(1/3) - 1 ≈ 14.47%
    expect(result.annualizedRoi).toBeCloseTo(14.47, 1);
  });

  it('handles loss', () => {
    const result = calculateRoi({ initialInvestment: 10000, finalValue: 8000, years: 2 });
    expect(result.totalRoi).toBe(-20);
    expect(result.netProfit).toBe(-2000);
  });

  it('handles doubling in 1 year', () => {
    const result = calculateRoi({ initialInvestment: 5000, finalValue: 10000, years: 1 });
    expect(result.totalRoi).toBe(100);
    expect(result.annualizedRoi).toBe(100);
  });
});
