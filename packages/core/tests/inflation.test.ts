import { describe, it, expect } from 'vitest';
import { calculateInflation } from '../src/inflation.js';

describe('calculateInflation', () => {
  it('calculates inflation over 10 years at 3%', () => {
    const result = calculateInflation({ amount: 100, annualInflation: 3, years: 10 });
    // 100 * (1.03)^10 ≈ 134.39
    expect(result.adjustedAmount).toBeCloseTo(134.39, 1);
    expect(result.yearByYear).toHaveLength(10);
  });

  it('high inflation has bigger impact', () => {
    const low = calculateInflation({ amount: 1000, annualInflation: 2, years: 20 });
    const high = calculateInflation({ amount: 1000, annualInflation: 5, years: 20 });
    expect(high.adjustedAmount).toBeGreaterThan(low.adjustedAmount);
    expect(high.purchasingPowerLost).toBeGreaterThan(low.purchasingPowerLost);
  });

  it('zero inflation keeps same value', () => {
    const result = calculateInflation({ amount: 500, annualInflation: 0, years: 5 });
    expect(result.adjustedAmount).toBe(500);
    expect(result.purchasingPowerLost).toBe(0);
  });
});
