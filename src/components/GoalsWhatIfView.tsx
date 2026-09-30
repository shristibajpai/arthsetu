import React, { useState, useMemo } from 'react';
import { GoalItem, UserProfile } from '../types';
import { formatINR, formatLakhCrore, clampPercent } from '../utils/formatters';
import { EditGoalModal, ContributeGoalModal } from './Modals';
import { ConfirmationModal } from './ConfirmationModal';

export const GHAT_GOALS_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2eJg8f8s9d7f6g5h4j3k2l1m0n9p8q7r6s5t4u3v2w1x0y9z8a7b6c5d4e3f2g1h0j9k8=w1200';

interface GoalsWhatIfViewProps {
  goals: GoalItem[];
  userProfile: UserProfile;
  totalMonthlyExpenses: number;
  totalNeeds: number;
  onOpenNewGoalModal: () => void;
  onUpdateGoal: (goal: GoalItem) => void;
  onDeleteGoal: (goalId: string) => void;
  onUpdateGoalAllocation: (goalId: string, newAllocation: number) => void;
}

export const GoalsWhatIfView: React.FC<GoalsWhatIfViewProps> = ({
  goals,
  userProfile,
  totalMonthlyExpenses,
  totalNeeds,
  onOpenNewGoalModal,
  onUpdateGoal,
  onDeleteGoal,
  onUpdateGoalAllocation,
}) => {
  const [filterHorizon, setFilterHorizon] = useState<'all' | 'short' | 'long' | 'completed'>('all');

  // Modal states for edit, contribute, and delete
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);
  const [contributingGoal, setContributingGoal] = useState<GoalItem | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<GoalItem | null>(null);

  // In-line tuning panel state
  const [tuningGoalId, setTuningGoalId] = useState<string | null>(null);
  const [tuningAllocation, setTuningAllocation] = useState<number>(5000);

  // -------------------------------------------------------------
  // What-If Scenario State (Isolated from real application data!)
  // -------------------------------------------------------------
  const [extraSavings, setExtraSavings] = useState<number>(0);
  const [reduceWants, setReduceWants] = useState<number>(0);
  const [incomeHike, setIncomeHike] = useState<number>(0);
  const [inflation, setInflation] = useState<number>(6.0);
  const [hasSabbatical, setHasSabbatical] = useState<boolean>(false);
  const [sabbaticalMonths, setSabbaticalMonths] = useState<number>(6);

  const handleResetScenario = () => {
    setExtraSavings(0);
    setReduceWants(0);
    setIncomeHike(0);
    setInflation(6.0);
    setHasSabbatical(false);
    setSabbaticalMonths(6);
  };

  // Real Goal Aggregations
  const totalGoalCapital = useMemo(
    () => goals.reduce((acc, g) => acc + (g.targetAmount || 0), 0),
    [goals]
  );
  const totalSavedCorpus = useMemo(
    () => goals.reduce((acc, g) => acc + (g.currentAmount || 0), 0),
    [goals]
  );
  const totalMonthlySips = useMemo(
    () => goals.reduce((acc, g) => acc + (g.monthlyAllocation || 0), 0),
    [goals]
  );
  const aggregateMilestonePct =
    totalGoalCapital > 0 ? clampPercent((totalSavedCorpus / totalGoalCapital) * 100) : 0;

  // Filtered Goals
  const filteredGoals = useMemo(() => {
    return goals.filter((goal) => {
      const isCompleted = goal.currentAmount >= goal.targetAmount;
      if (filterHorizon === 'completed') return isCompleted;
      if (filterHorizon === 'short') {
        const horizon = goal.horizonTag?.toLowerCase() || '';
        return horizon.includes('2026') || horizon.includes('2027') || horizon.includes('short');
      }
      if (filterHorizon === 'long') {
        const horizon = goal.horizonTag?.toLowerCase() || '';
        return (
          horizon.includes('2030') ||
          horizon.includes('2035') ||
          horizon.includes('2040') ||
          horizon.includes('long') ||
          horizon.includes('52')
        );
      }
      return true;
    });
  }, [goals, filterHorizon]);

  // -------------------------------------------------------------
  // What-If Dynamic Projections
  // -------------------------------------------------------------
  const baselineMonthlyIncome = userProfile.monthlyIncome || 185000;
  const currentActualSavings = Math.max(0, baselineMonthlyIncome - totalMonthlyExpenses);

  // Projected Income & Savings under What-If
  const simulatedIncome = baselineMonthlyIncome * (1 + incomeHike / 100);
  const simulatedMonthlySavings =
    currentActualSavings + extraSavings + reduceWants + (simulatedIncome - baselineMonthlyIncome);

  // Impact on Swatantrata timeline (Years shifted)
  // Each ₹10,000 extra per month accelerates terminal corpus by ~1.1 years at 11% yield
  const accelerationFromSavings = (extraSavings + reduceWants) * 0.00011;
  const dragFromInflation = (inflation - 6.0) * 0.8;
  const dragFromSabbatical = hasSabbatical ? sabbaticalMonths * 0.25 : 0;
  const netYearsSaved = Number(
    (accelerationFromSavings - dragFromInflation - dragFromSabbatical).toFixed(1)
  );

  const baselineAge = 52.0;
  const finalAge = Number((baselineAge - netYearsSaved).toFixed(1));

  // Adjusted Swatantrata target based on simulated inflation
  const baselineCrores = 3.5;
  const adjustedCroreVal = Number((baselineCrores * Math.pow(1 + (inflation - 6.0) / 100, 15)).toFixed(2));
  const fillPct = clampPercent((baselineCrores / adjustedCroreVal) * 100);

  // Sabbatical Drawdown estimation
  const monthlySabbaticalBurn = totalNeeds > 0 ? totalNeeds : 65000;
  const totalSabbaticalDrawdown = hasSabbatical ? monthlySabbaticalBurn * sabbaticalMonths : 0;

  return (
    <div className="flex flex-col w-full gap-8 pb-16">
      {/* Edit Goal Modal */}
      <EditGoalModal
        goal={editingGoal}
        isOpen={!!editingGoal}
        onClose={() => setEditingGoal(null)}
        onUpdateGoal={onUpdateGoal}
      />

      {/* Contribute to Goal Modal */}
      <ContributeGoalModal
        goal={contributingGoal}
        isOpen={!!contributingGoal}
        onClose={() => setContributingGoal(null)}
        onContribute={(goalId, amount) => {
          const target = goals.find((g) => g.id === goalId);
          if (target) {
            const newAmount = target.currentAmount + amount;
            onUpdateGoal({
              ...target,
              currentAmount: newAmount,
              percent: clampPercent((newAmount / target.targetAmount) * 100),
              completed: newAmount >= target.targetAmount,
            });
          }
        }}
      />

      {/* Delete Goal Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingGoal}
        title="Delete Financial Lakshya?"
        message={
          deletingGoal
            ? `Are you sure you want to delete "${deletingGoal.title}" (${formatINR(
                deletingGoal.targetAmount
              )})? The recorded corpus of ${formatINR(
                deletingGoal.currentAmount
              )} will be returned to your general pool.`
            : ''
        }
        confirmLabel="Confirm Delete"
        isDestructive={true}
        onConfirm={() => {
          if (deletingGoal) {
            onDeleteGoal(deletingGoal.id);
            setDeletingGoal(null);
          }
        }}
        onCancel={() => setDeletingGoal(null)}
      />

      {/* Hero Header */}
      <section className="relative w-full rounded-3xl overflow-hidden p-8 lg:p-12 shadow-xl border border-white/60 bg-surface-container-lowest/80 backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">
                landscape
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                Future Horizon & Aspirations
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1 font-bold">
              Lakshya Marg — Goal Architecture & Timeline
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2 leading-relaxed">
              Ascend step by step from temporal necessities to spiritual and financial freedom
              (*Swatantrata*). Formulate, track, and dynamically stress-test your life milestones.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenNewGoalModal}
              className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-semibold transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              type="button"
            >
              <span className="material-symbols-outlined text-[20px]">add_circle</span>
              <span>Consecrate New Lakshya</span>
            </button>
          </div>
        </div>

        {/* Quick Vital Statistics Strip */}
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 bg-surface-container/50 rounded-2xl p-5 backdrop-blur-sm border border-outline-variant/20">
          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Total Goal Capital
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface mt-0.5 font-bold">
              {formatLakhCrore(totalGoalCapital)}
            </span>
            <span className="font-label-sm text-xs text-primary flex items-center gap-1 mt-0.5 font-medium">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>{' '}
              {goals.length} Active Margas
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Present Sanchay (Corpus)
            </span>
            <span className="font-headline-sm text-headline-sm text-secondary mt-0.5 font-bold">
              {formatLakhCrore(totalSavedCorpus)}
            </span>
            <span className="font-label-sm text-xs text-on-surface-variant mt-0.5">
              {aggregateMilestonePct}% Aggregate Milestone
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Total Monthly SIPs
            </span>
            <span className="font-headline-sm text-headline-sm text-on-surface mt-0.5 font-bold">
              {formatINR(totalMonthlySips)}
            </span>
            <span className="font-label-sm text-xs text-primary mt-0.5 font-semibold">
              Auto-routed via ECS
            </span>
          </div>

          <div className="flex flex-col min-w-0">
            <span className="font-label-sm text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
              Horizon Target Age
            </span>
            <span className="font-headline-sm text-headline-sm text-tertiary mt-0.5 font-bold">
              Age {finalAge}
            </span>
            <span className="font-label-sm text-xs text-on-surface-variant mt-0.5">
              Swatantrata arrival
            </span>
          </div>
        </div>
      </section>

      {/* Lakshya Journey Cards */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface font-bold">
              Stepping Stones of ArthSetu
            </h3>
            <p className="font-body-sm text-xs text-on-surface-variant">
              Active milestones tracked with real progress and dedicated monthly contributions.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-surface-container-high/60 p-1 rounded-xl border border-outline-variant/20 overflow-x-auto">
            <button
              onClick={() => setFilterHorizon('all')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                filterHorizon === 'all'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              All ({goals.length})
            </button>
            <button
              onClick={() => setFilterHorizon('short')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                filterHorizon === 'short'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Short Horizon
            </button>
            <button
              onClick={() => setFilterHorizon('long')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                filterHorizon === 'long'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Long Horizon
            </button>
            <button
              onClick={() => setFilterHorizon('completed')}
              className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                filterHorizon === 'completed'
                  ? 'bg-surface-container-lowest text-on-surface shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              type="button"
            >
              Completed
            </button>
          </div>
        </div>

        {/* Empty State */}
        {filteredGoals.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-surface-container-lowest/70 border border-dashed border-outline-variant/40 flex flex-col items-center justify-center">
            <span className="material-symbols-outlined text-[44px] text-on-surface-variant mb-2">
              flag
            </span>
            <h4 className="font-headline-sm text-lg font-bold text-on-surface">
              No financial goals recorded yet
            </h4>
            <p className="text-xs text-on-surface-variant mt-1 max-w-sm">
              Formulate your first Lakshya (such as home purchase, child education, or car) to start
              disciplined monthly tracking.
            </p>
            <button
              onClick={onOpenNewGoalModal}
              className="mt-4 px-5 py-2 rounded-xl bg-primary text-on-primary font-bold text-xs cursor-pointer shadow-md hover:bg-primary-container"
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          /* Goal Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredGoals.map((goal) => {
              const isTuning = tuningGoalId === goal.id;
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
              const isCompleted = goal.currentAmount >= goal.targetAmount;

              return (
                <div
                  key={goal.id}
                  className="group relative flex flex-col justify-between min-h-[350px] backdrop-blur-xl rounded-3xl p-6 lg:p-7 shadow-md hover:shadow-xl transition-all duration-300 border border-white/60"
                  style={{ background: 'rgba(255, 250, 240, 0.78)' }}
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                            isCompleted
                              ? 'bg-primary text-on-primary font-bold'
                              : 'bg-primary-fixed/60 text-primary'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[26px]">
                            {isCompleted ? 'check_circle' : goal.icon}
                          </span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-label-sm text-xs uppercase tracking-wider text-secondary font-bold">
                            {goal.horizonTag}
                          </span>
                          <h4 className="font-headline-sm text-headline-sm text-on-surface truncate font-bold">
                            {goal.title}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span
                          className={`px-3 py-1 rounded-full font-label-sm text-xs font-semibold ${
                            isCompleted
                              ? 'bg-primary-fixed text-primary font-bold'
                              : 'bg-secondary-fixed text-on-secondary-fixed-variant'
                          }`}
                        >
                          {isCompleted ? 'Completed' : goal.badgeText}
                        </span>

                        {/* Edit & Delete Action Buttons */}
                        <button
                          onClick={() => setEditingGoal(goal)}
                          className="p-1 rounded-lg text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                          title="Edit Goal"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button
                          onClick={() => setDeletingGoal(goal)}
                          className="p-1 rounded-lg text-on-surface-variant hover:text-secondary transition-colors cursor-pointer"
                          title="Delete Goal"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 bg-surface-container-lowest/60 p-4 rounded-2xl border border-outline-variant/20">
                      <div>
                        <span className="font-label-sm text-xs text-on-surface-variant block">
                          Target Needed
                        </span>
                        <span className="font-headline-sm text-headline-sm text-on-surface mt-0.5 block font-bold">
                          {formatINR(goal.targetAmount)}
                        </span>
                      </div>
                      <div>
                        <span className="font-label-sm text-xs text-on-surface-variant block">
                          Already Saved
                        </span>
                        <span className="font-headline-sm text-headline-sm text-secondary mt-0.5 block font-bold">
                          {formatINR(goal.currentAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* In-place tuning panel if toggled */}
                  {isTuning && (
                    <div className="mt-3 p-4 rounded-2xl bg-surface-container-lowest/95 border border-primary/30 space-y-3">
                      <div className="flex justify-between items-center text-xs font-semibold">
                        <span>Adjust Monthly Contribution for {goal.title}</span>
                        <span className="text-primary font-bold">
                          {formatINR(tuningAllocation)} / mo
                        </span>
                      </div>
                      <input
                        type="range"
                        aria-label="Adjust Monthly SIP"
                        min="1000"
                        max="80000"
                        step="1000"
                        value={tuningAllocation}
                        onChange={(e) => setTuningAllocation(parseInt(e.target.value, 10))}
                        className="w-full accent-primary cursor-pointer"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setTuningGoalId(null)}
                          className="px-3 py-1 text-xs rounded-lg bg-surface-container text-on-surface cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            onUpdateGoalAllocation(goal.id, tuningAllocation);
                            setTuningGoalId(null);
                          }}
                          className="px-3 py-1 text-xs rounded-lg bg-primary text-on-primary font-semibold cursor-pointer"
                        >
                          Save Adjustment
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Progress Ring, Timeline & Action Buttons */}
                  <div className="mt-5 flex items-center justify-between gap-4 pt-2 border-t border-outline-variant/20">
                    <div className="flex items-center gap-3">
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
                            className={isCompleted ? 'text-primary' : 'text-secondary'}
                            cx="18"
                            cy="18"
                            fill="none"
                            r="15.915"
                            stroke="currentColor"
                            strokeDasharray={`${goal.percent} ${100 - goal.percent}`}
                            strokeLinecap="round"
                            strokeWidth="3.2"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center font-label-md text-xs font-bold text-on-surface">
                          {goal.percent}%
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <span className="font-label-sm text-[11px] text-on-surface-variant font-medium">
                          {isCompleted ? 'Milestone Complete' : `${formatINR(remaining)} remaining`}
                        </span>
                        <span className="font-label-lg text-xs font-semibold text-on-surface">
                          {goal.projectedDate}
                        </span>
                        <span className="text-[11px] text-primary font-semibold">
                          {formatINR(goal.monthlyAllocation)} / month
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setContributingGoal(goal)}
                        className="px-3 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[16px]">add</span>
                        <span>Deposit</span>
                      </button>

                      <button
                        onClick={() => {
                          if (isTuning) {
                            setTuningGoalId(null);
                          } else {
                            setTuningGoalId(goal.id);
                            setTuningAllocation(goal.monthlyAllocation);
                          }
                        }}
                        title="Tune Monthly Contribution"
                        className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors cursor-pointer border border-outline-variant/20 shadow-xs"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">tune</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Interactive What-If Scenario Modeler (Glass Panel) */}
      <section
        className="relative w-full rounded-3xl shadow-xl p-8 lg:p-10 flex flex-col gap-8 border border-white/60"
        style={{
          background: 'rgba(255, 250, 240, 0.82)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-[22px]">
                psychology_alt
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                Dynamic Financial Crucible (What-If Simulator)
              </span>
            </div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface mt-1 font-bold">
              Interactive What-If Scenario Modeler
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Simulate hypothetical adjustments without altering your real financial ledger. Test
              savings boosts, lifestyle cuts, sabbaticals, and inflation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetScenario}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-label-sm text-label-sm hover:bg-surface-container-high transition-colors cursor-pointer border border-outline-variant/20 font-semibold"
              type="button"
            >
              Reset to Baseline
            </button>
            <span className="px-3 py-1.5 rounded-xl bg-primary-fixed text-on-primary-fixed-variant font-label-sm text-xs font-semibold">
              Simulation Sandbox
            </span>
          </div>
        </div>

        {/* Sliders and Scenario Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Interactive Inputs Column (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Scenario 1: Additional Monthly Savings */}
            <div className="bg-surface-container-lowest/70 backdrop-blur-md p-5 rounded-2xl flex flex-col gap-2.5 shadow-xs border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-primary-fixed flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  </div>
                  <label
                    className="font-label-lg font-semibold text-on-surface cursor-pointer text-sm"
                    htmlFor="savingsSlider"
                  >
                    Increase Monthly Savings (SIP)
                  </label>
                </div>
                <span className="font-headline-sm text-sm text-primary font-bold">
                  {extraSavings === 0 ? '+₹0 / mo' : `+${formatINR(extraSavings)} / mo`}
                </span>
              </div>
              <input
                className="w-full accent-primary h-2 bg-surface-variant rounded-lg cursor-pointer"
                id="savingsSlider"
                aria-label="Increase Monthly Savings"
                max="50000"
                min="0"
                step="2500"
                type="range"
                value={extraSavings}
                onChange={(e) => setExtraSavings(parseInt(e.target.value, 10))}
              />
              <div className="flex justify-between text-on-surface-variant text-[11px] font-medium">
                <span>+₹0 (Baseline)</span>
                <span>+₹25,000</span>
                <span>+₹50,000 / mo</span>
              </div>
            </div>

            {/* Scenario 2: Reduce Discretionary Wants Spending */}
            <div className="bg-surface-container-lowest/70 backdrop-blur-md p-5 rounded-2xl flex flex-col gap-2.5 shadow-xs border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-tertiary-fixed flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[18px]">content_cut</span>
                  </div>
                  <label
                    className="font-label-lg font-semibold text-on-surface cursor-pointer text-sm"
                    htmlFor="reduceWantsSlider"
                  >
                    Curtail Discretionary Wants Spending
                  </label>
                </div>
                <span className="font-headline-sm text-sm text-tertiary font-bold">
                  {reduceWants === 0 ? '₹0 cut' : `Save ${formatINR(reduceWants)} / mo`}
                </span>
              </div>
              <input
                className="w-full accent-tertiary h-2 bg-surface-variant rounded-lg cursor-pointer"
                id="reduceWantsSlider"
                aria-label="Curtail Discretionary Wants Spending"
                max="25000"
                min="0"
                step="1000"
                type="range"
                value={reduceWants}
                onChange={(e) => setReduceWants(parseInt(e.target.value, 10))}
              />
              <div className="flex justify-between text-on-surface-variant text-[11px] font-medium">
                <span>₹0 (Current Outflows)</span>
                <span>Cut ₹10,000</span>
                <span>Cut ₹25,000 / mo</span>
              </div>
            </div>

            {/* Scenario 3: Inflation Rate Fluctuation */}
            <div className="bg-surface-container-lowest/70 backdrop-blur-md p-5 rounded-2xl flex flex-col gap-2.5 shadow-xs border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container/40 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[18px]">local_fire_department</span>
                  </div>
                  <label
                    className="font-label-lg font-semibold text-on-surface cursor-pointer text-sm"
                    htmlFor="inflationSlider"
                  >
                    Expected Average Inflation Rate
                  </label>
                </div>
                <span className="font-headline-sm text-sm text-secondary font-bold">
                  {inflation.toFixed(1)}% per annum
                </span>
              </div>
              <input
                className="w-full accent-secondary h-2 bg-surface-variant rounded-lg cursor-pointer"
                id="inflationSlider"
                aria-label="Expected Average Inflation Rate"
                max="9.0"
                min="4.0"
                step="0.5"
                type="range"
                value={inflation}
                onChange={(e) => setInflation(parseFloat(e.target.value))}
              />
              <div className="flex justify-between text-on-surface-variant text-[11px] font-medium">
                <span>4.0% (Subdued)</span>
                <span>6.0% (RBI Benchmark)</span>
                <span>9.0% (Elevated)</span>
              </div>
            </div>

            {/* Scenario 4: Career Sabbatical Switch */}
            <div className="bg-surface-container-lowest/70 backdrop-blur-md p-5 rounded-2xl flex flex-col gap-3 shadow-xs border border-outline-variant/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/60 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[18px]">self_improvement</span>
                  </div>
                  <span className="font-label-lg font-semibold text-on-surface text-sm">
                    Contemplate Career Sabbatical in 2026
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    checked={hasSabbatical}
                    onChange={(e) => setHasSabbatical(e.target.checked)}
                    className="sr-only peer"
                    type="checkbox"
                  />
                  <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-secondary" />
                </label>
              </div>

              {hasSabbatical && (
                <div className="pt-2 flex items-center justify-between border-t border-outline-variant/20">
                  <span className="text-xs text-on-surface-variant font-medium">
                    Sabbatical Duration:
                  </span>
                  <div className="flex gap-2">
                    {[3, 6, 12].map((m) => (
                      <button
                        key={m}
                        onClick={() => setSabbaticalMonths(m)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          sabbaticalMonths === m
                            ? 'bg-secondary text-on-secondary shadow-xs'
                            : 'bg-surface-container text-on-surface'
                        }`}
                        type="button"
                      >
                        {m} Months
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Live Dynamic Impact Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-5 sticky top-28">
            <div
              className="backdrop-blur-xl p-7 rounded-3xl shadow-xl flex flex-col gap-5 border border-white/60"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(249, 237, 214, 0.88))',
              }}
            >
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-secondary animate-pulse" />
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
                    Hypothetical Projection
                  </span>
                </div>
                <span className="text-xs text-primary font-bold">Safe Sandbox</span>
              </div>

              {/* Monthly Savings Comparison */}
              <div className="p-4 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/20 flex justify-between items-center text-xs">
                <div>
                  <span className="text-on-surface-variant block">Simulated Monthly Savings</span>
                  <span className="font-headline-sm text-base text-primary font-bold">
                    {formatINR(simulatedMonthlySavings)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-on-surface-variant block">Actual Plan</span>
                  <span className="font-headline-sm text-xs text-on-surface font-semibold line-through">
                    {formatINR(currentActualSavings)}
                  </span>
                </div>
              </div>

              {/* Timeline Shift Output */}
              <div className="flex flex-col bg-surface-container-lowest/80 p-5 rounded-2xl shadow-xs border border-outline-variant/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant font-medium">
                    Swatantrata Arrival Shift
                  </span>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      netYearsSaved >= 0
                        ? 'bg-primary-fixed text-primary'
                        : 'bg-secondary-container text-secondary'
                    }`}
                  >
                    {netYearsSaved >= 0
                      ? `${netYearsSaved.toFixed(1)} Yrs Accelerated`
                      : `${Math.abs(netYearsSaved).toFixed(1)} Yrs Extended`}
                  </span>
                </div>

                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-headline-lg text-headline-lg text-primary font-bold">
                    Age {finalAge}
                  </span>
                  <span className="text-xs text-on-surface-variant line-through font-medium">
                    Baseline: Age 52.0
                  </span>
                </div>

                <p className="text-xs text-on-surface-variant mt-1.5 leading-relaxed">
                  {netYearsSaved >= 1
                    ? `Your extra savings rate outpaces inflation and pauses, bringing freedom forward by ${netYearsSaved.toFixed(
                        1
                      )} years.`
                    : netYearsSaved < 0
                    ? `Inflation pressure and pauses extend your horizon. Increase savings to restore baseline.`
                    : `Your parameters match your baseline freedom age.`}
                </p>
              </div>

              {/* Adjusted Target from Inflation */}
              <div className="flex flex-col bg-surface-container-lowest/80 p-5 rounded-2xl shadow-xs border border-outline-variant/20">
                <span className="text-xs text-on-surface-variant font-medium">
                  Adjusted Terminal Target
                </span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-headline-md text-headline-md text-secondary font-bold">
                    ₹{adjustedCroreVal.toFixed(2)} Crore
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    (@ {inflation.toFixed(1)}% inflation)
                  </span>
                </div>
                <div className="mt-2 w-full bg-surface-variant h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-secondary h-full rounded-full transition-all duration-300"
                    style={{ width: `${fillPct}%` }}
                  />
                </div>
              </div>

              {/* Sabbatical Drawdown if active */}
              {hasSabbatical && (
                <div className="flex flex-col bg-surface-container-lowest/80 p-5 rounded-2xl shadow-xs border border-outline-variant/20">
                  <span className="text-xs text-on-surface-variant font-medium">
                    Simulated Sabbatical Drawdown
                  </span>
                  <span className="font-headline-sm text-sm text-on-surface font-bold mt-1">
                    {formatINR(totalSabbaticalDrawdown)}
                  </span>
                  <span className="text-[11px] text-tertiary mt-1">
                    Covered by Aapda Kosh buffer without liquidating active equities.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
