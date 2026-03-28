import { describe, it, expect } from 'vitest';
import { calculateMortgage } from '../src/mortgage.js';

describe('calculateMortgage', () => {
  it('calculates standard 200k mortgage at 3% over 30 years', () => {
    const result = calculateMortgage({ principal: 200000, annualRate: 3, years: 30 });
    // Known: monthly payment ≈ 843.21
    expect(result.monthlyPayment).toBeCloseTo(843.21, 0);
    expect(result.amortization).toHaveLength(360);
    expect(result.totalInterest).toBeGreaterThan(0);
    expect(result.totalPayment).toBeCloseTo(result.totalInterest + 200000, 0);
  });

  it('calculates zero interest loan', () => {
    const result = calculateMortgage({ principal: 120000, annualRate: 0, years: 10 });
    expect(result.monthlyPayment).toBe(1000);
    expect(result.totalInterest).toBe(0);
  });

  it('amortization table ends at zero balance', () => {
    const result = calculateMortgage({ principal: 100000, annualRate: 5, years: 15 });
    const last = result.amortization[result.amortization.length - 1];
    expect(last.balance).toBeCloseTo(0, 0);
  });

  it('first month has highest interest portion', () => {
    const result = calculateMortgage({ principal: 300000, annualRate: 4, years: 25 });
    const first = result.amortization[0];
    const last = result.amortization[result.amortization.length - 1];
    expect(first.interest).toBeGreaterThan(last.interest);
    expect(first.principal).toBeLessThan(last.principal);
  });
});
