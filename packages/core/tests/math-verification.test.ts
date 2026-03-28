import { describe, test, expect } from 'vitest';
import { calculateMortgage } from '../src/mortgage.js';
import { calculateCompound } from '../src/compound.js';
import { calculateRoi } from '../src/roi.js';
import { calculateInflation } from '../src/inflation.js';
import { calculateDebt } from '../src/debt.js';
import { calculateBudget } from '../src/budget.js';
import { calculateEmergency } from '../src/emergency.js';
import { calculateSavings } from '../src/savings.js';

// =============================================================================
// Manual calculation verification tests
// Each test verifies a formula against a hand-computed expected value.
// =============================================================================

describe('Mortgage — PMT formula manual verification', () => {
  test('standard PMT: P=200000, rate=3%, 30 years → monthly ≈ 843.21', () => {
    // r = 0.03/12 = 0.0025, n = 360
    // (1.0025)^360 = 2.456354...
    // M = 200000 * (0.0025 * 2.456354) / (2.456354 - 1) = 843.21
    const result = calculateMortgage({ principal: 200000, annualRate: 3, years: 30 });
    expect(result.monthlyPayment).toBeCloseTo(843.21, 2);
  });

  test('total interest = M*n - P for 200k mortgage', () => {
    const result = calculateMortgage({ principal: 200000, annualRate: 3, years: 30 });
    // totalInterest = M*n - P ≈ 103,555 (iterative rounding yields 103554.90)
    expect(result.totalInterest).toBeCloseTo(103554.90, 0);
  });

  test('zero interest: P=120000, rate=0%, 10 years → monthly = 1000', () => {
    const result = calculateMortgage({ principal: 120000, annualRate: 0, years: 10 });
    expect(result.monthlyPayment).toBeCloseTo(1000.00, 2);
    expect(result.totalInterest).toBeCloseTo(0, 2);
  });

  test('first month interest = P * r = 200000 * 0.0025 = 500.00', () => {
    const result = calculateMortgage({ principal: 200000, annualRate: 3, years: 30 });
    const first = result.amortization[0];
    expect(first.interest).toBeCloseTo(500.00, 2);
  });

  test('last month balance = 0', () => {
    const result = calculateMortgage({ principal: 200000, annualRate: 3, years: 30 });
    const last = result.amortization[result.amortization.length - 1];
    expect(last.balance).toBeCloseTo(0, 0);
  });

  test('amortization length equals n = years * 12', () => {
    const result = calculateMortgage({ principal: 150000, annualRate: 4.5, years: 20 });
    expect(result.amortization).toHaveLength(240);
  });
});

describe('Compound Interest — FV formula manual verification', () => {
  test('principal only: P=10000, rate=5%, 10 years, monthly compounding → FV ≈ 16470.09', () => {
    // FV = 10000 * (1 + 0.05/12)^(120) = 10000 * 1.647009... = 16470.09
    const result = calculateCompound({
      principal: 10000,
      annualRate: 5,
      years: 10,
      monthlyContribution: 0,
      compoundingFrequency: 12,
    });
    expect(result.finalBalance).toBeCloseTo(16470.09, 0);
    expect(result.totalContributions).toBeCloseTo(10000, 2);
    expect(result.totalInterest).toBeCloseTo(6470.09, 0);
  });

  test('contributions only: P=0, monthly=500, rate=7%, 20 years', () => {
    // FV of annuity = 500 * [((1+0.07/12)^240 - 1) / (0.07/12)]
    // (1 + 0.005833...)^240 ≈ 4.03838
    // = 500 * (4.03838 - 1) / 0.005833 ≈ 260,464.95
    const result = calculateCompound({
      principal: 0,
      annualRate: 7,
      years: 20,
      monthlyContribution: 500,
      compoundingFrequency: 12,
    });
    expect(result.finalBalance).toBeCloseTo(260463, 0);
    expect(result.totalContributions).toBeCloseTo(120000, 2); // 500 * 12 * 20
  });

  test('zero rate: principal preserved, contributions summed', () => {
    const result = calculateCompound({
      principal: 5000,
      annualRate: 0,
      years: 5,
      monthlyContribution: 100,
      compoundingFrequency: 12,
    });
    // 5000 + 100*12*5 = 11000
    expect(result.finalBalance).toBeCloseTo(11000, 2);
    expect(result.totalInterest).toBeCloseTo(0, 2);
  });
});

