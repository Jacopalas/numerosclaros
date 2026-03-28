/** Emergency fund calculator */

export interface EmergencyInput {
  /** Monthly essential expenses */
  monthlyExpenses: number;
  /** Target months of runway (typically 3-6) */
  targetMonths: number;
  /** Current savings already set aside */
  currentSavings?: number;
  /** Monthly amount you can save */
  monthlySavingsCapacity?: number;
}

export interface EmergencyResult {
  /** Total emergency fund goal */
  goal: number;
  /** How much still needed */
  remaining: number;
  /** Percentage already saved */
  percentComplete: number;
  /** Months to reach goal at current savings rate (null if no capacity provided) */
  monthsToGoal: number | null;
}

/**
 * Calculate emergency fund target and time to reach it.
 */
export function calculateEmergency(input: EmergencyInput): EmergencyResult {
  const {
    monthlyExpenses,
    targetMonths,
    currentSavings = 0,
    monthlySavingsCapacity,
  } = input;

  const goal = round2(monthlyExpenses * targetMonths);
  const remaining = round2(Math.max(0, goal - currentSavings));
  const percentComplete = goal > 0 ? round2((Math.min(currentSavings, goal) / goal) * 100) : 100;

  let monthsToGoal: number | null = null;
  if (monthlySavingsCapacity && monthlySavingsCapacity > 0 && remaining > 0) {
    monthsToGoal = Math.ceil(remaining / monthlySavingsCapacity);
  } else if (remaining === 0) {
    monthsToGoal = 0;
  }

  return { goal, remaining, percentComplete, monthsToGoal };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
