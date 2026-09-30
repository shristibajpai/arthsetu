import React, { useState, useEffect } from 'react';
import {
  GoalItem,
  ExpenseRecord,
  ExpenseCategory,
  NotificationItem,
  AllocationSettings,
} from '../types';
import { formatINR } from '../utils/formatters';

// -------------------------------------------------------------
// 1. NEW GOAL MODAL
// -------------------------------------------------------------
interface NewGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: GoalItem) => void;
}

export const NewGoalModal: React.FC<NewGoalModalProps> = ({ isOpen, onClose, onAddGoal }) => {
  const [title, setTitle] = useState('');
  const [categoryName, setCategoryName] = useState('Ghar Prapti');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [monthlySip, setMonthlySip] = useState('');
  const [targetDate, setTargetDate] = useState('2028-12-31');
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount);
    const current = parseFloat(currentAmount || '0');
    const monthly = parseFloat(monthlySip || '5000');

    if (!title.trim()) {
      setError('Please provide a milestone title.');
      return;
    }
    if (isNaN(target) || target <= 0) {
      setError('Target amount must be greater than zero.');
      return;
    }
    if (isNaN(current) || current < 0) {
      setError('Already saved amount cannot be negative.');
      return;
    }

    const percent = Math.min(100, Math.round((current / target) * 100));

    const newGoal: GoalItem = {
      id: `goal-${Date.now()}`,
      title: title.trim(),
      categoryName,
      horizonTag: `Target · ${new Date(targetDate).getFullYear() || 2028}`,
      badgeText: current >= target ? 'Completed' : percent > 50 ? 'On Track' : 'Auspicious Start',
      badgeType: current >= target ? 'auspicious' : percent > 50 ? 'on-track' : 'compounding',
      targetAmount: target,
      currentAmount: current,
      percent,
      monthlyAllocation: monthly,
      projectedDate: new Date(targetDate).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
      timelineDetails: details.trim() || `${title} dedicated milestone fund`,
      icon:
        categoryName === 'Ghar Prapti'
          ? 'home_work'
          : categoryName === 'Bachhon Ki Shiksha'
          ? 'school'
          : categoryName === 'Vahan Prapti'
          ? 'directions_car'
          : categoryName === 'Teerth & Parivar Yatra'
          ? 'temple_hindu'
          : 'flag',
      completed: current >= target,
    };

    onAddGoal(newGoal);
    // Reset form
    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setMonthlySip('');
    setDetails('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="rounded-3xl p-7 max-w-lg w-full shadow-2xl border border-white/60 space-y-5 animate-in zoom-in-95 duration-200"
        style={{ background: '#fffaf0' }}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-fixed flex items-center justify-center text-primary font-bold">
              <span className="material-symbols-outlined text-[22px]">flag</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                Create New Lakshya
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Formulate a deliberate financial milestone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface text-xl font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-secondary-fixed/50 text-secondary text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
              Lakshya Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Sabbatical in Himalayas, Laptop, Electric SUV"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError(null);
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                Domain Category
              </label>
              <select
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-sm focus:outline-none"
              >
                <option value="Ghar Prapti">Ghar Prapti (Real Estate)</option>
                <option value="Bachhon Ki Shiksha">Bachhon Ki Shiksha (Education)</option>
                <option value="Teerth & Parivar Yatra">Teerth Yatra (Pilgrimage)</option>
                <option value="Swatantrata">Swatantrata (Freedom Corpus)</option>
                <option value="Vahan Prapti">Vahan Prapti (Vehicle)</option>
                <option value="Technology & Growth">Technology & Tools</option>
                <option value="Personal Milestone">Personal Milestone</option>
              </select>
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                Target Date
              </label>
              <input
                type="date"
                required
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-sm focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                Target Amount (₹)
              </label>
              <input
                type="number"
                required
                min="1000"
                step="500"
                placeholder="80000"
                value={targetAmount}
                onChange={(e) => {
                  setTargetAmount(e.target.value);
                  setError(null);
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-headline-sm font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                Already Saved (₹)
              </label>
              <input
                type="number"
                min="0"
                step="500"
                placeholder="0"
                value={currentAmount}
                onChange={(e) => {
                  setCurrentAmount(e.target.value);
                  setError(null);
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-headline-sm font-bold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
              Monthly Dedicated Contribution (₹)
            </label>
            <input
              type="number"
              min="0"
              step="500"
              placeholder="5000"
              value={monthlySip}
              onChange={(e) => setMonthlySip(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-md focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
              Purpose & Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Dedicated high-yield index SIP pool"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-sm focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-label-md cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-xl bg-primary text-on-primary font-label-md font-semibold cursor-pointer shadow-md hover:bg-primary-container transition-all"
            >
              Consecrate Lakshya
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 2. EDIT GOAL MODAL
// -------------------------------------------------------------
interface EditGoalModalProps {
  goal: GoalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateGoal: (updatedGoal: GoalItem) => void;
}

export const EditGoalModal: React.FC<EditGoalModalProps> = ({
  goal,
  isOpen,
  onClose,
  onUpdateGoal,
}) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [monthlyAllocation, setMonthlyAllocation] = useState('');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setTargetAmount(goal.targetAmount.toString());
      setCurrentAmount(goal.currentAmount.toString());
      setMonthlyAllocation(goal.monthlyAllocation.toString());
    }
  }, [goal]);

  if (!isOpen || !goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(targetAmount) || 0;
    const current = parseFloat(currentAmount) || 0;
    const monthly = parseFloat(monthlyAllocation) || 0;
    const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;

    const updated: GoalItem = {
      ...goal,
      title: title.trim() || goal.title,
      targetAmount: target,
      currentAmount: current,
      monthlyAllocation: monthly,
      percent,
      completed: current >= target,
      badgeText: current >= target ? 'Completed' : percent > 50 ? 'On Track' : 'In Progress',
    };

    onUpdateGoal(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="rounded-3xl p-7 max-w-md w-full shadow-2xl border border-white/60 space-y-5 animate-in zoom-in-95 duration-200"
        style={{ background: '#fffaf0' }}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Edit Lakshya: {goal.title}
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface text-xl font-bold cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
              Lakshya Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-md focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                Target Amount (₹)
              </label>
              <input
                type="number"
                required
                min="1000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-headline-sm font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                Current Saved (₹)
              </label>
              <input
                type="number"
                min="0"
                value={currentAmount}
                onChange={(e) => setCurrentAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-headline-sm font-bold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
              Monthly Dedicated Contribution (₹)
            </label>
            <input
              type="number"
              min="0"
              value={monthlyAllocation}
              onChange={(e) => setMonthlyAllocation(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-md focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-label-md cursor-pointer hover:bg-surface-container-high"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md font-semibold cursor-pointer shadow-md hover:bg-primary-container"
            >
              Save Milestone
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 3. CONTRIBUTE / ADD MONEY TO GOAL MODAL
// -------------------------------------------------------------
interface ContributeGoalModalProps {
  goal: GoalItem | null;
  isOpen: boolean;
  onClose: () => void;
  onContribute: (goalId: string, amount: number) => void;
}

export const ContributeGoalModal: React.FC<ContributeGoalModalProps> = ({
  goal,
  isOpen,
  onClose,
  onContribute,
}) => {
  const [amount, setAmount] = useState('');

  if (!isOpen || !goal) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!isNaN(val) && val > 0) {
      onContribute(goal.id, val);
      setAmount('');
      onClose();
    }
  };

  const quickAdds = [2000, 5000, 10000, 25000];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="rounded-3xl p-7 max-w-sm w-full shadow-2xl border border-white/60 space-y-5 animate-in zoom-in-95 duration-200"
        style={{ background: '#fffaf0' }}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Deposit to Lakshya
            </h3>
            <p className="text-xs text-on-surface-variant truncate max-w-[220px]">
              {goal.title}
            </p>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface text-xl font-bold cursor-pointer">
            ✕
          </button>
        </div>

        <div className="p-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 flex justify-between items-center text-xs">
          <span className="text-on-surface-variant">Current Corpus</span>
          <span className="font-bold text-on-surface font-headline-sm text-sm">
            {formatINR(goal.currentAmount)} / {formatINR(goal.targetAmount)}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
              Deposit Amount (₹)
            </label>
            <input
              type="number"
              required
              min="100"
              step="100"
              placeholder="5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-headline-md font-bold focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {quickAdds.map((qa) => (
              <button
                key={qa}
                type="button"
                onClick={() => setAmount(qa.toString())}
                className="px-2.5 py-1 text-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-medium cursor-pointer"
              >
                +{formatINR(qa)}
              </button>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-label-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md font-semibold cursor-pointer shadow-md hover:bg-primary-container"
            >
              Confirm Deposit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 4. EDIT EXPENSE MODAL
// -------------------------------------------------------------
interface EditExpenseModalProps {
  expense: ExpenseRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateExpense: (expense: ExpenseRecord) => void;
}

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  expense,
  isOpen,
  onClose,
  onUpdateExpense,
}) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('Housing');
  const [nature, setNature] = useState<'Need' | 'Want'>('Need');
  const [date, setDate] = useState('');
  const [channel, setChannel] = useState<'UPI' | 'NetBanking' | 'Credit Card' | 'Cash'>('UPI');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (expense) {
      setName(expense.name);
      setAmount(expense.amount.toString());
      setCategory(expense.category);
      setNature(expense.nature);
      setDate(expense.date);
      setChannel(expense.channel);
      setNotes(expense.notes || '');
    }
  }, [expense]);

  if (!isOpen || !expense) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!name.trim() || isNaN(val) || val <= 0) return;

    const updated: ExpenseRecord = {
      ...expense,
      name: name.trim(),
      amount: val,
      category,
      nature,
      date: date || expense.date,
      channel,
      notes: notes.trim(),
    };

    onUpdateExpense(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="rounded-3xl p-7 max-w-md w-full shadow-2xl border border-white/60 space-y-4 animate-in zoom-in-95 duration-200"
        style={{ background: '#fffaf0' }}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Edit Expense Outflow
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface text-xl font-bold cursor-pointer">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
              Expense Description
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-md focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                Amount (₹)
              </label>
              <input
                type="number"
                required
                min="1"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-headline-sm font-bold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                Nature
              </label>
              <select
                value={nature}
                onChange={(e) => setNature(e.target.value as 'Need' | 'Want')}
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-sm focus:outline-none font-semibold"
              >
                <option value="Need">Aavashyak (Need)</option>
                <option value="Want">Aanand (Want)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-sm focus:outline-none"
              >
                <option value="Housing">Housing</option>
                <option value="Ration">Ration & Grocery</option>
                <option value="Transit">Transportation</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Dining">Dining</option>
                <option value="Shopping">Shopping</option>
                <option value="Decor">Decor</option>
                <option value="Digital">Digital & Subscriptions</option>
                <option value="Leisure">Leisure & Lifestyle</option>
                <option value="Education">Education</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                Payment Mode
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full px-3 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-sm focus:outline-none"
              >
                <option value="UPI">UPI</option>
                <option value="Credit Card">Credit Card</option>
                <option value="NetBanking">NetBanking</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-label-md cursor-pointer hover:bg-surface-container-high"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md font-semibold cursor-pointer shadow-md hover:bg-primary-container"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 5. ADJUST ALLOCATION MODAL (Uses real Monthly Income)
// -------------------------------------------------------------
interface AdjustAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyIncome: number;
  currentAllocations: AllocationSettings;
  onSave: (allocations: AllocationSettings) => void;
}

export const AdjustAllocationModal: React.FC<AdjustAllocationModalProps> = ({
  isOpen,
  onClose,
  monthlyIncome,
  currentAllocations,
  onSave,
}) => {
  const [savings, setSavings] = useState(currentAllocations?.savings ?? 30);
  const [needs, setNeeds] = useState(currentAllocations?.needs ?? 38);
  const [goals, setGoals] = useState(currentAllocations?.goals ?? 15);
  const [wants, setWants] = useState(currentAllocations?.wants ?? 12);
  const [buffer, setBuffer] = useState(currentAllocations?.buffer ?? 5);

  useEffect(() => {
    if (currentAllocations) {
      setSavings(currentAllocations.savings);
      setNeeds(currentAllocations.needs);
      setGoals(currentAllocations.goals);
      setWants(currentAllocations.wants);
      setBuffer(currentAllocations.buffer);
    }
  }, [currentAllocations, isOpen]);

  if (!isOpen) return null;

  const total = savings + needs + goals + wants + buffer;
  const income = monthlyIncome > 0 ? monthlyIncome : 185000;

  const handleSave = () => {
    onSave({ savings, needs, goals, wants, buffer });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="rounded-3xl p-7 max-w-md w-full shadow-2xl border border-white/60 space-y-5 animate-in zoom-in-95 duration-200"
        style={{ background: '#fffaf0' }}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Adjust Monthly Allocation
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface text-xl font-bold cursor-pointer">
            ✕
          </button>
        </div>

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Adjust the 100% Zero-Sum monthly distribution for your {formatINR(income)} monthly income.
        </p>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Planned Savings (Priority 1st): {savings}%</span>
              <span>{formatINR(Math.round((income * savings) / 100))}</span>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              value={savings}
              onChange={(e) => setSavings(parseInt(e.target.value, 10))}
              className="w-full accent-primary cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Essential Needs: {needs}%</span>
              <span>{formatINR(Math.round((income * needs) / 100))}</span>
            </div>
            <input
              type="range"
              min="15"
              max="70"
              value={needs}
              onChange={(e) => setNeeds(parseInt(e.target.value, 10))}
              className="w-full accent-secondary cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Financial Goals: {goals}%</span>
              <span>{formatINR(Math.round((income * goals) / 100))}</span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              value={goals}
              onChange={(e) => setGoals(parseInt(e.target.value, 10))}
              className="w-full accent-tertiary cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Lifestyle & Wants: {wants}%</span>
              <span>{formatINR(Math.round((income * wants) / 100))}</span>
            </div>
            <input
              type="range"
              min="0"
              max="35"
              value={wants}
              onChange={(e) => setWants(parseInt(e.target.value, 10))}
              className="w-full accent-primary-container cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold mb-1">
              <span>Discretionary Buffer: {buffer}%</span>
              <span>{formatINR(Math.round((income * buffer) / 100))}</span>
            </div>
            <input
              type="range"
              min="0"
              max="20"
              value={buffer}
              onChange={(e) => setBuffer(parseInt(e.target.value, 10))}
              className="w-full accent-outline-variant cursor-pointer"
            />
          </div>
        </div>

        <div
          className={`p-3 rounded-xl flex items-center justify-between text-xs font-bold ${
            total === 100
              ? 'bg-primary-fixed text-primary'
              : 'bg-secondary-container text-secondary'
          }`}
        >
          <span>Total Allocation: {total}%</span>
          <span>{total === 100 ? 'Balanced (Zero-Sum)' : `Offset: ${total - 100}%`}</span>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant/30">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-label-md cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md font-semibold cursor-pointer shadow-md hover:bg-primary-container"
          >
            Apply Allocation
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 6. BUDGET LIMIT MODAL
// -------------------------------------------------------------
interface BudgetLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLimit: number;
  onSave: (newLimit: number) => void;
}

export const BudgetLimitModal: React.FC<BudgetLimitModalProps> = ({
  isOpen,
  onClose,
  currentLimit,
  onSave,
}) => {
  const [limit, setLimit] = useState(currentLimit);

  useEffect(() => {
    setLimit(currentLimit);
  }, [currentLimit, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div
        className="rounded-3xl p-7 max-w-sm w-full shadow-2xl border border-white/60 space-y-4 animate-in zoom-in-95 duration-200"
        style={{ background: '#fffaf0' }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            Set Monthly Outflow Threshold
          </h3>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface text-xl font-bold cursor-pointer">
            ✕
          </button>
        </div>
        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Define the auspicious monthly expenditure boundary to safeguard your surplus cashflow.
        </p>

        <div>
          <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
            Threshold Limit (₹)
          </label>
          <input
            type="number"
            step="1000"
            min="1000"
            value={limit}
            onChange={(e) => setLimit(parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-headline-md font-bold focus:outline-none"
          />
        </div>

        <div className="flex justify-end gap-3 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-label-md cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(limit);
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-primary text-on-primary font-label-md font-semibold cursor-pointer shadow-md hover:bg-primary-container"
          >
            Update Limit
          </button>
        </div>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// 7. NOTIFICATIONS MODAL
// -------------------------------------------------------------
interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/35 backdrop-blur-xs p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white/60 space-y-4 animate-in slide-in-from-right duration-200 mt-16"
        style={{ background: '#fffaf0' }}
      >
        <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary text-[22px]">notifications</span>
            <h3 className="font-headline-sm text-[18px] text-on-surface font-semibold">
              Auspicious Notifications
            </h3>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface text-xl font-bold cursor-pointer">
            ✕
          </button>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3.5 rounded-2xl border transition-all ${
                item.read
                  ? 'bg-surface-container-lowest/70 border-outline-variant/20'
                  : 'bg-secondary-fixed/30 border-secondary-fixed shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-secondary">{item.title}</span>
                <span className="text-on-surface-variant">{item.time}</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">{item.message}</p>
            </div>
          ))}
        </div>

        <div className="pt-2 flex justify-between items-center border-t border-outline-variant/30">
          <button
            onClick={onMarkAllRead}
            className="text-xs text-primary font-semibold hover:underline cursor-pointer"
          >
            Mark all as acknowledged
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-surface-container text-on-surface font-label-sm font-semibold cursor-pointer hover:bg-surface-container-high"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
