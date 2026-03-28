import { describe, it, expect } from 'vitest';
import { calculateEmergency } from '../src/emergency.js';

describe('calculateEmergency', () => {
  it('calculates emergency fund goal', () => {
    const result = calculateEmergency({ monthlyExpenses: 2000, targetMonths: 6 });
    expect(result.goal).toBe(12000);
    expect(result.remaining).toBe(12000);
    expect(result.percentComplete).toBe(0);
  });

  it('accounts for current savings', () => {
    const result = calculateEmergency({
      monthlyExpenses: 2000,
      targetMonths: 6,
      currentSavings: 6000,
    });
    expect(result.remaining).toBe(6000);
    expect(result.percentComplete).toBe(50);
  });

  it('calculates months to goal', () => {
    const result = calculateEmergency({
      monthlyExpenses: 1500,
      targetMonths: 3,
      currentSavings: 1000,
      monthlySavingsCapacity: 500,
    });
    expect(result.goal).toBe(4500);
    expect(result.remaining).toBe(3500);
    expect(result.monthsToGoal).toBe(7);
  });

  it('handles already complete fund', () => {
    const result = calculateEmergency({
      monthlyExpenses: 1000,
      targetMonths: 3,
      currentSavings: 5000,
    });
    expect(result.remaining).toBe(0);
    expect(result.percentComplete).toBe(100);
  });
});
