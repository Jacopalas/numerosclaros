import { describe, it, expect } from 'vitest';
import { calculateBudget } from '../src/budget.js';

describe('calculateBudget', () => {
  it('applies 50/30/20 rule correctly', () => {
    const result = calculateBudget({ monthlyIncome: 3000 });
    expect(result.needs).toBe(1500);
    expect(result.wants).toBe(900);
    expect(result.savings).toBe(600);
  });

  it('calculates yearly totals', () => {
    const result = calculateBudget({ monthlyIncome: 2500 });
    expect(result.yearly.total).toBe(30000);
    expect(result.yearly.needs).toBe(15000);
    expect(result.yearly.wants).toBe(9000);
    expect(result.yearly.savings).toBe(6000);
  });

  it('categories sum to income', () => {
    const result = calculateBudget({ monthlyIncome: 4321.50 });
    expect(result.needs + result.wants + result.savings).toBeCloseTo(4321.50, 1);
  });
});
