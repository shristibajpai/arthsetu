import React, { useState, useMemo } from 'react';
import {
  NavScreen,
  GoalItem,
  UserProfile,
  ExpenseRecord,
  EmergencyFundData,
  AllocationSettings,
  FinancialHealthBreakdown,
} from '../types';
import { formatINR, formatLakhCrore, clampPercent } from '../utils/formatters';
import { calculateExpenseMetrics, calculateEmergencyMetrics } from '../utils/calculations';

interface DashboardViewProps {
  userProfile: UserProfile;
  expenses: ExpenseRecord[];
  goals: GoalItem[];
  emergencyFund: EmergencyFundData;
  allocationSettings: AllocationSettings;
  healthMetrics: FinancialHealthBreakdown;
  onNavigate: (screen: NavScreen) => void;
  onOpenAdjustAllocation: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userProfile,
  expenses,
  goals,
  emergencyFund,
  allocationSettings,
  healthMetrics,
  onNavigate,
  onOpenAdjustAllocation,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('Nov');
  const [showHealthTooltip, setShowHealthTooltip] = useState(false);

  // Compute live expense metrics
  const expenseMetrics = useMemo(
    () => calculateExpenseMetrics(expenses, userProfile.monthlyIncome),
    [expenses, userProfile.monthlyIncome]
  );

  // Compute live emergency fund metrics
  const emergencyMetrics = useMemo(
    () => calculateEmergencyMetrics(emergencyFund, expenseMetrics.totalNeeds),
    [emergencyFund, expenseMetrics.totalNeeds]
  );

  const monthlyIncome = userProfile.monthlyIncome || 185000;
  const netSavings = Math.max(0, monthlyIncome - expenseMetrics.totalExpenses);
  const savingsRate = monthlyIncome > 0 ? (netSavings / monthlyIncome) * 100 : 0;

  // Real allocation amounts based on settings and real income
  const allocSavingsAmt = Math.round((monthlyIncome * (allocationSettings?.savings || 30)) / 100);
  const allocNeedsAmt = Math.round((monthlyIncome * (allocationSettings?.needs || 38)) / 100);
  const allocGoalsAmt = Math.round((monthlyIncome * (allocationSettings?.goals || 15)) / 100);
  const allocWantsAmt = Math.round((monthlyIncome * (allocationSettings?.wants || 12)) / 100);
  const allocBufferAmt = Math.round((monthlyIncome * (allocationSettings?.buffer || 5)) / 100);

  // Dynamic cashflow data points for the year
  const cashflowData = [
    { month: 'Jan', inflow: monthlyIncome, outflow: Math.round(monthlyIncome * 0.52), note: 'Regular Baseline' },
    { month: 'Feb', inflow: monthlyIncome, outflow: Math.round(monthlyIncome * 0.49), note: 'Controlled Outlay' },
    { month: 'Mar', inflow: monthlyIncome, outflow: Math.round(monthlyIncome * 0.56), note: 'Fiscal Year End Tax' },
    { month: 'Apr', inflow: monthlyIncome, outflow: Math.round(monthlyIncome * 0.50), note: 'New FY Allocation' },
    { month: 'May', inflow: monthlyIncome, outflow: Math.round(monthlyIncome * 0.53), note: 'Summer Travel' },
    { month: 'Jun', inflow: monthlyIncome, outflow: Math.round(monthlyIncome * 0.51), note: 'School Fees' },
    { month: 'Jul', inflow: monthlyIncome, outflow: Math.round(monthlyIncome * 0.48), note: 'Monsoon Rhythm' },
    { month: 'Aug', inflow: monthlyIncome, outflow: Math.round(monthlyIncome * 0.52), note: 'Independence Day' },
    { month: 'Sep', inflow: monthlyIncome, outflow: Math.round(monthlyIncome * 0.50), note: 'Navratri Prep' },
    { month: 'Oct', inflow: Math.round(monthlyIncome * 1.45), outflow: Math.round(monthlyIncome * 0.68), note: 'Festive Bonus & Gold' },
    { month: 'Nov', inflow: monthlyIncome, outflow: expenseMetrics.totalExpenses, note: 'Current Actual Ledger' },
  ];

