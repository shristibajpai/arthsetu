import React, { useState, useRef, useMemo } from 'react';
import { ExpenseRecord, ExpenseCategory } from '../types';
import { formatINR } from '../utils/formatters';
import { calculateExpenseMetrics } from '../utils/calculations';
import { EditExpenseModal } from './Modals';
import { ConfirmationModal } from './ConfirmationModal';

export const GHAT_EXPENSE_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAMsZz377yC36vP9Yq0oKvd3D-L_9f1Wb8x93k5r6l3X4k7C0d7jY7X1x9_6oZf6h7l8m2k5v8=w1200';

interface ExpensesViewProps {
  expenses: ExpenseRecord[];
  monthlyIncome: number;
  budgetLimit: number;
  onAddExpense: (record: Omit<ExpenseRecord, 'id'>) => void;
  onUpdateExpense: (record: ExpenseRecord) => void;
  onDeleteExpense: (expenseId: string) => void;
  onOpenBudgetModal: () => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  monthlyIncome,
  budgetLimit,
  onAddExpense,
  onUpdateExpense,
  onDeleteExpense,
  onOpenBudgetModal,
}) => {
  // Filter and Search states
  const [filter, setFilter] = useState<'All' | 'Essentials' | 'Lifestyle' | 'UPI'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Modal states for edit and delete confirmation
  const [editingExpense, setEditingExpense] = useState<ExpenseRecord | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<ExpenseRecord | null>(null);

  // Form states for Quick Entry
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Housing');
  const [nature, setNature] = useState<'Need' | 'Want'>('Need');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Credit Card' | 'NetBanking' | 'Cash'>('UPI');
  const [vendor, setVendor] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const amountInputRef = useRef<HTMLInputElement>(null);

  // Real-time calculated metrics
  const metrics = useMemo(
    () => calculateExpenseMetrics(expenses, monthlyIncome),
    [expenses, monthlyIncome]
  );

  const remainingBudget = Math.max(0, budgetLimit - metrics.totalExpenses);
  const budgetUtilization = budgetLimit > 0 ? Math.round((metrics.totalExpenses / budgetLimit) * 100) : 0;

  // Filter and sort expenses
  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    // Filter by nature / channel
    if (filter === 'Essentials') {
      result = result.filter((e) => e.nature === 'Need');
    } else if (filter === 'Lifestyle') {
      result = result.filter((e) => e.nature === 'Want');
    } else if (filter === 'UPI') {
      result = result.filter((e) => e.channel === 'UPI');
    }

    // Filter by category
    if (categoryFilter !== 'All') {
      result = result.filter((e) => e.category === categoryFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.category.toLowerCase().includes(q) ||
          e.channel.toLowerCase().includes(q) ||
          (e.notes && e.notes.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'highest') return b.amount - a.amount;
      if (sortBy === 'lowest') return a.amount - b.amount;
      return 0;
    });

    return result;
  }, [expenses, filter, categoryFilter, searchQuery, sortBy]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setFormError('Please enter a valid expense amount.');
      return;
    }
    if (!vendor.trim()) {
      setFormError('Please describe the outlay / vendor.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);

    // Pick icon based on category
    let icon = 'receipt_long';
    if (category === 'Housing') icon = 'roofing';
    else if (category === 'Ration' || category === 'Food') icon = 'shopping_cart';
    else if (category === 'Transit') icon = 'directions_car';
    else if (category === 'Healthcare') icon = 'medical_services';
    else if (category === 'Dining') icon = 'restaurant';
    else if (category === 'Shopping') icon = 'shopping_bag';
    else if (category === 'Decor') icon = 'spa';
    else if (category === 'Digital' || category === 'Subscriptions') icon = 'devices';
    else if (category === 'Leisure' || category === 'Entertainment') icon = 'sports_esports';
    else if (category === 'Education') icon = 'school';

    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    onAddExpense({
      name: vendor.trim(),
      amount: val,
      category,
      nature,
      date: formattedDate,
      channel: paymentMode,
      icon,
      notes: notes.trim(),
    });

    setIsSubmitting(false);
    setSubmitSuccess(true);
    setAmount('');
    setVendor('');
    setNotes('');

    setTimeout(() => {
      setSubmitSuccess(false);
      amountInputRef.current?.focus();
    }, 2000);
  };

  return (
    <div className="flex flex-col w-full gap-8 pb-16">
      {/* Edit Expense Modal */}
      <EditExpenseModal
        expense={editingExpense}
        isOpen={!!editingExpense}
        onClose={() => setEditingExpense(null)}
        onUpdateExpense={onUpdateExpense}
      />

      {/* Delete Expense Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingExpense}
        title="Delete Expense Outflow?"
        message={
          deletingExpense
            ? `Are you sure you want to remove "${deletingExpense.name}" (${formatINR(
                deletingExpense.amount
              )}) from your recorded ledger? This will immediately restore your surplus.`
            : ''
        }
        confirmLabel="Confirm Delete"
        isDestructive={true}
        onConfirm={() => {
          if (deletingExpense) {
            onDeleteExpense(deletingExpense.id);
            setDeletingExpense(null);
          }
        }}
        onCancel={() => setDeletingExpense(null)}
      />

      {/* Editorial Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
            Monthly Outflow & Discipline / Margashirsha Maas
          </span>
          <h2 className="font-headline-lg text-headline-lg text-on-surface mt-1 font-bold">
            Vyaya (Expenses) & Dhan Pravah
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mt-1">
            Carefully log and balance every outflow. In Vedic philosophy, conscious expenditure
            preserves peace of mind (*Shanti*) and safeguards the sovereign family corpus.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBudgetModal}
            className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-md text-label-md font-semibold transition-all flex items-center gap-2 border border-outline-variant/30 cursor-pointer shadow-xs"
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>Edit Monthly Budget Threshold</span>
          </button>
        </div>
      </div>

      {/* KPI Overview Glass Mosaic */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-5">
        {/* Card 1: Total Monthly Spent with Ring Meter */}
        <div
          className="xl:col-span-4 min-h-[195px] rounded-2xl p-6 backdrop-blur-xl shadow-[0_8px_30px_rgba(80,65,45,0.06)] border border-white/60 flex flex-col justify-between"
          style={{ background: 'rgba(255, 250, 240, 0.8)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Total Monthly Outflow
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-secondary-fixed/50 text-secondary font-bold">
              {budgetUtilization}% of Budget
            </span>
          </div>

          <div className="my-2 flex items-baseline gap-2">
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold">
              {formatINR(metrics.totalExpenses)}
            </span>
            <span className="text-xs text-on-surface-variant font-medium">
              / {formatINR(budgetLimit)} target
            </span>
          </div>

          <div>
            <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  budgetUtilization > 90 ? 'bg-secondary' : 'bg-primary'
                }`}
                style={{ width: `${Math.min(100, budgetUtilization)}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-2 text-xs text-on-surface-variant">
              <span>{formatINR(remainingBudget)} unspent buffer</span>
              <span className="text-primary font-semibold">
                {metrics.savingsRate.toFixed(0)}% Savings Rate
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Essential Needs (Aavashyak) */}
        <div
          className="xl:col-span-3 min-h-[195px] rounded-2xl p-6 backdrop-blur-xl shadow-[0_8px_30px_rgba(80,65,45,0.06)] border border-white/60 flex flex-col justify-between"
          style={{ background: 'rgba(255, 250, 240, 0.8)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Aavashyak (Needs)
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary-fixed/60 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
            </div>
          </div>

          <div>
            <div className="font-headline-lg text-headline-lg text-primary font-bold">
              {formatINR(metrics.totalNeeds)}
            </div>
            <span className="text-xs text-on-surface-variant font-medium mt-1 block">
              {metrics.needsRatio}% of total recorded expenditures
            </span>
          </div>

          <div className="text-[11px] text-on-surface-variant bg-surface-container/60 p-2 rounded-xl">
            Covers housing, rations, healthcare & commute foundations.
          </div>
        </div>

        {/* Card 3: Lifestyle & Wants (Aanand) */}
        <div
          className="xl:col-span-3 min-h-[195px] rounded-2xl p-6 backdrop-blur-xl shadow-[0_8px_30px_rgba(80,65,45,0.06)] border border-white/60 flex flex-col justify-between"
          style={{ background: 'rgba(255, 250, 240, 0.8)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Aanand (Wants)
            </span>
            <div className="w-8 h-8 rounded-xl bg-secondary-fixed/60 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">celebration</span>
            </div>
          </div>

          <div>
            <div className="font-headline-lg text-headline-lg text-secondary font-bold">
              {formatINR(metrics.totalWants)}
            </div>
            <span className="text-xs text-on-surface-variant font-medium mt-1 block">
              {metrics.wantsRatio}% of total recorded expenditures
            </span>
          </div>

          <div className="text-[11px] text-on-surface-variant bg-surface-container/60 p-2 rounded-xl">
            Discretionary dining, festivals, leisure, and personal joy.
          </div>
        </div>

        {/* Card 4: Average Outlay & Count */}
        <div
          className="xl:col-span-2 min-h-[195px] rounded-2xl p-6 backdrop-blur-xl shadow-[0_8px_30px_rgba(80,65,45,0.06)] border border-white/60 flex flex-col justify-between"
          style={{ background: 'rgba(255, 250, 240, 0.8)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
              Ledger Metrics
            </span>
            <div className="w-8 h-8 rounded-xl bg-tertiary-fixed/60 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">receipt</span>
            </div>
          </div>

          <div>
            <span className="text-xs text-on-surface-variant block">Average Outflow</span>
            <span className="font-headline-md text-headline-md text-on-surface font-bold">
              {formatINR(metrics.averageExpense)}
            </span>
          </div>

          <div className="text-xs font-semibold text-tertiary">
            {expenses.length} Records in Ledger
          </div>
        </div>
      </div>

      {/* Main Split Content: Form (5 Cols) vs Ledger & Visuals (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Premium Glass Expense Entry Form */}
        <div
          className="lg:col-span-5 rounded-3xl p-7 relative border border-white/60 shadow-[0_12px_40px_rgba(80,65,45,0.09)]"
          style={{
            background: 'rgba(255, 250, 240, 0.75)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-outline-variant/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-on-primary-fixed shadow-xs">
                <span className="material-symbols-outlined text-[22px]">edit_note</span>
              </div>
              <div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface leading-snug font-bold">
                  Lekhapatra (Quick Entry)
                </h3>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Log an outlay into your fiscal river
                </span>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-surface-container text-tertiary font-semibold tracking-wide uppercase">
              Live Sync
            </span>
          </div>

          {formError && (
            <div className="mb-4 p-3 rounded-xl bg-secondary-fixed/50 text-secondary text-xs font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">error</span>
              <span>{formError}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Description / Vendor */}
            <div className="space-y-1.5">
              <label
                className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold"
                htmlFor="vendor"
              >
                Expense Description / Vendor
              </label>
              <input
                id="vendor"
                required
                placeholder="e.g. Society Maintenance, Organic Milk, Dinner"
                type="text"
                value={vendor}
                onChange={(e) => {
                  setVendor(e.target.value);
                  setFormError(null);
                }}
                className="w-full h-12 px-4 rounded-xl bg-surface-container-lowest/80 text-on-surface font-body-md border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            {/* Amount Input */}
            <div className="space-y-1.5">
              <label
                className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold"
                htmlFor="amount"
              >
                Expense Amount (₹)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-4 font-headline-md text-on-surface-variant text-[22px]">
                  ₹
                </span>
                <input
                  ref={amountInputRef}
                  className="w-full h-14 pl-10 pr-4 rounded-xl bg-surface-container-lowest/80 text-on-surface font-headline-md text-headline-md placeholder:text-outline-variant focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40 shadow-xs transition-all border border-outline-variant/30 font-bold"
                  id="amount"
                  placeholder="0.00"
                  required
                  type="number"
                  min="1"
                  step="any"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value);
                    setFormError(null);
                  }}
                />
              </div>
            </div>

            {/* Nature Toggle Pills: Need vs Want */}
            <div className="space-y-1.5">
              <label className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                Fiscal Nature (Need vs. Want)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNature('Need')}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-label-md font-semibold cursor-pointer transition-all ${
                    nature === 'Need'
                      ? 'bg-primary-fixed text-primary border-primary shadow-xs'
                      : 'bg-surface-container-lowest/70 text-on-surface-variant border-outline-variant/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">verified_user</span>
                  <span>Aavashyak (Need)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNature('Want')}
                  className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 font-label-md font-semibold cursor-pointer transition-all ${
                    nature === 'Want'
                      ? 'bg-secondary-fixed text-secondary border-secondary shadow-xs'
                      : 'bg-surface-container-lowest/70 text-on-surface-variant border-outline-variant/30'
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">spa</span>
                  <span>Aanand (Want)</span>
                </button>
              </div>
            </div>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label
                className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold"
                htmlFor="category"
              >
                Sreni (Category)
              </label>
              <select
                className="w-full h-12 px-4 rounded-xl bg-surface-container-lowest/70 text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30 cursor-pointer"
                id="category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              >
                <option value="Housing">Housing & Shelter (Aavas)</option>
                <option value="Ration">Food & Daily Ration (Ann)</option>
                <option value="Transit">Transit & Vehicle (Gaman)</option>
                <option value="Healthcare">Healthcare & Ayur (Arogya)</option>
                <option value="Dining">Dining Out & Cafes</option>
                <option value="Shopping">Shopping & Apparel</option>
                <option value="Utilities">Utilities & Bills</option>
                <option value="Decor">Home Decor & Festivals</option>
                <option value="Digital">Digital Subscriptions</option>
                <option value="Education">Education & Vidya</option>
                <option value="Leisure">Lifestyle & Leisure</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Date & Payment Mode in Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold"
                  htmlFor="expense-date"
                >
                  Outflow Date
                </label>
                <input
                  className="w-full h-12 px-3.5 rounded-xl bg-surface-container-lowest/70 text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30"
                  id="expense-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label
                  className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold"
                  htmlFor="payment-mode"
                >
                  Payment Mode
                </label>
                <select
                  className="w-full h-12 px-3.5 rounded-xl bg-surface-container-lowest/70 text-on-surface font-body-sm focus:outline-none focus:ring-2 focus:ring-primary/40 border border-outline-variant/30 cursor-pointer"
                  id="payment-mode"
                  value={paymentMode}
                  onChange={(e) => setPaymentMode(e.target.value as any)}
                >
                  <option value="UPI">Instant UPI (BHIM/GPay)</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="NetBanking">NetBanking / NEFT</option>
                  <option value="Cash">Cash (Nokad)</option>
                </select>
              </div>
            </div>

            {/* Optional Notes */}
            <div className="space-y-1.5">
              <label
                className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold"
                htmlFor="notes"
              >
                Notes (Optional)
              </label>
              <input
                id="notes"
                placeholder="e.g. Paid via ICICI UPI"
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-10 px-3.5 rounded-xl bg-surface-container-lowest/70 text-on-surface font-body-sm border border-outline-variant/30 focus:outline-none"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                className={`w-full h-12 rounded-xl font-label-lg text-label-lg tracking-wide uppercase shadow-[0_4px_16px_rgba(111,128,96,0.25)] flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer ${
                  submitSuccess
                    ? 'bg-tertiary text-on-tertiary'
                    : 'bg-primary hover:bg-primary-container text-on-primary'
                }`}
                disabled={isSubmitting}
                type="submit"
              >
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    isSubmitting ? 'animate-spin' : ''
                  }`}
                >
                  {isSubmitting ? 'refresh' : submitSuccess ? 'check_circle' : 'done_all'}
                </span>
                <span>
                  {isSubmitting
                    ? 'Archiving Outflow...'
                    : submitSuccess
                    ? 'Recorded in Ledger!'
                    : 'Record in Ledger'}
                </span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Visual Breakdown & Ledger Showcase */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Visual Ratio: Needs vs Wants Harmony Bar & Heritage Ghat Imagery */}
          <div
            className="rounded-3xl p-6 backdrop-blur-2xl shadow-[0_12px_40px_rgba(80,65,45,0.08)] flex flex-col gap-5 border border-white/60"
            style={{ background: 'rgba(255, 250, 240, 0.75)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                  Harmony Balance
                </span>
                <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Needs vs. Wants Allocation
                </h4>
              </div>

              <div className="flex items-center gap-4 text-label-sm font-semibold">
                <span className="flex items-center gap-1.5 text-primary">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" /> {metrics.needsRatio}% Needs
                </span>
                <span className="flex items-center gap-1.5 text-secondary">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary" /> {metrics.wantsRatio}% Wants
                </span>
              </div>
            </div>

            {/* Custom Segmented Visual Bar */}
            <div className="relative w-full h-8 rounded-full bg-surface-container-highest/80 p-1 flex items-center gap-1 overflow-hidden shadow-inner">
              <div
                className="bg-primary transition-all duration-500 h-full rounded-l-full flex items-center justify-center text-on-primary font-label-sm text-[10px] tracking-widest uppercase font-bold px-2 truncate"
                style={{ width: `${Math.max(5, metrics.needsRatio)}%` }}
              >
                Needs {formatINR(metrics.totalNeeds)}
              </div>
              <div
                className="bg-secondary transition-all duration-500 h-full rounded-r-full flex items-center justify-center text-on-secondary font-label-sm text-[10px] tracking-widest uppercase font-bold px-2 truncate"
                style={{ width: `${Math.max(5, metrics.wantsRatio)}%` }}
              >
                Wants {formatINR(metrics.totalWants)}
              </div>
            </div>

            {/* Heritage Sacred Ghat Visual Banner */}
            <div className="relative rounded-2xl overflow-hidden shadow-sm h-32 flex items-center">
              <img
                alt="Dawn breaking over ancient sandstone temple ghats"
                className="absolute inset-0 w-full h-full object-cover"
                src={GHAT_EXPENSE_IMAGE}
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/70 to-transparent flex items-center p-6">
                <div className="flex flex-col max-w-sm text-white">
                  <span className="font-label-sm text-label-sm uppercase tracking-widest text-amber-300 font-semibold">
                    Vedic Guidance
                  </span>
                  <p className="font-headline-sm text-[16px] text-white mt-0.5 leading-snug font-bold">
                    Mitavyaya: Spending without greed, conserving without poverty.
                  </p>
                  <span className="font-body-sm text-xs text-stone-200 mt-1">
                    Maintaining the threshold allows monthly surplus to flow smoothly into investments.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Transactions Ledger */}
          <div
            className="rounded-3xl p-6 backdrop-blur-2xl shadow-[0_12px_40px_rgba(80,65,45,0.08)] flex flex-col gap-5 border border-white/60"
            style={{ background: 'rgba(255, 250, 240, 0.75)' }}
          >
            {/* Table Header and Search / Filter Controls */}
            <div className="flex flex-col gap-4 pb-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
                    Pravaha (Ledger)
                  </span>
                  <h4 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    Recorded Outflows ({filteredExpenses.length})
                  </h4>
                </div>

                {/* Search in Ledger */}
                <div className="relative flex items-center w-full sm:w-60">
                  <span className="material-symbols-outlined absolute left-3 text-on-surface-variant text-[18px]">
                    search
                  </span>
                  <input
                    type="text"
                    placeholder="Search ledger..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-8 py-1.5 text-xs rounded-xl bg-surface-container-lowest/80 border border-outline-variant/30 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Pills and Sort Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-outline-variant/20">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  {(['All', 'Essentials', 'Lifestyle', 'UPI'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilter(t)}
                      className={`px-3 py-1 rounded-full font-label-sm text-xs font-semibold transition-all cursor-pointer ${
                        filter === t
                          ? 'bg-primary text-on-primary shadow-xs'
                          : 'bg-surface-container-high/70 hover:bg-surface-container-highest text-on-surface-variant'
                      }`}
                      type="button"
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-on-surface-variant font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="highest">Highest Amount</option>
                    <option value="lowest">Lowest Amount</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Empty State */}
            {filteredExpenses.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-surface-container-lowest/50 border border-dashed border-outline-variant/40">
                <span className="material-symbols-outlined text-[36px] text-on-surface-variant mb-2">
                  inbox
                </span>
                <p className="font-headline-sm text-base text-on-surface font-semibold">
                  No expense records found
                </p>
                <span className="text-xs text-on-surface-variant mt-1 max-w-xs">
                  {searchQuery
                    ? 'No matching expenses for your search term.'
                    : 'Log your first outflow in Lekhapatra to begin your conscious cashflow audit.'}
                </span>
              </div>
            ) : (
              /* Ledger Table List */
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider pb-3 border-b border-outline-variant/20">
                      <th className="py-3 px-3 font-semibold">Date & Details</th>
                      <th className="py-3 px-3 font-semibold">Category</th>
                      <th className="py-3 px-3 font-semibold">Nature</th>
                      <th className="py-3 px-3 font-semibold">Channel</th>
                      <th className="py-3 px-3 font-semibold text-right">Outlay</th>
                      <th className="py-3 px-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-on-surface/5">
                    {filteredExpenses.map((exp) => (
                      <tr
                        key={exp.id}
                        className="hover:bg-surface-container-lowest/50 transition-colors group"
                      >
                        <td className="py-3.5 px-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform ${
                                exp.nature === 'Need'
                                  ? 'bg-primary-fixed/50 text-primary'
                                  : 'bg-secondary-fixed/50 text-secondary'
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {exp.icon}
                              </span>
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-body-md text-body-md font-semibold text-on-surface truncate max-w-[160px] sm:max-w-none">
                                {exp.name}
                              </span>
                              <span className="font-body-sm text-xs text-on-surface-variant">
                                {exp.date} {exp.notes ? `· ${exp.notes}` : ''}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`px-2.5 py-1 rounded-full font-label-sm text-xs ${
                              exp.nature === 'Need'
                                ? 'bg-primary-fixed text-on-primary-fixed-variant'
                                : 'bg-secondary-fixed text-on-secondary-fixed-variant'
                            }`}
                          >
                            {exp.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 font-label-sm text-xs font-medium ${
                              exp.nature === 'Need' ? 'text-primary' : 'text-secondary'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                exp.nature === 'Need' ? 'bg-primary' : 'bg-secondary'
                              }`}
                            />{' '}
                            {exp.nature}
                          </span>
                        </td>

                        <td className="py-3.5 px-3 font-body-sm text-xs text-on-surface-variant">
                          {exp.channel}
                        </td>

                        <td className="py-3.5 px-3 text-right font-headline-sm text-headline-sm text-on-surface font-bold">
                          {formatINR(exp.amount)}
                        </td>

                        {/* Action buttons (Edit & Delete) */}
                        <td className="py-3.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setEditingExpense(exp)}
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
                              title="Edit Expense"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button
                              onClick={() => setDeletingExpense(exp)}
                              className="p-1.5 rounded-lg text-on-surface-variant hover:text-secondary hover:bg-surface-container transition-colors cursor-pointer"
                              title="Delete Expense"
                            >
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Ledger Footer Summary */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between text-body-sm text-on-surface-variant gap-3 border-t border-outline-variant/20">
              <div className="flex items-center gap-2 text-xs">
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                <span>All {expenses.length} records preserved in persistent storage</span>
              </div>
              <div className="text-xs font-bold text-on-surface">
                Total Shown: {formatINR(filteredExpenses.reduce((a, b) => a + b.amount, 0))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
