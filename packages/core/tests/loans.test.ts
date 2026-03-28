import { describe, it, expect } from 'vitest';
import { compareLoans } from '../src/loans.js';

describe('compareLoans', () => {
  it('identifies cheaper loan correctly', () => {
    const result = compareLoans([
      { name: 'Banco A', principal: 200000, annualRate: 3, years: 30 },
      { name: 'Banco B', principal: 200000, annualRate: 3.5, years: 30 },
    ]);
    expect(result.loans).toHaveLength(2);
    expect(result.cheapestIndex).toBe(0);
    expect(result.loans[0].totalPayment).toBeLessThan(result.loans[1].totalPayment);
  });

  it('compares different term lengths', () => {
    const result = compareLoans([
      { name: '15 años', principal: 150000, annualRate: 2.5, years: 15 },
      { name: '30 años', principal: 150000, annualRate: 3, years: 30 },
    ]);
    // 15 year loan pays less total interest
    expect(result.loans[0].totalInterest).toBeLessThan(result.loans[1].totalInterest);
    // But higher monthly payment
    expect(result.loans[0].monthlyPayment).toBeGreaterThan(result.loans[1].monthlyPayment);
  });
});
