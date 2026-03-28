import { describe, it, expect } from 'vitest';
import { calculateCompound } from '../src/compound.js';

describe('calculateCompound', () => {
  it('calculates basic compound interest', () => {
    // 10,000 at 5% for 10 years, monthly compounding
    const result = calculateCompound({ principal: 10000, annualRate: 5, years: 10 });
    // Known: ~16,470.09
    expect(result.finalBalance).toBeCloseTo(16470, -1);
    expect(result.totalContributions).toBe(10000);
    expect(result.yearByYear).toHaveLength(10);
  });

  it('handles monthly contributions', () => {
    const result = calculateCompound({
      principal: 0,
      annualRate: 7,
      years: 20,
      monthlyContribution: 500,
    });
    // With $500/mo at 7% for 20 years → ~260k+
    expect(result.finalBalance).toBeGreaterThan(250000);
    expect(result.totalContributions).toBe(500 * 12 * 20);
    expect(result.totalInterest).toBeGreaterThan(100000);
  });

  it('zero rate just accumulates contributions', () => {
    const result = calculateCompound({
      principal: 1000,
      annualRate: 0,
      years: 5,
      monthlyContribution: 100,
    });
    expect(result.finalBalance).toBeCloseTo(7000, 0);
    expect(result.totalInterest).toBeCloseTo(0, 0);
  });
});
