export type NavScreen = 'dashboard' | 'profile' | 'expenses' | 'emergency-fund' | 'goals-and-what-if' | 'learn';

export interface UserProfile {
  name: string;
  age: number;
  occupation: string;
  monthlyIncome: number;
  annualIncome: number;
  riskPreference: 'Conservative (Suraksha)' | 'Balanced Growth (Madhyam Marg)' | 'Aggressive Growth (Tejas)';
  taxRegime: 'new' | 'old';
  email: string;
  location: string;
  epfUan: string;
  panCard: string;
}

export type ExpenseCategory =
  | 'Housing'
  | 'Ration'
  | 'Food'
  | 'Transit'
  | 'Healthcare'
  | 'Utilities'
  | 'Shopping'
  | 'Entertainment'
  | 'Travel'
  | 'Dining'
  | 'Decor'
  | 'Digital'
  | 'Leisure'
  | 'Education'
  | 'Subscriptions'
  | 'Family'
  | 'Other';

export interface ExpenseRecord {
  id: string;
  name: string;
  category: ExpenseCategory;
  date: string;
  nature: 'Need' | 'Want';
  channel: 'UPI' | 'NetBanking' | 'Credit Card' | 'Cash';
  amount: number;
  icon: string;
  notes?: string;
}

export interface GoalItem {
  id: string;
  title: string;
  categoryName: string;
  horizonTag: string;
  badgeText: string;
  badgeType: 'auspicious' | 'on-track' | 'compounding' | 'horizon';
  targetAmount: number;
  currentAmount: number;
  percent: number;
  monthlyAllocation: number;
  projectedDate: string;
  timelineDetails: string;
  icon: string;
  priority?: 'high' | 'medium' | 'low';
  completed?: boolean;
}

export interface EmergencyFundData {
  targetMonths: number;
  currentAmount: number;
  customMonthlyExpense?: number;
  tier1Split: number; // Percentage for high-yield savings (e.g. 37%)
  tier2Split: number; // Percentage for liquid mutual funds (e.g. 44.4%)
  tier3Split: number; // Percentage for sweeping FDs (e.g. 18.6%)
}

export interface AllocationSettings {
  savings: number; // %
  needs: number;    // %
  goals: number;    // %
  wants: number;    // %
  buffer: number;   // %
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'auspicious' | 'system' | 'alert';
  read: boolean;
}

export interface FinancialHealthBreakdown {
  score: number;
  savingsRateScore: number;
  savingsRateValue: number;
  emergencyScore: number;
  emergencyMonthsValue: number;
  disciplineScore: number;
  needsRatioValue: number;
  goalsScore: number;
  goalsProgressValue: number;
  summary: string;
}
