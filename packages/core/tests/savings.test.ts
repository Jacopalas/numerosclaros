import { describe, it, expect } from 'vitest';
import { calculateSavings } from '../src/savings.js';

describe('calculateSavings', () => {
  it('calculates monthly savings needed without interest', () => {
    const result = calculateSavings({ goal: 12000, months: 12 });
    expect(result.monthlyContribution).toBe(1000);
    expect(result.totalContributed).toBe(12000);
    expect(result.totalInterest).toBe(0);
  });

  it('interest reduces required monthly contribution', () => {
    const withoutReturn = calculateSavings({ goal: 50000, months: 60 });
    const withReturn = calculateSavings({ goal: 50000, months: 60, annualReturn: 5 });
    expect(withReturn.monthlyContribution).toBeLessThan(withoutReturn.monthlyContribution);
  });

  it('accounts for current savings', () => {
    const result = calculateSavings({ goal: 10000, months: 10, currentSavings: 5000 });
    expect(result.monthlyContribution).toBe(500);
  });

  it('timeline reaches 100% at the end', () => {
    const result = calculateSavings({ goal: 6000, months: 6 });
    const last = result.timeline[result.timeline.length - 1];
    expect(last.percentComplete).toBeCloseTo(100, 0);
    expect(last.balance).toBeCloseTo(6000, 0);
  });
});