describe('ROI / CAGR — manual verification', () => {
  test('ROI: invest 1000, get 1500 → ROI = 50%', () => {
    const result = calculateRoi({ initialInvestment: 1000, finalValue: 1500, years: 1 });
    expect(result.totalRoi).toBeCloseTo(50, 2);
    expect(result.netProfit).toBeCloseTo(500, 2);
  });

  test('CAGR: invest 10000, worth 16000 after 5 years → CAGR ≈ 9.86%', () => {
    // CAGR = (16000/10000)^(1/5) - 1 = 1.6^0.2 - 1 ≈ 0.09856
    const result = calculateRoi({ initialInvestment: 10000, finalValue: 16000, years: 5 });
    expect(result.annualizedRoi).toBeCloseTo(9.86, 1);
    expect(result.totalRoi).toBeCloseTo(60, 2);
  });

  test('loss scenario: invest 5000, worth 3000 → ROI = -40%', () => {
    const result = calculateRoi({ initialInvestment: 5000, finalValue: 3000, years: 2 });
    expect(result.totalRoi).toBeCloseTo(-40, 2);
    expect(result.netProfit).toBeCloseTo(-2000, 2);
  });

  test('CAGR of a doubling in 7 years ≈ 10.41% (rule of 72 validation)', () => {
    // (2)^(1/7) - 1 ≈ 0.10409
    const result = calculateRoi({ initialInvestment: 10000, finalValue: 20000, years: 7 });
    expect(result.annualizedRoi).toBeCloseTo(10.41, 1);
  });
});

describe('Inflation — purchasing power manual verification', () => {
  test('1000€ at 3% for 10 years → adjusted ≈ 1343.92', () => {
    // 1000 * 1.03^10 = 1000 * 1.34392 = 1343.92
    const result = calculateInflation({ amount: 1000, annualInflation: 3, years: 10 });
    expect(result.adjustedAmount).toBeCloseTo(1343.92, 0);
  });

  test('purchasing power lost = (adjusted - original) / adjusted * 100', () => {
    // (1343.92 - 1000) / 1343.92 * 100 ≈ 25.59%
    const result = calculateInflation({ amount: 1000, annualInflation: 3, years: 10 });
    expect(result.purchasingPowerLost).toBeCloseTo(25.59, 0);
  });

  test('zero inflation preserves value', () => {
    const result = calculateInflation({ amount: 5000, annualInflation: 0, years: 20 });
    expect(result.adjustedAmount).toBeCloseTo(5000, 2);
    expect(result.purchasingPowerLost).toBeCloseTo(0, 2);
  });

  test('year-by-year array has correct length', () => {
    const result = calculateInflation({ amount: 1000, annualInflation: 2, years: 5 });
    expect(result.yearByYear).toHaveLength(5);
  });
});

describe('Debt — Snowball vs Avalanche manual verification', () => {
  test('avalanche total interest <= snowball total interest', () => {
    // Mathematical guarantee: paying highest-rate first minimizes interest
    const debts = [
      { name: 'Credit Card', balance: 5000, annualRate: 20, minimumPayment: 100 },
      { name: 'Car Loan', balance: 10000, annualRate: 6, minimumPayment: 200 },
    ];
    const result = calculateDebt(debts, 600);
    expect(result.avalanche.totalInterest).toBeLessThanOrEqual(result.snowball.totalInterest);
    expect(result.recommended).toBe('avalanche');
  });

  test('savings field equals difference between strategies', () => {
    const debts = [
      { name: 'Debt A', balance: 3000, annualRate: 18, minimumPayment: 60 },
      { name: 'Debt B', balance: 8000, annualRate: 8, minimumPayment: 160 },
    ];
    const result = calculateDebt(debts, 500);
    const diff = Math.abs(result.snowball.totalPaid - result.avalanche.totalPaid);
    expect(result.savings).toBeCloseTo(diff, 2);
  });

  test('single debt: both strategies produce identical results', () => {
    const debts = [
      { name: 'Only Debt', balance: 5000, annualRate: 10, minimumPayment: 200 },
    ];
    const result = calculateDebt(debts, 500);
    expect(result.snowball.totalPaid).toBeCloseTo(result.avalanche.totalPaid, 2);
    expect(result.snowball.totalMonths).toBe(result.avalanche.totalMonths);
  });
});