  const activeCashflow = cashflowData.find((c) => c.month === selectedMonth) || cashflowData[10];

  return (
    <div className="flex flex-col w-full gap-8 pb-16">
      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Personal Financial Plan / {userProfile.name}
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1 font-bold">
            Your Money, Allocated.
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
            Rooted in mindful Indian financial discipline. Every rupee is purposefully routed into
            foundational safety (*Suraksha*), daily sustenance (*Ann*), purposeful milestones
            (*Lakshya*), and joyous celebration.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenAdjustAllocation}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Adjust Monthly Allocation</span>
          </button>
        </div>
      </div>

      {/* PRIMARY FINANCIAL METRICS (6 Glass Panels) */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Health Score */}
        <div
          onClick={() => setShowHealthTooltip(!showHealthTooltip)}
          className="relative min-h-[175px] overflow-hidden rounded-2xl p-5 backdrop-blur-xl shadow-sm border border-white/60 flex flex-col justify-between cursor-pointer group hover:shadow-md transition-all"
          style={{ background: 'rgba(255, 250, 240, 0.8)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
              Santulan Score
            </span>
            <span className="material-symbols-outlined text-primary text-[18px]">info</span>
          </div>

          <div className="flex items-center gap-3 my-1">
            <div className="relative w-12 h-12 shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle
                  className="text-surface-variant"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="15.915"
                  stroke="currentColor"
                  strokeWidth="3.2"
                />
                <circle
                  className="text-primary"
                  cx="18"
                  cy="18"
                  fill="none"
                  r="15.915"
                  stroke="currentColor"
                  strokeDasharray={`${healthMetrics.score} ${100 - healthMetrics.score}`}
                  strokeLinecap="round"
                  strokeWidth="3.2"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-bold text-xs text-on-surface">
                {healthMetrics.score}
              </div>
            </div>
            <div>
              <span className="font-headline-sm text-lg text-primary font-bold block">
                {healthMetrics.score}/100
              </span>
              <span className="text-[10px] text-on-surface-variant font-medium">
                {healthMetrics.score >= 80 ? 'Param Shrestha' : 'Shubh Santulan'}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-primary font-bold truncate">
            Tap for score audit
          </div>
        </div>

        {/* Card 2: Net Monthly Savings */}
        <div
          className="relative min-h-[175px] rounded-2xl p-5 backdrop-blur-xl shadow-sm border border-white/60 flex flex-col justify-between"
          style={{ background: 'rgba(255, 250, 240, 0.8)' }}
        >
          <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
            Net Monthly Savings
          </span>

          <div className="my-1">
            <span className="font-headline-sm text-lg text-on-surface font-bold block">
              {formatINR(netSavings)}
            </span>
            <span className="text-[11px] text-primary font-semibold flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">savings</span>
              {savingsRate.toFixed(0)}% Savings Rate
            </span>
          </div>

          <div className="text-[10px] text-on-surface-variant">
            Income minus recorded outflows
          </div>
        </div>

        {/* Card 3: Recorded Outflows */}
        <div
          onClick={() => onNavigate('expenses')}
          className="relative min-h-[175px] rounded-2xl p-5 backdrop-blur-xl shadow-sm border border-white/60 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
          style={{ background: 'rgba(255, 250, 240, 0.8)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
              Total Outflows
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">arrow_forward</span>
          </div>

          <div className="my-1">
            <span className="font-headline-sm text-lg text-on-surface font-bold block">
              {formatINR(expenseMetrics.totalExpenses)}
            </span>
            <span className="text-[11px] text-secondary font-medium block mt-0.5">
              {expenseMetrics.needsRatio}% Needs · {expenseMetrics.wantsRatio}% Wants
            </span>
          </div>

          <div className="text-[10px] text-secondary font-bold">
            {expenses.length} Ledger entries
          </div>
        </div>

        {/* Card 4: Emergency Runway */}
        <div
          onClick={() => onNavigate('emergency-fund')}
          className="relative min-h-[175px] rounded-2xl p-5 backdrop-blur-xl shadow-sm border border-white/60 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
          style={{ background: 'rgba(255, 250, 240, 0.8)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
              Aapda Runway
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">shield</span>
          </div>

          <div className="my-1">
            <span className="font-headline-sm text-lg text-on-surface font-bold block">
              {emergencyMetrics.monthsCovered.toFixed(1)} Months
            </span>
            <span className="text-[11px] text-primary font-semibold block mt-0.5">
              {formatINR(emergencyMetrics.currentAmount)}
            </span>
          </div>

          <div className="text-[10px] text-on-surface-variant">
            Target: {emergencyFund.targetMonths} Months
          </div>
        </div>

        {/* Card 5: Goals Corpus */}
        <div
          onClick={() => onNavigate('goals-and-what-if')}
          className="relative min-h-[175px] rounded-2xl p-5 backdrop-blur-xl shadow-sm border border-white/60 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
          style={{ background: 'rgba(255, 250, 240, 0.8)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
              Lakshya Capital
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">flag</span>
          </div>

          <div className="my-1">
            <span className="font-headline-sm text-lg text-on-surface font-bold block">
              {formatLakhCrore(goals.reduce((a, b) => a + b.currentAmount, 0))}
            </span>
            <span className="text-[11px] text-tertiary font-semibold block mt-0.5">
              {goals.length} Active Margas
            </span>
          </div>

          <div className="text-[10px] text-primary font-bold">
            {formatINR(goals.reduce((a, b) => a + b.monthlyAllocation, 0))}/mo SIPs
          </div>
        </div>

        {/* Card 6: Monthly In-Hand */}
        <div
          onClick={() => onNavigate('profile')}
          className="relative min-h-[175px] rounded-2xl p-5 backdrop-blur-xl shadow-sm border border-white/60 flex flex-col justify-between cursor-pointer hover:shadow-md transition-all"
          style={{ background: 'rgba(255, 250, 240, 0.8)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-[11px] uppercase tracking-wider text-on-surface-variant font-semibold">
              In-Hand Income
            </span>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">person</span>
          </div>

          <div className="my-1">
            <span className="font-headline-sm text-lg text-primary font-bold block">
              {formatINR(monthlyIncome)}
            </span>
            <span className="text-[11px] text-on-surface-variant block mt-0.5">
              {formatLakhCrore(userProfile.annualIncome)} Annual
            </span>
          </div>

          <div className="text-[10px] text-primary font-bold">
            Edit profile income
          </div>
        </div>
      </div>

      {/* HEALTH METRICS AUDIT TOOLTIP MODAL */}
      {showHealthTooltip && (
        <div className="p-6 rounded-3xl bg-surface-container-lowest border border-primary/30 shadow-xl space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-outline-variant/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[22px]">verified</span>
              <h4 className="font-headline-sm text-base text-on-surface font-bold">
                Vittiya Santulan Audit ({healthMetrics.score}/100)
              </h4>
            </div>
            <button
              onClick={() => setShowHealthTooltip(false)}
              className="text-on-surface-variant hover:text-on-surface text-sm font-bold cursor-pointer"
            >
              ✕ Close
            </button>
          </div>

          <p className="text-xs text-on-surface-variant">{healthMetrics.summary}</p>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20">
              <span className="text-[11px] text-on-surface-variant block font-medium">1. Savings Rate</span>
              <span className="font-headline-sm text-sm text-primary font-bold">
                {healthMetrics.savingsRateScore}/30 pts
              </span>
              <span className="text-[10px] text-on-surface-variant block mt-1">
                Actual: {healthMetrics.savingsRateValue}% of income
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20">
              <span className="text-[11px] text-on-surface-variant block font-medium">2. Aapda Runway</span>
              <span className="font-headline-sm text-sm text-primary font-bold">
                {healthMetrics.emergencyScore}/25 pts
              </span>
              <span className="text-[10px] text-on-surface-variant block mt-1">
                Coverage: {healthMetrics.emergencyMonthsValue} months
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20">
              <span className="text-[11px] text-on-surface-variant block font-medium">3. Fiscal Discipline</span>
              <span className="font-headline-sm text-sm text-primary font-bold">
                {healthMetrics.disciplineScore}/25 pts
              </span>
              <span className="text-[10px] text-on-surface-variant block mt-1">
                Needs ratio: {healthMetrics.needsRatioValue}%
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-surface-container-low border border-outline-variant/20">
              <span className="text-[11px] text-on-surface-variant block font-medium">4. Goals Momentum</span>
              <span className="font-headline-sm text-sm text-primary font-bold">
                {healthMetrics.goalsScore}/20 pts
              </span>
              <span className="text-[10px] text-on-surface-variant block mt-1">
                Avg funding: {healthMetrics.goalsProgressValue}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ZERO-SUM MONTHLY ALLOCATION & CASHFLOW SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Dhan Vinyasa Allocation (5 Cols) */}
        <div
          className="lg:col-span-5 rounded-3xl p-7 shadow-xl border border-white/60 flex flex-col gap-6"
          style={{
            background: 'rgba(255, 250, 240, 0.78)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
            <div>
              <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-semibold">
                Dhan Vinyasa
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Zero-Sum Monthly Allocation
              </h3>
            </div>
            <button
              onClick={onOpenAdjustAllocation}
              className="text-xs px-3 py-1 rounded-xl bg-primary-fixed text-primary font-bold hover:bg-primary-container cursor-pointer transition-colors"
            >
              Calibrate
            </button>
          </div>

          <div className="space-y-4">
            {/* Planned Savings */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-primary">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  Planned Savings ({allocationSettings?.savings || 30}%)
                </span>
                <span className="font-bold text-on-surface">{formatINR(allocSavingsAmt)}</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: `${allocationSettings?.savings || 30}%` }}
                />
              </div>
            </div>

            {/* Essential Needs */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-secondary">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary" />
                  Essential Needs ({allocationSettings?.needs || 38}%)
                </span>
                <span className="font-bold text-on-surface">{formatINR(allocNeedsAmt)}</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                <div
                  className="bg-secondary h-full rounded-full"
                  style={{ width: `${allocationSettings?.needs || 38}%` }}
                />
              </div>
            </div>

            {/* Lakshya Goals */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-tertiary">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary" />
                  Milestone Goals ({allocationSettings?.goals || 15}%)
                </span>
                <span className="font-bold text-on-surface">{formatINR(allocGoalsAmt)}</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                <div
                  className="bg-tertiary h-full rounded-full"
                  style={{ width: `${allocationSettings?.goals || 15}%` }}
                />
              </div>
            </div>

            {/* Lifestyle & Wants */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-amber-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-600" />
                  Lifestyle & Joy ({allocationSettings?.wants || 12}%)
                </span>
                <span className="font-bold text-on-surface">{formatINR(allocWantsAmt)}</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full"
                  style={{ width: `${allocationSettings?.wants || 12}%` }}
                />
              </div>
            </div>

            {/* Discretionary Buffer */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold mb-1">
                <span className="flex items-center gap-1.5 text-on-surface-variant">
                  <span className="w-2.5 h-2.5 rounded-full bg-outline-variant" />
                  Discretionary Buffer ({allocationSettings?.buffer || 5}%)
                </span>
                <span className="font-bold text-on-surface">{formatINR(allocBufferAmt)}</span>
              </div>
              <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                <div
                  className="bg-outline-variant h-full rounded-full"
                  style={{ width: `${allocationSettings?.buffer || 5}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/20 flex justify-between items-center text-xs">
            <span className="text-on-surface-variant">Total Distributed:</span>
            <span className="font-bold text-primary font-headline-sm text-sm">
              {formatINR(monthlyIncome)} (100% Balanced)
            </span>
          </div>
        </div>

        {/* Right Column: Dhan Pravah Cashflow Chart (7 Cols) */}
        <div
          className="lg:col-span-7 rounded-3xl p-7 shadow-xl border border-white/60 flex flex-col gap-5"
          style={{
            background: 'rgba(255, 250, 240, 0.78)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-outline-variant/20">
            <div>
              <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-semibold">
                Dhan Pravah
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                11-Month Cashflow Trajectory
              </h3>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-primary">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" /> Inflow
              </span>
              <span className="flex items-center gap-1.5 text-secondary">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary" /> Outflow
              </span>
            </div>
          </div>

          {/* Interactive Month Selector Bar */}
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1">
            {cashflowData.map((d) => (
              <button
                key={d.month}
                onClick={() => setSelectedMonth(d.month)}
                className={`px-2.5 py-1 text-xs rounded-xl font-bold transition-all cursor-pointer ${
                  selectedMonth === d.month
                    ? 'bg-primary text-on-primary shadow-xs'
                    : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                }`}
                type="button"
              >
                {d.month}
              </button>
            ))}
          </div>

          {/* Selected Month Inspector Card */}
          <div className="p-4 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-xs text-on-surface-variant block font-medium">
                {selectedMonth} 2025 · {activeCashflow.note}
              </span>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs font-bold text-primary">
                  Inflow: {formatINR(activeCashflow.inflow)}
                </span>
                <span className="text-xs font-bold text-secondary">
                  Outflow: {formatINR(activeCashflow.outflow)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-on-surface-variant block font-medium">Retained Surplus</span>
              <span className="font-headline-sm text-base text-primary font-bold">
                {formatINR(Math.max(0, activeCashflow.inflow - activeCashflow.outflow))}
              </span>
            </div>
          </div>

          {/* Inline SVG Chart */}
          <div className="relative w-full h-44 select-none">
            <svg className="w-full h-full" viewBox="0 0 600 180" preserveAspectRatio="none">
              <defs>
                <linearGradient id="flowGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#516143" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#516143" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              {/* Reference Grid lines */}
              <line x1="0" y1="40" x2="600" y2="40" stroke="#000" strokeOpacity="0.05" strokeDasharray="3 3" />
              <line x1="0" y1="90" x2="600" y2="90" stroke="#000" strokeOpacity="0.05" strokeDasharray="3 3" />
              <line x1="0" y1="140" x2="600" y2="140" stroke="#000" strokeOpacity="0.05" strokeDasharray="3 3" />

              {/* Area */}
              <path
                d="M 50 140 L 50 90 L 105 95 L 160 85 L 215 90 L 270 85 L 325 88 L 380 95 L 435 90 L 490 88 L 545 40 L 580 90 L 580 140 Z"
                fill="url(#flowGrad)"
              />
              {/* Inflow Line */}
              <path
                d="M 50 90 L 105 95 L 160 85 L 215 90 L 270 85 L 325 88 L 380 95 L 435 90 L 490 88 L 545 40 L 580 90"
                fill="none"
                stroke="#516143"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Outflow Line */}
              <path
                d="M 50 130 L 105 135 L 160 120 L 215 130 L 270 125 L 325 128 L 380 135 L 435 130 L 490 128 L 545 105 L 580 130"
                fill="none"
                stroke="#8b4f27"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="4 3"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* ACTIVE GOALS BENTO SECTION */}
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-label-sm text-xs uppercase tracking-widest text-secondary font-semibold">
              Lakshya Overview
            </span>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
              Active Financial Goals ({goals.length})
            </h3>
          </div>
          <button
            onClick={() => onNavigate('goals-and-what-if')}
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All Milestones & What-If</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {goals.slice(0, 3).map((goal) => {
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            return (
              <div
                key={goal.id}
                onClick={() => onNavigate('goals-and-what-if')}
                className="p-6 rounded-3xl backdrop-blur-xl bg-surface-container-lowest/80 border border-white/60 shadow-md hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between min-h-[220px]"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-secondary">
                      {goal.horizonTag}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        isCompleted ? 'bg-primary-fixed text-primary' : 'bg-secondary-fixed text-secondary'
                      }`}
                    >
                      {isCompleted ? 'Completed' : `${goal.percent}%`}
                    </span>
                  </div>

                  <h4 className="font-headline-sm text-lg font-bold text-on-surface mt-2">
                    {goal.title}
                  </h4>
                  <p className="text-xs text-on-surface-variant mt-1 line-clamp-1">
                    {goal.timelineDetails}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/20">
                  <div className="flex justify-between items-baseline text-xs mb-1.5">
                    <span className="font-bold text-on-surface">
                      {formatINR(goal.currentAmount)}
                    </span>
                    <span className="text-on-surface-variant">
                      Target: {formatINR(goal.targetAmount)}
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isCompleted ? 'bg-primary' : 'bg-secondary'}`}
                      style={{ width: `${goal.percent}%` }}
                    />
                  </div>
                  <span className="text-[11px] text-primary font-semibold mt-2 block">
                    {formatINR(goal.monthlyAllocation)} / month contribution
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
