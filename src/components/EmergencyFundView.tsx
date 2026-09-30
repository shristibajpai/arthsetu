import React, { useState, useMemo } from 'react';
import { EmergencyFundData } from '../types';
import { formatINR } from '../utils/formatters';
import { calculateEmergencyMetrics } from '../utils/calculations';

export const GHAT_EMERGENCY_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCsk3Js5J_Ec2fVZwQNUOT7s7fKi6k2qhDNg1qBlPBCaftk29VLzXPAVMSAgZ2VNz-mdaPq1Xz4i6qlwusIDGe3kZnJlx-TfSYNtnlU2jUI4ZVMkyG4BXfn0xNq1fA54i5Z51v51g';

interface EmergencyFundViewProps {
  emergencyFund: EmergencyFundData;
  onUpdateEmergencyFund: (data: EmergencyFundData) => void;
  actualNeedsExpense: number;
}

export const EmergencyFundView: React.FC<EmergencyFundViewProps> = ({
  emergencyFund,
  onUpdateEmergencyFund,
  actualNeedsExpense,
}) => {
  // Local state for editing current fund balance directly
  const [isEditingFund, setIsEditingFund] = useState(false);
  const [editFundInput, setEditFundInput] = useState(emergencyFund.currentAmount.toString());

  // Target months adjustment
  const [targetMonths, setTargetMonths] = useState(emergencyFund.targetMonths || 6);

  // Custom monthly burn vs auto from actual Needs
  const [useCustomBurn, setUseCustomBurn] = useState(
    emergencyFund.customMonthlyExpense ? emergencyFund.customMonthlyExpense > 0 : false
  );
  const [customBurnInput, setCustomBurnInput] = useState(
    (emergencyFund.customMonthlyExpense || actualNeedsExpense || 50000).toString()
  );

  // Deposit quick-add state
  const [depositAmount, setDepositAmount] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Compute live metrics
  const activeMonthlyExpense = useCustomBurn
    ? parseFloat(customBurnInput) || 50000
    : actualNeedsExpense > 0
    ? actualNeedsExpense
    : 50000;

  const metrics = useMemo(() => {
    return calculateEmergencyMetrics(
      {
        ...emergencyFund,
        targetMonths,
        customMonthlyExpense: useCustomBurn ? activeMonthlyExpense : 0,
      },
      actualNeedsExpense
    );
  }, [emergencyFund, targetMonths, useCustomBurn, activeMonthlyExpense, actualNeedsExpense]);

  const handleSaveFund = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(editFundInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateEmergencyFund({
        ...emergencyFund,
        currentAmount: val,
        targetMonths,
        customMonthlyExpense: useCustomBurn ? activeMonthlyExpense : 0,
      });
      setIsEditingFund(false);
      setToastMessage('Emergency fund balance updated successfully.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const handleQuickDeposit = (addAmount: number) => {
    const updatedAmount = emergencyFund.currentAmount + addAmount;
    onUpdateEmergencyFund({
      ...emergencyFund,
      currentAmount: updatedAmount,
    });
    setEditFundInput(updatedAmount.toString());
    setToastMessage(`Deposited ${formatINR(addAmount)} into Aapda Kosh!`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleTargetMonthsChange = (newMonths: number) => {
    setTargetMonths(newMonths);
    onUpdateEmergencyFund({
      ...emergencyFund,
      targetMonths: newMonths,
      customMonthlyExpense: useCustomBurn ? activeMonthlyExpense : 0,
    });
  };

  const handleCustomBurnToggle = (custom: boolean) => {
    setUseCustomBurn(custom);
    onUpdateEmergencyFund({
      ...emergencyFund,
      customMonthlyExpense: custom ? parseFloat(customBurnInput) || 50000 : 0,
    });
  };

  const handleLockStrategy = () => {
    setIsLocked(true);
    setToastMessage('Aapda Kosh rebalancing strategy locked into automatic SIP routing!');
    setTimeout(() => {
      setIsLocked(false);
      setToastMessage(null);
    }, 4000);
  };

  const recommendedSip =
    metrics.remainingDeficit > 0 ? Math.ceil(metrics.remainingDeficit / 6) : 0;

  return (
    <div className="flex flex-col w-full gap-8 pb-16">
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-[20px]">verified</span>
          <span className="font-label-md text-label-md font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden shadow-2xl p-8 lg:p-12 border border-white/60">
        <img
          alt="Serene sacred riverbank at dawn with ancient stone ghats"
          className="absolute inset-0 w-full h-full object-cover"
          src={GHAT_EMERGENCY_IMAGE}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/90 via-stone-900/80 to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col max-w-2xl text-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-amber-300 text-[20px]">
                shield_with_heart
              </span>
              <span className="font-label-sm text-label-sm uppercase tracking-widest text-amber-300 font-semibold">
                Financial Fortress & Buffer
              </span>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-white mt-1 font-bold">
              Aapda Kosh — Emergency Fund & Safety Runway
            </h2>
            <p className="font-body-md text-body-md text-stone-200 mt-2 leading-relaxed">
              In Vedic governance, a king’s first duty was the grain treasury (*Koshadhikara*). For
              the modern family karta, an unshakeable liquid buffer grants the profound peace of
              mind (*Nirbhaya*) necessary to pursue ambitious long-term goals without fear of market
              downturns.
            </p>
          </div>

          {/* Kavach Status Card */}
          <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/70 flex items-center gap-4 shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-primary-fixed/80 flex items-center justify-center text-primary shrink-0 shadow-sm">
              <span className="material-symbols-outlined text-[30px]">shield</span>
            </div>

            <div className="flex flex-col pr-2">
              <div className="flex items-center gap-1.5 text-primary font-label-md font-semibold">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span>Suraksha Kavach {metrics.progressPercent}% Active</span>
              </div>
              <span className="font-headline-sm text-headline-sm text-on-surface mt-0.5 font-bold">
                {formatINR(metrics.currentAmount)} / {formatINR(metrics.targetAmount)}
              </span>
              <span className="font-label-sm text-xs text-on-surface-variant">
                {metrics.monthsCovered >= targetMonths
                  ? 'Fortress fully protected and funded'
                  : `${formatINR(metrics.remainingDeficit)} remaining to target`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 Vital Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Card 1: Current Buffer */}
        <div
          className="relative min-h-[195px] rounded-2xl backdrop-blur-md p-6 shadow-md border border-white/60 flex flex-col justify-between"
          style={{ background: 'rgba(255, 250, 240, 0.8)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
              Current Buffer
            </span>
            <button
              onClick={() => setIsEditingFund(!isEditingFund)}
              className="text-xs px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold cursor-pointer"
            >
              {isEditingFund ? 'Close' : 'Update'}
            </button>
          </div>

          {isEditingFund ? (
            <form onSubmit={handleSaveFund} className="my-2 space-y-2">
              <input
                type="number"
                min="0"
                step="1000"
                value={editFundInput}
                onChange={(e) => setEditFundInput(e.target.value)}
                className="w-full px-3 py-1.5 text-sm rounded-lg bg-surface-container-lowest font-bold border border-outline-variant/40"
              />
              <button
                type="submit"
                className="w-full py-1 text-xs rounded-lg bg-primary text-on-primary font-bold cursor-pointer"
              >
                Save Balance
              </button>
            </form>
          ) : (
            <div className="mt-3">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                {formatINR(metrics.currentAmount)}
              </span>
              <div className="flex items-center gap-1.5 mt-1 text-primary">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span className="font-label-sm text-xs font-semibold">Liquid & accessible 24/7</span>
              </div>
            </div>
          )}

          <div>
            <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-primary-container h-full rounded-full transition-all duration-500"
                style={{ width: `${metrics.progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-on-surface-variant mt-1.5">
              <span>{metrics.progressPercent}% funded</span>
              <span className="font-bold text-primary">
                {metrics.monthsCovered.toFixed(1)} Mos Covered
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Safety Runway */}
        <div
          className="relative min-h-[195px] rounded-2xl backdrop-blur-md p-6 shadow-md border border-white/60 flex flex-col justify-between"
          style={{ background: 'rgba(255, 250, 240, 0.8)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
              Safety Runway
            </span>
            <div className="w-8 h-8 rounded-xl bg-secondary-fixed/60 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
            </div>
          </div>

          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
                {metrics.monthsCovered.toFixed(1)}
              </span>
              <span className="font-headline-sm text-headline-sm text-secondary font-semibold">
                Months
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1 text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-secondary">trending_up</span>
              <span className="font-label-sm text-xs">
                Based on {formatINR(metrics.monthlyEssentialExpenses)}/mo burn
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-on-surface-variant border-t border-outline-variant/20 pt-2">
            <span>Target: {targetMonths}.0 Months</span>
            <span className="text-secondary font-bold">
              {metrics.monthsCovered >= targetMonths
                ? 'Target Met'
                : `${(targetMonths - metrics.monthsCovered).toFixed(1)} mos to go`}
            </span>
          </div>
        </div>

        {/* Card 3: Recommended Addition */}
        <div
          className="relative min-h-[195px] rounded-2xl backdrop-blur-md p-6 shadow-md border border-white/60 flex flex-col justify-between"
          style={{ background: 'rgba(255, 250, 240, 0.8)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
              Recommended Addition
            </span>
            <div className="w-8 h-8 rounded-xl bg-tertiary-fixed/60 flex items-center justify-center text-tertiary">
              <span className="material-symbols-outlined text-[18px]">calendar_month</span>
            </div>
          </div>

          <div className="mt-2">
            <span className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              {recommendedSip > 0 ? formatINR(recommendedSip) : '₹0'}
            </span>
            <span className="font-label-md text-xs text-on-surface-variant block font-medium">
              {recommendedSip > 0 ? '/ month for 6 months' : 'Fortress completely funded'}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-tertiary">
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              <span className="font-label-sm text-xs font-semibold">
                {recommendedSip > 0
                  ? `Closes ${formatINR(metrics.remainingDeficit)} gap`
                  : 'Zero safety deficit'}
              </span>
            </div>
          </div>

          <div className="w-full flex items-center gap-2 border-t border-outline-variant/20 pt-2">
            <span className="w-2 h-2 rounded-full bg-tertiary" />
            <span className="font-label-sm text-xs text-on-surface-variant font-medium">
              Target completion: 6 months
            </span>
          </div>
        </div>

        {/* Card 4: Quick Deposit */}
        <div
          className="relative min-h-[195px] rounded-2xl backdrop-blur-md p-6 shadow-md border border-white/60 flex flex-col justify-between"
          style={{ background: 'rgba(255, 250, 240, 0.8)' }}
        >
          <div className="flex items-center justify-between">
            <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider font-semibold">
              Deposit to Buffer
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary-fixed/80 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-[18px]">savings</span>
            </div>
          </div>

          <div className="my-1">
            <span className="text-xs text-on-surface-variant mb-1 block">Quick Add Liquid Capital:</span>
            <div className="grid grid-cols-2 gap-2">
              {[5000, 10000, 25000, 50000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => handleQuickDeposit(amt)}
                  className="py-1.5 px-2 rounded-lg bg-surface-container hover:bg-primary hover:text-on-primary text-xs font-bold transition-all cursor-pointer"
                >
                  +{formatINR(amt)}
                </button>
              ))}
            </div>
          </div>

          <div className="text-[11px] text-primary font-semibold">
            Instantly updates your fortress runway
          </div>
        </div>
      </div>

      {/* Main Split Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Trishul Architecture (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div
            className="rounded-3xl p-8 shadow-xl flex flex-col gap-6 border border-white/60"
            style={{
              background: 'rgba(255, 250, 240, 0.72)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="font-label-sm text-label-sm text-tertiary tracking-widest uppercase font-semibold">
                  Trishul Liquidity Architecture
                </span>
                <h3 className="font-headline-md text-headline-md text-on-surface mt-1 font-bold">
                  Liquid Allocation Breakdown
                </h3>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-high/60 px-3 py-1.5 rounded-full border border-outline-variant/20">
                <span className="material-symbols-outlined text-primary text-[18px]">verified</span>
                <span className="font-label-sm text-xs text-on-surface font-semibold">
                  3-Tier Staggered Safety
                </span>
              </div>
            </div>

            {/* Segmented bar based on real amounts */}
            <div className="h-4 w-full bg-surface-container-highest rounded-full overflow-hidden flex shadow-inner">
              <div
                className="bg-primary h-full transition-all duration-500"
                style={{ width: `${emergencyFund.tier1Split || 37}%` }}
                title={`High-yield Savings: ${emergencyFund.tier1Split}%`}
              />
              <div
                className="bg-secondary h-full transition-all duration-500"
                style={{ width: `${emergencyFund.tier2Split || 44.4}%` }}
                title={`Overnight/Liquid Funds: ${emergencyFund.tier2Split}%`}
              />
              <div
                className="bg-tertiary h-full transition-all duration-500"
                style={{ width: `${emergencyFund.tier3Split || 18.6}%` }}
                title={`Sweeping Fixed Deposits: ${emergencyFund.tier3Split}%`}
              />
            </div>

            {/* 3 Tier Cards */}
            <div className="grid grid-cols-1 gap-4">
              {/* Tier 1 */}
              <div className="p-5 rounded-2xl bg-surface-container-lowest/60 backdrop-blur-md shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-outline-variant/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-fixed/60 flex items-center justify-center text-primary shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[24px]">payments</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        High-Yield Savings Account
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-primary-fixed/40 text-primary font-label-sm text-xs font-semibold">
                        Immediate
                      </span>
                    </div>
                    <span className="font-body-sm text-xs text-on-surface-variant mt-1">
                      Instant UPI & ATM liquidation buffer for day-zero urgencies.
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 border-outline-variant/20 pt-2 sm:pt-0 shrink-0">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {formatINR(metrics.tier1Amount)}
                  </span>
                  <span className="font-label-sm text-xs text-primary font-semibold">
                    {emergencyFund.tier1Split}% Corpus
                  </span>
                </div>
              </div>

              {/* Tier 2 */}
              <div className="p-5 rounded-2xl bg-surface-container-lowest/60 backdrop-blur-md shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-outline-variant/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-secondary-fixed/60 flex items-center justify-center text-secondary shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[24px]">water_drop</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Overnight & Liquid Mutual Funds
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-secondary font-label-sm text-xs font-semibold">
                        T+1 Liquidity
                      </span>
                    </div>
                    <span className="font-body-sm text-xs text-on-surface-variant mt-1">
                      Sovereign paper backing yielding ~6.8% CAGR with minimal NAV fluctuations.
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 border-outline-variant/20 pt-2 sm:pt-0 shrink-0">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {formatINR(metrics.tier2Amount)}
                  </span>
                  <span className="font-label-sm text-xs text-secondary font-semibold">
                    {emergencyFund.tier2Split}% Corpus
                  </span>
                </div>
              </div>

              {/* Tier 3 */}
              <div className="p-5 rounded-2xl bg-surface-container-lowest/60 backdrop-blur-md shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-outline-variant/20">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-tertiary-fixed/60 flex items-center justify-center text-tertiary shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[24px]">lock</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                        Sweeping Fixed Deposits
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed/50 text-tertiary font-label-sm text-xs font-semibold">
                        Instant Breakable
                      </span>
                    </div>
                    <span className="font-body-sm text-xs text-on-surface-variant mt-1">
                      Auto-sweep linked to primary salary account yielding ~7.1% fixed return.
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 border-outline-variant/20 pt-2 sm:pt-0 shrink-0">
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                    {formatINR(metrics.tier3Amount)}
                  </span>
                  <span className="font-label-sm text-xs text-tertiary font-semibold">
                    {emergencyFund.tier3Split}% Corpus
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Modeler (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div
            className="rounded-3xl p-8 shadow-xl flex flex-col gap-5 border border-white/60"
            style={{
              background: 'rgba(255, 250, 240, 0.72)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div>
              <span className="font-label-sm text-label-sm text-tertiary tracking-widest uppercase font-semibold">
                Crucible Simulator
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mt-1 font-bold">
                Runway Calibration
              </h3>
            </div>

            {/* Target Months Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span>Target Safety Runway</span>
                <span className="text-primary font-bold">{targetMonths} Months</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[3, 6, 9, 12].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleTargetMonthsChange(m)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      targetMonths === m
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                    }`}
                  >
                    {m} Mos
                  </button>
                ))}
              </div>
            </div>

            {/* Monthly Burn Calibration */}
            <div className="space-y-3 pt-2 border-t border-outline-variant/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-on-surface">Monthly Essential Outlay:</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleCustomBurnToggle(false)}
                    className={`text-xs px-2 py-0.5 rounded-lg cursor-pointer ${
                      !useCustomBurn
                        ? 'bg-primary-fixed text-primary font-bold'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    Auto Needs ({formatINR(actualNeedsExpense)})
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCustomBurnToggle(true)}
                    className={`text-xs px-2 py-0.5 rounded-lg cursor-pointer ${
                      useCustomBurn
                        ? 'bg-secondary-fixed text-secondary font-bold'
                        : 'text-on-surface-variant'
                    }`}
                  >
                    Custom
                  </button>
                </div>
              </div>

              {useCustomBurn && (
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-bold text-on-surface-variant">₹</span>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    value={customBurnInput}
                    onChange={(e) => {
                      setCustomBurnInput(e.target.value);
                      onUpdateEmergencyFund({
                        ...emergencyFund,
                        customMonthlyExpense: parseFloat(e.target.value) || 0,
                      });
                    }}
                    className="w-full pl-7 pr-3 py-1.5 text-xs rounded-xl bg-surface-container-lowest font-bold border border-outline-variant/40"
                  />
                </div>
              )}
            </div>

            {/* Dynamic Calculation Box */}
            <div className="p-5 rounded-2xl bg-surface-container-lowest/80 backdrop-blur-md shadow-md flex flex-col gap-3 border border-outline-variant/30">
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 text-xs">
                <span className="text-on-surface-variant font-medium">Required Aapda Corpus</span>
                <span className="font-headline-sm text-sm text-on-surface font-bold">
                  {formatINR(metrics.targetAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 text-xs">
                <span className="text-on-surface-variant font-medium">Current Buffer</span>
                <span className="font-headline-sm text-sm text-on-surface font-semibold">
                  {formatINR(metrics.currentAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20 text-xs">
                <span className="text-on-surface-variant font-medium">Corpus Difference</span>
                <span
                  className={`font-headline-sm text-sm font-bold ${
                    metrics.remainingDeficit > 0 ? 'text-secondary' : 'text-primary'
                  }`}
                >
                  {metrics.remainingDeficit > 0
                    ? `${formatINR(metrics.remainingDeficit)} Deficit`
                    : 'Fully Funded'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface-variant font-medium">Recommended 6-Mo SIP</span>
                <span className="font-headline-sm text-sm text-primary font-bold">
                  {recommendedSip > 0 ? `${formatINR(recommendedSip)} / mo` : 'Buffer Complete'}
                </span>
              </div>
            </div>

            <button
              onClick={handleLockStrategy}
              className={`w-full h-12 rounded-xl font-label-lg text-label-lg font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                isLocked
                  ? 'bg-tertiary text-on-tertiary'
                  : 'bg-primary hover:bg-primary-container text-on-primary'
              }`}
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isLocked ? 'done' : 'verified'}
              </span>
              <span>
                {isLocked
                  ? 'Buffer Strategy Locked into Auto-SIP!'
                  : 'Lock Buffer Strategy into Auto-SIP'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
