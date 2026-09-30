import {
  UserProfile,
  ExpenseRecord,
  GoalItem,
  EmergencyFundData,
  AllocationSettings,
  NotificationItem,
} from '../types';
import { INITIAL_EXPENSES, INITIAL_GOALS, INITIAL_NOTIFICATIONS } from '../data/mockData';

const STORAGE_KEYS = {
  PROFILE: 'arthsetu_user_profile_v1',
  EXPENSES: 'arthsetu_expenses_v1',
  GOALS: 'arthsetu_goals_v1',
  EMERGENCY: 'arthsetu_emergency_v1',
  ALLOCATIONS: 'arthsetu_allocations_v1',
  BUDGET_LIMIT: 'arthsetu_budget_limit_v1',
  NOTIFICATIONS: 'arthsetu_notifications_v1',
  READ_ARTICLES: 'arthsetu_read_articles_v1',
};

export const DEFAULT_PROFILE: UserProfile = {
  name: 'Aarav Sharma',
  age: 34,
  occupation: 'Wealth Architect & Lead Systems Engineer',
  monthlyIncome: 185000,
  annualIncome: 2220000,
  riskPreference: 'Balanced Growth (Madhyam Marg)',
  taxRegime: 'new',
  email: 'shristiajeetbajpai@gmail.com',
  location: 'Pune, Maharashtra',
  epfUan: '100984712039',
  panCard: 'ABCPS****K',
};

export const DEFAULT_EMERGENCY_FUND: EmergencyFundData = {
  targetMonths: 6,
  currentAmount: 540000,
  customMonthlyExpense: 0,
  tier1Split: 37,
  tier2Split: 44.4,
  tier3Split: 18.6,
};

export const DEFAULT_ALLOCATIONS: AllocationSettings = {
  savings: 30,
  needs: 38,
  goals: 15,
  wants: 12,
  buffer: 5,
};

function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (err) {
    console.error(`Error loading from localStorage for key ${key}:`, err);
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving to localStorage for key ${key}:`, err);
  }
}

export function loadProfile(): UserProfile {
  return safeGet<UserProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
}

export function saveProfile(profile: UserProfile): void {
  safeSet(STORAGE_KEYS.PROFILE, profile);
}

export function loadExpenses(): ExpenseRecord[] {
  return safeGet<ExpenseRecord[]>(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
}

export function saveExpenses(expenses: ExpenseRecord[]): void {
  safeSet(STORAGE_KEYS.EXPENSES, expenses);
}

export function loadGoals(): GoalItem[] {
  return safeGet<GoalItem[]>(STORAGE_KEYS.GOALS, INITIAL_GOALS);
}

export function saveGoals(goals: GoalItem[]): void {
  safeSet(STORAGE_KEYS.GOALS, goals);
}

export function loadEmergencyFund(): EmergencyFundData {
  return safeGet<EmergencyFundData>(STORAGE_KEYS.EMERGENCY, DEFAULT_EMERGENCY_FUND);
}

export function saveEmergencyFund(data: EmergencyFundData): void {
  safeSet(STORAGE_KEYS.EMERGENCY, data);
}

export function loadAllocations(): AllocationSettings {
  return safeGet<AllocationSettings>(STORAGE_KEYS.ALLOCATIONS, DEFAULT_ALLOCATIONS);
}

export function saveAllocations(data: AllocationSettings): void {
  safeSet(STORAGE_KEYS.ALLOCATIONS, data);
}

export function loadBudgetLimit(): number {
  return safeGet<number>(STORAGE_KEYS.BUDGET_LIMIT, 112000);
}

export function saveBudgetLimit(limit: number): void {
  safeSet(STORAGE_KEYS.BUDGET_LIMIT, limit);
}

export function loadNotifications(): NotificationItem[] {
  return safeGet<NotificationItem[]>(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
}

export function saveNotifications(items: NotificationItem[]): void {
  safeSet(STORAGE_KEYS.NOTIFICATIONS, items);
}

export function loadReadArticles(): string[] {
  return safeGet<string[]>(STORAGE_KEYS.READ_ARTICLES, ['art-1']);
}

export function saveReadArticles(ids: string[]): void {
  safeSet(STORAGE_KEYS.READ_ARTICLES, ids);
}

export function resetAllData(): void {
  try {
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k));
  } catch (err) {
    console.error('Error clearing localStorage:', err);
  }
}
