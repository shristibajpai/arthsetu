import { ExpenseRecord, GoalItem, EmergencyFundData, FinancialHealthBreakdown } from '../types';
import { clampPercent } from './formatters';

export interface ExpenseMetrics {
  totalExpenses: number;
  totalNeeds: number;
  totalWants: number;
  savings: number;
  savingsRate: number;
  needsRatio: number;
  wantsRatio: number;
  averageExpense: number;
  categoryTotals: Record<string, number>;
}

export function calculateExpenseMetrics(
  expenses: ExpenseRecord[],
  monthlyIncome: number
): ExpenseMetrics {
  const totalExpenses = expenses.reduce((acc, exp) => acc + (exp.amount || 0), 0);
  const totalNeeds = expenses
    .filter((exp) => exp.nature === 'Need')
    .reduce((acc, exp) => acc + (exp.amount || 0), 0);
  const totalWants = expenses
    .filter((exp) => exp.nature === 'Want')
    .reduce((acc, exp) => acc + (exp.amount || 0), 0);

  const savings = Math.max(0, (monthlyIncome || 0) - totalExpenses);
  const savingsRate =
    monthlyIncome > 0 ? Math.min(100, Math.max(0, (savings / monthlyIncome) * 100)) : 0;

  const needsRatio =
    totalExpenses > 0 ? clampPercent((totalNeeds / totalExpenses) * 100) : 0;
  const wantsRatio =
    totalExpenses > 0 ? clampPercent((totalWants / totalExpenses) * 100) : 0;

  const averageExpense =
    expenses.length > 0 ? Math.round(totalExpenses / expenses.length) : 0;

  const categoryTotals: Record<string, number> = {};
  expenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  return {
    totalExpenses,
    totalNeeds,
    totalWants,
    savings,
    savingsRate,
    needsRatio,
    wantsRatio,
    averageExpense,
    categoryTotals,
  };
}

export interface EmergencyMetrics {
  monthlyEssentialExpenses: number;
  targetAmount: number;
  currentAmount: number;
  remainingDeficit: number;
  monthsCovered: number;
  progressPercent: number;
  tier1Amount: number;
  tier2Amount: number;
  tier3Amount: number;
}

export function calculateEmergencyMetrics(
  emergencyData: EmergencyFundData,
  actualNeedsExpense: number
): EmergencyMetrics {
  // Use custom monthly expense if set, otherwise default to actual Needs or fallback
  const monthlyEssentialExpenses =
    emergencyData.customMonthlyExpense && emergencyData.customMonthlyExpense > 0
      ? emergencyData.customMonthlyExpense
      : actualNeedsExpense > 0
      ? actualNeedsExpense
      : 50000;

  const targetAmount = Math.max(0, monthlyEssentialExpenses * (emergencyData.targetMonths || 6));
  const currentAmount = Math.max(0, emergencyData.currentAmount || 0);
  const remainingDeficit = Math.max(0, targetAmount - currentAmount);

  const monthsCovered =
    monthlyEssentialExpenses > 0
      ? Number((currentAmount / monthlyEssentialExpenses).toFixed(1))
      : 0;

  const progressPercent =
    targetAmount > 0 ? clampPercent((currentAmount / targetAmount) * 100) : 0;

  const tier1Amount = Math.round((currentAmount * (emergencyData.tier1Split || 37)) / 100);
  const tier2Amount = Math.round((currentAmount * (emergencyData.tier2Split || 44.4)) / 100);
  const tier3Amount = Math.max(0, currentAmount - tier1Amount - tier2Amount);

  return {
    monthlyEssentialExpenses,
    targetAmount,
    currentAmount,
    remainingDeficit,
    monthsCovered,
    progressPercent,
    tier1Amount,
    tier2Amount,
    tier3Amount,
  };
}

export function calculateFinancialHealth(
  monthlyIncome: number,
  totalExpenses: number,
  totalNeeds: number,
  emergencyMonthsCovered: number,
  goals: GoalItem[]
): FinancialHealthBreakdown {
  if (monthlyIncome <= 0) {
    return {
      score: 30,
      savingsRateScore: 0,
      savingsRateValue: 0,
      emergencyScore: 10,
      emergencyMonthsValue: 0,
      disciplineScore: 10,
      needsRatioValue: 0,
      goalsScore: 10,
      goalsProgressValue: 0,
      summary: 'Add your monthly income in Profile to generate a comprehensive financial health audit.',
    };
  }

  // 1. Savings Rate Pillar (Max 30 pts)
  // Benchmark: >= 30% savings rate awards full 30 pts
  const savings = Math.max(0, monthlyIncome - totalExpenses);
  const savingsRate = (savings / monthlyIncome) * 100;
  const savingsRateScore = Math.min(30, Math.round((savingsRate / 30) * 30));

  // 2. Emergency Fund Runway (Max 25 pts)
  // Benchmark: >= 6.0 months runway awards full 25 pts
  const emergencyScore = Math.min(25, Math.round((emergencyMonthsCovered / 6) * 25));

  // 3. Needs vs Wants Fiscal Discipline (Max 25 pts)
  // Benchmark: Expenses to income <= 70% and wants under control
  const expenseToIncomeRatio = (totalExpenses / monthlyIncome) * 100;
  let disciplineScore = 25;
  if (expenseToIncomeRatio > 90) {
    disciplineScore = 8;
  } else if (expenseToIncomeRatio > 75) {
    disciplineScore = 15;
  } else if (expenseToIncomeRatio > 60) {
    disciplineScore = 20;
  }
  const needsRatio = totalExpenses > 0 ? (totalNeeds / totalExpenses) * 100 : 0;

  // 4. Goals Momentum (Max 20 pts)
  // Benchmark: Active goals with progressive funding
  let avgGoalProgress = 0;
  if (goals.length > 0) {
    const totalPercent = goals.reduce((acc, g) => {
      const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0;
      return acc + Math.min(100, pct);
    }, 0);
    avgGoalProgress = Math.round(totalPercent / goals.length);
  } else {
    avgGoalProgress = 50; // Neutral baseline if starting
  }
  const goalsScore = Math.min(20, Math.round((avgGoalProgress / 100) * 20));

  const totalScore = Math.min(
    100,
    Math.max(10, savingsRateScore + emergencyScore + disciplineScore + goalsScore)
  );

  let summary = 'Auspicious Financial Balance';
  if (totalScore >= 85) {
    summary = 'Param Shrestha: Resilient Wealth Architecture & Fortress Protection';
  } else if (totalScore >= 70) {
    summary = 'Shubh Santulan: Steady Compounding with Strong Runway';
  } else if (totalScore >= 50) {
    summary = 'Madhyam Marg: Moderate Buffer with Expansion Room';
  } else {
    summary = 'Prarambhik: Enhance Emergency Buffer and Curtail Non-Essential Outflows';
  }

  return {
    score: totalScore,
    savingsRateScore,
    savingsRateValue: Math.round(savingsRate),
    emergencyScore,
    emergencyMonthsValue: Number(emergencyMonthsCovered.toFixed(1)),
    disciplineScore,
    needsRatioValue: Math.round(needsRatio),
    goalsScore,
    goalsProgressValue: avgGoalProgress,
    summary,
  };
}
