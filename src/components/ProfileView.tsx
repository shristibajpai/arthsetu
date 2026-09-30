import React, { useState, useEffect } from 'react';
import { UserProfile, FinancialHealthBreakdown } from '../types';
import { formatINR } from '../utils/formatters';
import { ConfirmationModal } from './ConfirmationModal';

interface ProfileViewProps {
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  healthMetrics: FinancialHealthBreakdown;
  onResetAllData?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  profile,
  onUpdateProfile,
  healthMetrics,
  onResetAllData,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UserProfile>(profile);
  const [monthlyInput, setMonthlyInput] = useState(profile.monthlyIncome.toString());
  const [annualInput, setAnnualInput] = useState(profile.annualIncome.toString());
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setFormData(profile);
    setMonthlyInput(profile.monthlyIncome.toString());
    setAnnualInput(profile.annualIncome.toString());
  }, [profile]);

  // Handle synchronized monthly <-> annual income calculations
  const handleMonthlyChange = (val: string) => {
    setMonthlyInput(val);
    setValidationError(null);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const ann = Math.round(num * 12);
      setAnnualInput(ann.toString());
      setFormData((prev) => ({
        ...prev,
        monthlyIncome: num,
        annualIncome: ann,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        monthlyIncome: 0,
      }));
    }
  };

  const handleAnnualChange = (val: string) => {
    setAnnualInput(val);
    setValidationError(null);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0) {
      const mo = Math.round(num / 12);
      setMonthlyInput(mo.toString());
      setFormData((prev) => ({
        ...prev,
        annualIncome: num,
        monthlyIncome: mo,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        annualIncome: 0,
      }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setValidationError('Please enter a valid full name.');
      return;
    }
    if (formData.monthlyIncome <= 0 || isNaN(formData.monthlyIncome)) {
      setValidationError('Please enter a valid monthly income greater than 0.');
      return;
    }

    onUpdateProfile(formData);
    setIsEditing(false);
    setValidationError(null);
    setToastMessage('Profile and income settings saved successfully!');
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCancel = () => {
    setFormData(profile);
    setMonthlyInput(profile.monthlyIncome.toString());
    setAnnualInput(profile.annualIncome.toString());
    setValidationError(null);
    setIsEditing(false);
  };

  // Tax calculations based on user's actual annual income
  const annual = formData.annualIncome || profile.annualIncome;
  // Simplified Indian New Tax Regime FY 2025-26 (Standard Deduction ₹75k)
  const taxableNew = Math.max(0, annual - 75000);
  let estTaxNew = 0;
  if (taxableNew > 1500000) {
    estTaxNew = 150000 + (taxableNew - 1500000) * 0.3;
  } else if (taxableNew > 1200000) {
    estTaxNew = 90000 + (taxableNew - 1200000) * 0.2;
  } else if (taxableNew > 900000) {
    estTaxNew = 45000 + (taxableNew - 900000) * 0.15;
  } else if (taxableNew > 700000) {
    estTaxNew = (taxableNew - 700000) * 0.1;
  }

  // Simplified Old Tax Regime with standard deductions
  const taxableOld = Math.max(0, annual - 250000);
  let estTaxOld = Math.round(taxableOld * 0.22);
  const taxAdvantage = Math.max(0, Math.round(estTaxOld - estTaxNew));

  return (
    <div className="flex flex-col w-full gap-8 pb-16">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          <span className="font-label-md text-label-md font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Confirmation for Reset Data */}
      <ConfirmationModal
        isOpen={isResetConfirmOpen}
        title="Reset All Financial Data?"
        message="This will clear all custom expenses, goals, and profile updates, restoring initial baseline records. This action cannot be undone."
        confirmLabel="Reset Everything"
        isDestructive={true}
        onConfirm={() => {
          setIsResetConfirmOpen(false);
          if (onResetAllData) onResetAllData();
          setToastMessage('All application data restored to defaults.');
          setTimeout(() => setToastMessage(null), 3000);
        }}
        onCancel={() => setIsResetConfirmOpen(false)}
      />

      {/* Header Card */}
      <div
        className="rounded-3xl p-8 lg:p-10 border border-white/60 shadow-xl relative overflow-hidden"
        style={{
          background: 'rgba(255, 250, 240, 0.75)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-primary-fixed/30 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-3xl bg-primary text-on-primary flex items-center justify-center text-3xl font-headline-lg font-bold shadow-md">
              {profile.name
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'AS'}
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                  {profile.name}
                </h2>
                <span className="px-3 py-1 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold">
                  Verified Family Karta
                </span>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mt-1">
                {profile.occupation} · {profile.location}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-label-sm text-on-surface-variant mt-2">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-tertiary">mail</span>
                  {profile.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px] text-secondary">shield</span>
                  Vittiya Santulan: {healthMetrics.score}/100
                </span>
                <span>•</span>
                <span className="text-primary font-bold">
                  Monthly: {formatINR(profile.monthlyIncome)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-5 py-2.5 rounded-xl bg-surface-container-lowest text-on-surface font-label-md text-label-md font-semibold shadow-xs border border-outline-variant/30 cursor-pointer hover:bg-surface-container transition-colors"
                >
                  Edit Profile & Income
                </button>
                {onResetAllData && (
                  <button
                    onClick={() => setIsResetConfirmOpen(true)}
                    className="p-2.5 rounded-xl bg-surface-container text-on-surface-variant hover:text-secondary hover:bg-surface-container-high transition-colors cursor-pointer"
                    title="Reset Application Data"
                  >
                    <span className="material-symbols-outlined text-[20px]">restart_alt</span>
                  </button>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {/* EDIT PROFILE FORM */}
      {isEditing && (
        <form
          onSubmit={handleSave}
          className="rounded-3xl p-8 shadow-xl border border-primary/30 space-y-6 animate-in slide-in-from-top-4 duration-300"
          style={{
            background: 'rgba(255, 250, 240, 0.95)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                Edit Financial Identity & Income
              </h3>
              <p className="font-body-sm text-xs text-on-surface-variant">
                Changes immediately recalculate your savings, budget, allocations, and health score.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-bold">
              Active Editing
            </span>
          </div>

          {validationError && (
            <div className="p-3.5 rounded-xl bg-secondary-fixed/50 text-secondary text-sm font-semibold flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">error</span>
              <span>{validationError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                Age
              </label>
              <input
                type="number"
                min="18"
                max="100"
                value={formData.age || ''}
                onChange={(e) =>
                  setFormData({ ...formData, age: parseInt(e.target.value, 10) || 0 })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                Occupation / Title
              </label>
              <input
                type="text"
                value={formData.occupation}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-md focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {/* Synchronized Income Section */}
          <div className="p-5 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/30 space-y-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">
                account_balance
              </span>
              <h4 className="font-label-lg font-bold text-on-surface">
                Income Architecture (Synchronized Input)
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                  Monthly In-Hand Income (₹)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 font-bold text-on-surface-variant">₹</span>
                  <input
                    type="number"
                    required
                    min="1000"
                    step="500"
                    value={monthlyInput}
                    onChange={(e) => handleMonthlyChange(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-headline-sm font-bold text-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <span className="text-[11px] text-on-surface-variant mt-1 block">
                  Takes effect across all spending, savings, and What-If models.
                </span>
              </div>

              <div>
                <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                  Annual In-Hand Income (₹)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 font-bold text-on-surface-variant">₹</span>
                  <input
                    type="number"
                    min="12000"
                    step="5000"
                    value={annualInput}
                    onChange={(e) => handleAnnualChange(e.target.value)}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-headline-sm font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                <span className="text-[11px] text-on-surface-variant mt-1 block">
                  Calculated automatically (Monthly × 12).
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                Risk Preference
              </label>
              <select
                value={formData.riskPreference}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    riskPreference: e.target.value as any,
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-sm focus:outline-none"
              >
                <option value="Conservative (Suraksha)">Conservative (Suraksha)</option>
                <option value="Balanced Growth (Madhyam Marg)">
                  Balanced Growth (Madhyam Marg)
                </option>
                <option value="Aggressive Growth (Tejas)">Aggressive Growth (Tejas)</option>
              </select>
            </div>

            <div>
              <label className="block text-label-sm font-semibold text-on-surface-variant uppercase mb-1">
                Tax Regime Preference
              </label>
              <select
                value={formData.taxRegime}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    taxRegime: e.target.value as 'new' | 'old',
                  })
                }
                className="w-full px-4 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-sm focus:outline-none"
              >
                <option value="new">New Tax Regime (Section 115BAC)</option>
                <option value="old">Old Tax Regime (with 80C/80D Deductions)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-outline-variant/30">
            <button
              type="button"
              onClick={handleCancel}
              className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-7 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-semibold cursor-pointer shadow-md hover:bg-primary-container transition-all"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Tax & Cashflow Profile (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Income & Tax Optimization Section */}
          <div
            className="rounded-3xl p-8 shadow-xl border border-white/60 space-y-6"
            style={{
              background: 'rgba(255, 250, 240, 0.72)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                  Income & Tax Architecture
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1 font-semibold">
                  FY 2025-26 Tax Regime Optimization
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-primary-fixed/50 text-primary font-label-sm text-label-sm font-bold">
                {formatINR(taxAdvantage)} Annual Advantage Active
              </span>
            </div>

            {/* Tax Regime Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                onClick={() => onUpdateProfile({ ...profile, taxRegime: 'new' })}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  profile.taxRegime === 'new'
                    ? 'border-primary bg-primary-fixed/20 shadow-md'
                    : 'border-outline-variant/30 bg-surface-container-lowest/60 hover:bg-surface-container-lowest'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-[17px] font-bold text-on-surface">
                    New Tax Regime (Sec 115BAC)
                  </span>
                  {profile.taxRegime === 'new' && (
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      check_circle
                    </span>
                  )}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                  Standard deduction of ₹75,000 + reduced slab brackets. Optimal for your CTC with minimal documentation friction.
                </p>
                <div className="mt-3 text-headline-sm text-primary font-bold text-[18px]">
                  Estimated Tax: {formatINR(estTaxNew)}
                </div>
              </div>

              <div
                onClick={() => onUpdateProfile({ ...profile, taxRegime: 'old' })}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                  profile.taxRegime === 'old'
                    ? 'border-secondary bg-secondary-fixed/20 shadow-md'
                    : 'border-outline-variant/30 bg-surface-container-lowest/60 hover:bg-surface-container-lowest'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-headline-sm text-[17px] font-bold text-on-surface">
                    Old Tax Regime (With 80C/80D)
                  </span>
                  {profile.taxRegime === 'old' && (
                    <span className="material-symbols-outlined text-secondary text-[20px]">
                      check_circle
                    </span>
                  )}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                  Requires ₹1.5L in 80C + ₹50k NPS (80CCD1B) + rent receipts to break even with New Regime.
                </p>
                <div className="mt-3 text-headline-sm text-secondary font-bold text-[18px]">
                  Estimated Tax: {formatINR(estTaxOld)}
                </div>
              </div>
            </div>

            {/* Income Streams */}
            <div className="space-y-3 pt-2">
              <h4 className="font-label-md text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">
                Income Components (Based on Real Profile)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-xl bg-surface-container-lowest/70 border border-outline-variant/20">
                  <span className="text-xs text-on-surface-variant block">Monthly In-Hand</span>
                  <span className="font-headline-sm text-[16px] font-bold text-primary">
                    {formatINR(profile.monthlyIncome)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-lowest/70 border border-outline-variant/20">
                  <span className="text-xs text-on-surface-variant block">Annual Income</span>
                  <span className="font-headline-sm text-[16px] font-bold text-on-surface">
                    {formatINR(profile.annualIncome)}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-surface-container-lowest/70 border border-outline-variant/20">
                  <span className="text-xs text-on-surface-variant block">Risk Stance</span>
                  <span className="font-headline-sm text-[14px] font-bold text-tertiary truncate block">
                    {profile.riskPreference.split(' ')[0]}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Family Constellation */}
          <div
            className="rounded-3xl p-8 shadow-xl border border-white/60 space-y-5"
            style={{
              background: 'rgba(255, 250, 240, 0.72)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-tertiary font-semibold">
                  Parivar Constellation
                </span>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1 font-semibold">
                  Family Dependents & Healthcare Cover
                </h3>
              </div>
              <span className="text-label-sm font-semibold text-primary">4 Members Protected</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-surface-container-lowest/70 border border-outline-variant/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary-fixed/60 flex items-center justify-center text-secondary font-bold">
                  P
                </div>
                <div className="flex flex-col">
                  <span className="font-label-lg font-semibold text-on-surface">Pooja Sharma</span>
                  <span className="text-xs text-on-surface-variant">Spouse · Architect & Homemaker</span>
                  <span className="text-[11px] text-primary font-medium mt-0.5">Covered: ₹15L Floater</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-lowest/70 border border-outline-variant/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-fixed/60 flex items-center justify-center text-primary font-bold">
                  A
                </div>
                <div className="flex flex-col">
                  <span className="font-label-lg font-semibold text-on-surface">Ananya Sharma</span>
                  <span className="text-xs text-on-surface-variant">Daughter (Age 8) · Grade 3</span>
                  <span className="text-[11px] text-primary font-medium mt-0.5">Sukanya Samriddhi Active</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-lowest/70 border border-outline-variant/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/60 flex items-center justify-center text-tertiary font-bold">
                  R
                </div>
                <div className="flex flex-col">
                  <span className="font-label-lg font-semibold text-on-surface">Ramesh Sharma</span>
                  <span className="text-xs text-on-surface-variant">Father (Age 68) · Retired Teacher</span>
                  <span className="text-[11px] text-primary font-medium mt-0.5">Senior Citizen Mediclaim</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-lowest/70 border border-outline-variant/20 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-tertiary-fixed/60 flex items-center justify-center text-tertiary font-bold">
                  S
                </div>
                <div className="flex flex-col">
                  <span className="font-label-lg font-semibold text-on-surface">Savitri Sharma</span>
                  <span className="text-xs text-on-surface-variant">Mother (Age 64)</span>
                  <span className="text-[11px] text-primary font-medium mt-0.5">Senior Citizen Mediclaim</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Connected Accounts & Asset Pool (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* Wealth Asset Pool Breakdown */}
          <div
            className="rounded-3xl p-8 shadow-xl border border-white/60 space-y-6"
            style={{
              background: 'rgba(255, 250, 240, 0.72)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-secondary font-semibold">
                Samriddhi Sangraha
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1 font-semibold">
                Asset Allocation Portfolio
              </h3>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-body-sm font-medium mb-1">
                  <span>Domestic Equity (Nifty 50 + Midcap)</span>
                  <span className="font-bold text-primary">54% · ₹67,80,000</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-2">
                  <div className="bg-primary h-full rounded-full" style={{ width: '54%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-body-sm font-medium mb-1">
                  <span>Debt Instruments & EPF</span>
                  <span className="font-bold text-secondary">26% · ₹32,60,000</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-2">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '26%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-body-sm font-medium mb-1">
                  <span>Sovereign Gold Bonds (SGB)</span>
                  <span className="font-bold text-tertiary">12% · ₹15,10,000</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-2">
                  <div className="bg-tertiary h-full rounded-full" style={{ width: '12%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-body-sm font-medium mb-1">
                  <span>Liquid Cash & Arbitrage</span>
                  <span className="font-bold text-on-surface">8% · ₹10,20,000</span>
                </div>
                <div className="w-full bg-surface-container-highest rounded-full h-2">
                  <div className="bg-outline h-full rounded-full" style={{ width: '8%' }} />
                </div>
              </div>
            </div>
          </div>

          {/* Connected Financial Institutions */}
          <div
            className="rounded-3xl p-8 shadow-xl border border-white/60 space-y-4"
            style={{
              background: 'rgba(255, 250, 240, 0.72)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">
                Connected Institutions
              </span>
              <span className="text-xs text-primary font-bold">Auto-Sync On</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary-fixed/80 flex items-center justify-center text-primary font-bold text-xs">
                    HDFC
                  </div>
                  <div>
                    <span className="font-label-md font-semibold text-on-surface block">
                      HDFC Salary Account
                    </span>
                    <span className="text-xs text-on-surface-variant">A/c ending in •••• 4092</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary">Connected</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary-fixed/80 flex items-center justify-center text-secondary font-bold text-xs">
                    ZER
                  </div>
                  <div>
                    <span className="font-label-md font-semibold text-on-surface block">
                      Zerodha Demat (Coin & Kite)
                    </span>
                    <span className="text-xs text-on-surface-variant">Client ID: AR5920</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary">Connected</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-surface-container-lowest/80 border border-outline-variant/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-tertiary-fixed/80 flex items-center justify-center text-tertiary font-bold text-xs">
                    EPFO
                  </div>
                  <div>
                    <span className="font-label-md font-semibold text-on-surface block">
                      Employees Provident Fund
                    </span>
                    <span className="text-xs text-on-surface-variant">UAN: {profile.epfUan}</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-primary">Verified</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