describe('Budget — 50/30/20 rule manual verification', () => {
  test('income 3000 → needs=1500, wants=900, savings=600', () => {
    const result = calculateBudget({ monthlyIncome: 3000 });
    expect(result.needs).toBeCloseTo(1500, 2);
    expect(result.wants).toBeCloseTo(900, 2);
    expect(result.savings).toBeCloseTo(600, 2);
  });

  test('yearly totals = monthly * 12', () => {
    const result = calculateBudget({ monthlyIncome: 4500 });
    expect(result.yearly.needs).toBeCloseTo(4500 * 0.5 * 12, 2);
    expect(result.yearly.wants).toBeCloseTo(4500 * 0.3 * 12, 2);
    expect(result.yearly.savings).toBeCloseTo(4500 * 0.2 * 12, 2);
    expect(result.yearly.total).toBeCloseTo(4500 * 12, 2);
  });
});

describe('Emergency Fund — manual verification', () => {
  test('expenses=2000, months=6 → goal=12000', () => {
    const result = calculateEmergency({ monthlyExpenses: 2000, targetMonths: 6 });
    expect(result.goal).toBeCloseTo(12000, 2);
  });

  test('with 5000 saved, capacity 500/month → remaining=7000, months=14', () => {
    const result = calculateEmergency({
      monthlyExpenses: 2000,
      targetMonths: 6,
      currentSavings: 5000,
      monthlySavingsCapacity: 500,
    });
    expect(result.remaining).toBeCloseTo(7000, 2);
    expect(result.monthsToGoal).toBe(14);
    expect(result.percentComplete).toBeCloseTo(41.67, 1);
  });

  test('already funded: currentSavings >= goal → remaining=0, monthsToGoal=0', () => {
    const result = calculateEmergency({
      monthlyExpenses: 1000,
      targetMonths: 3,
      currentSavings: 5000,
      monthlySavingsCapacity: 200,
    });
    expect(result.remaining).toBeCloseTo(0, 2);
    expect(result.monthsToGoal).toBe(0);
    expect(result.percentComplete).toBeCloseTo(100, 2);
  });
});

describe('Savings Goal — PMT formula manual verification', () => {
  test('no interest: goal=10000, months=24, no savings → monthly ≈ 416.67', () => {
    const result = calculateSavings({ goal: 10000, months: 24 });
    expect(result.monthlyContribution).toBeCloseTo(416.67, 2);
    expect(result.totalContributed).toBeCloseTo(10000, 0);
    expect(result.totalInterest).toBeCloseTo(0, 2);
  });

  test('with interest: goal=50000, months=120, rate=5%, savings=5000', () => {
    // FV of present savings = 5000 * (1 + 0.05/12)^120 = 5000 * 1.64700 = 8235.05
    // Needed from contributions = 50000 - 8235.05 = 41764.95
    // PMT = 41764.95 * (0.05/12) / ((1 + 0.05/12)^120 - 1)
    //      = 41764.95 * 0.004167 / 0.64700 ≈ 268.95
    const result = calculateSavings({
      goal: 50000,
      months: 120,
      currentSavings: 5000,
      annualReturn: 5,
    });
    expect(result.monthlyContribution).toBeCloseTo(269, 0);
  });

  test('timeline has correct length', () => {
    const result = calculateSavings({ goal: 5000, months: 12 });
    expect(result.timeline).toHaveLength(12);
  });

  test('final balance in timeline reaches the goal', () => {
    const result = calculateSavings({ goal: 20000, months: 48, annualReturn: 4 });
    const last = result.timeline[result.timeline.length - 1];
    expect(last.balance).toBeCloseTo(20000, 0);
  });
});
