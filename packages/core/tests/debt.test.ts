import { describe, it, expect } from 'vitest';
import { calculateDebt } from '../src/debt.js';

describe('calculateDebt', () => {
  const debts = [
    { name: 'Tarjeta A', balance: 5000, annualRate: 20, minimumPayment: 100 },
    { name: 'Tarjeta B', balance: 3000, annualRate: 15, minimumPayment: 75 },
    { name: 'Préstamo', balance: 10000, annualRate: 8, minimumPayment: 200 },
  ];

  it('avalanche pays less total interest', () => {
    const result = calculateDebt(debts, 600);
    expect(result.avalanche.totalInterest).toBeLessThanOrEqual(result.snowball.totalInterest);
    expect(result.recommended).toBe('avalanche');
  });

  it('both strategies pay off all debt', () => {
    const result = calculateDebt(debts, 600);
    const lastSnowball = result.snowball.timeline[result.snowball.timeline.length - 1];
    const lastAvalanche = result.avalanche.timeline[result.avalanche.timeline.length - 1];
    expect(lastSnowball.totalBalance).toBeCloseTo(0, 0);
    expect(lastAvalanche.totalBalance).toBeCloseTo(0, 0);
  });

  it('returns savings difference', () => {
    const result = calculateDebt(debts, 600);
    expect(result.savings).toBeGreaterThanOrEqual(0);
    expect(result.savings).toBeCloseTo(
      Math.abs(result.snowball.totalPaid - result.avalanche.totalPaid),
      0
    );
  });
});
