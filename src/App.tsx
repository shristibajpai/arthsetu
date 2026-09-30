import React, { useState, useMemo } from 'react';
import {
  NavScreen,
  ExpenseRecord,
  GoalItem,
  UserProfile,
  EmergencyFundData,
  AllocationSettings,
  NotificationItem,
} from './types';
import {
  loadProfile,
  saveProfile,
  loadExpenses,
  saveExpenses,
  loadGoals,
  saveGoals,
  loadEmergencyFund,
  saveEmergencyFund,
  loadAllocations,
  saveAllocations,
  loadBudgetLimit,
  saveBudgetLimit,
  loadNotifications,
  saveNotifications,
  loadReadArticles,
  saveReadArticles,
  resetAllData,
  DEFAULT_PROFILE,
  DEFAULT_EMERGENCY_FUND,
  DEFAULT_ALLOCATIONS,
} from './utils/storage';
import { INITIAL_EXPENSES, INITIAL_GOALS, INITIAL_NOTIFICATIONS } from './data/mockData';
import {
  calculateExpenseMetrics,
  calculateEmergencyMetrics,
  calculateFinancialHealth,
} from './utils/calculations';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { ExpensesView } from './components/ExpensesView';
import { EmergencyFundView } from './components/EmergencyFundView';
import { GoalsWhatIfView } from './components/GoalsWhatIfView';
import { ProfileView } from './components/ProfileView';
import { LearnView } from './components/LearnView';
import {
  NewGoalModal,
  AdjustAllocationModal,
  BudgetLimitModal,
  NotificationsModal,
} from './components/Modals';
import { AIAssistantModal } from './components/AIAssistantModal';

export const GLOBAL_BACKDROP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDl_Fb_hin10sv2C0rl58jAy17tJDJOkae64ixpSSTYzJLWegaw2_vgZ8FbWZ-wf7Ik9q4TzeFNevAxijaVdOwy0txxSeecw82RDvihWXIZVRKF2rEC8gblO_QOMkTsfzokAY0RC-KlsjMU5DDj_Vgl_bVV2D53FRt8l6Q0yBojDkGaYTnLxqikiHo-Ut5NX-u2wh3573y5s0Hb1-Yb-lp7EhwlazaPtMzGLL0R029jLOgqxYIxEBkqjg';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<NavScreen>('dashboard');

  // Persistent Core State
  const [userProfile, setUserProfile] = useState<UserProfile>(loadProfile);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(loadExpenses);
  const [goals, setGoals] = useState<GoalItem[]>(loadGoals);
  const [emergencyFund, setEmergencyFund] = useState<EmergencyFundData>(loadEmergencyFund);
  const [allocations, setAllocations] = useState<AllocationSettings>(loadAllocations);
  const [budgetLimit, setBudgetLimit] = useState<number>(loadBudgetLimit);
  const [notifications, setNotifications] = useState<NotificationItem[]>(loadNotifications);
  const [readArticles, setReadArticles] = useState<string[]>(loadReadArticles);

  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isNewGoalModalOpen, setIsNewGoalModalOpen] = useState(false);
  const [isAdjustAllocModalOpen, setIsAdjustAllocModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);

  // -----------------------------------------------------------
  // Centralized Application Calculations
  // -----------------------------------------------------------
  const expenseMetrics = useMemo(
    () => calculateExpenseMetrics(expenses, userProfile.monthlyIncome),
    [expenses, userProfile.monthlyIncome]
  );

  const emergencyMetrics = useMemo(
    () => calculateEmergencyMetrics(emergencyFund, expenseMetrics.totalNeeds),
    [emergencyFund, expenseMetrics.totalNeeds]
  );

  const healthMetrics = useMemo(
    () =>
      calculateFinancialHealth(
        userProfile.monthlyIncome,
        expenseMetrics.totalExpenses,
        expenseMetrics.totalNeeds,
        emergencyMetrics.monthsCovered,
        goals
      ),
    [userProfile.monthlyIncome, expenseMetrics, emergencyMetrics.monthsCovered, goals]
  );

  // -----------------------------------------------------------
  // Handlers with Immediate Persistence
  // -----------------------------------------------------------
  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    saveProfile(newProfile);
  };

  const handleAddExpense = (newRecord: Omit<ExpenseRecord, 'id'>) => {
    const item: ExpenseRecord = {
      ...newRecord,
      id: `exp-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const updated = [item, ...expenses];
    setExpenses(updated);
    saveExpenses(updated);
  };

  const handleUpdateExpense = (updatedRecord: ExpenseRecord) => {
    const updated = expenses.map((e) => (e.id === updatedRecord.id ? updatedRecord : e));
    setExpenses(updated);
    saveExpenses(updated);
  };

  const handleDeleteExpense = (expenseId: string) => {
    const updated = expenses.filter((e) => e.id !== expenseId);
    setExpenses(updated);
    saveExpenses(updated);
  };

  const handleAddGoal = (newGoal: GoalItem) => {
    const updated = [newGoal, ...goals];
    setGoals(updated);
    saveGoals(updated);
  };

  const handleUpdateGoal = (updatedGoal: GoalItem) => {
    const updated = goals.map((g) => (g.id === updatedGoal.id ? updatedGoal : g));
    setGoals(updated);
    saveGoals(updated);
  };

  const handleDeleteGoal = (goalId: string) => {
    const updated = goals.filter((g) => g.id !== goalId);
    setGoals(updated);
    saveGoals(updated);
  };

  const handleUpdateGoalAllocation = (goalId: string, newAllocation: number) => {
    const updated = goals.map((g) =>
      g.id === goalId ? { ...g, monthlyAllocation: newAllocation } : g
    );
    setGoals(updated);
    saveGoals(updated);
  };

  const handleUpdateEmergencyFund = (newData: EmergencyFundData) => {
    setEmergencyFund(newData);
    saveEmergencyFund(newData);
  };

  const handleUpdateAllocations = (newAlloc: AllocationSettings) => {
    setAllocations(newAlloc);
    saveAllocations(newAlloc);
  };

  const handleUpdateBudgetLimit = (newLimit: number) => {
    setBudgetLimit(newLimit);
    saveBudgetLimit(newLimit);
  };

  const handleMarkAllNotificationsRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const handleToggleReadArticle = (articleId: string) => {
    let updated: string[];
    if (readArticles.includes(articleId)) {
      updated = readArticles.filter((id) => id !== articleId);
    } else {
      updated = [...readArticles, articleId];
    }
    setReadArticles(updated);
    saveReadArticles(updated);
  };

  const handleResetAllData = () => {
    resetAllData();
    setUserProfile(DEFAULT_PROFILE);
    setExpenses(INITIAL_EXPENSES);
    setGoals(INITIAL_GOALS);
    setEmergencyFund(DEFAULT_EMERGENCY_FUND);
    setAllocations(DEFAULT_ALLOCATIONS);
    setBudgetLimit(112000);
    setNotifications(INITIAL_NOTIFICATIONS);
    setReadArticles(['art-1']);
  };

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased relative selection:bg-secondary-fixed overflow-x-hidden">
      {/* Background with serene watercolor painting & translucent gradient backdrop */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url('${GLOBAL_BACKDROP_IMAGE}')`,
          backgroundAttachment: 'fixed',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#f4e8d2]/90 via-[#fffaf0]/80 to-[#f9edd6]/85 backdrop-blur-[10px]" />
      </div>

      {/* Left Navigation Sidebar */}
      <Sidebar
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
        onOpenSettings={() => setCurrentScreen('profile')}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        userName={userProfile.name}
        userTitle={userProfile.occupation}
        onOpenAI={() => setIsAIAssistantOpen(true)}
      />

      {/* App Container */}
      <div className="pl-0 relative z-10 flex flex-col min-h-screen w-full min-w-0 overflow-x-hidden">
        {/* Top Header */}
        <Header
          notifications={notifications}
          onOpenNotifications={() => setIsNotificationsModalOpen(true)}
          onNavigateProfile={() => setCurrentScreen('profile')}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          onToggleMobileMenu={() => setIsMobileSidebarOpen((prev) => !prev)}
          userName={userProfile.name}
          healthScore={healthMetrics.score}
          onOpenAI={() => setIsAIAssistantOpen(true)}
        />

        {/* Main Content Area */}
        <main className="w-full pt-20 flex-1 px-3 sm:px-6 lg:px-8 py-6 relative z-10 min-w-0">
          <div className="max-w-[1440px] mx-auto w-full">
            {searchQuery && (
              <div className="mb-6 p-4 rounded-2xl bg-surface-container-high/60 backdrop-blur-md flex items-center justify-between border border-outline-variant/30">
                <span className="text-body-sm font-medium">
                  Filtering across records for: <strong>"{searchQuery}"</strong>
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-primary font-semibold text-xs hover:underline cursor-pointer"
                >
                  Clear Search Filter
                </button>
              </div>
            )}

            {currentScreen === 'dashboard' && (
              <DashboardView
                userProfile={userProfile}
                expenses={expenses}
                goals={goals}
                emergencyFund={emergencyFund}
                allocationSettings={allocations}
                healthMetrics={healthMetrics}
                onNavigate={setCurrentScreen}
                onOpenAdjustAllocation={() => setIsAdjustAllocModalOpen(true)}
              />
            )}

            {currentScreen === 'expenses' && (
              <ExpensesView
                expenses={
                  searchQuery
                    ? expenses.filter(
                        (e) =>
                          e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.channel.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()))
                      )
                    : expenses
                }
                monthlyIncome={userProfile.monthlyIncome}
                budgetLimit={budgetLimit}
                onAddExpense={handleAddExpense}
                onUpdateExpense={handleUpdateExpense}
                onDeleteExpense={handleDeleteExpense}
                onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
              />
            )}

            {currentScreen === 'emergency-fund' && (
              <EmergencyFundView
                emergencyFund={emergencyFund}
                onUpdateEmergencyFund={handleUpdateEmergencyFund}
                actualNeedsExpense={expenseMetrics.totalNeeds}
              />
            )}

            {currentScreen === 'goals-and-what-if' && (
              <GoalsWhatIfView
                goals={
                  searchQuery
                    ? goals.filter(
                        (g) =>
                          g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.categoryName.toLowerCase().includes(searchQuery.toLowerCase())
                      )
                    : goals
                }
                userProfile={userProfile}
                totalMonthlyExpenses={expenseMetrics.totalExpenses}
                totalNeeds={expenseMetrics.totalNeeds}
                onOpenNewGoalModal={() => setIsNewGoalModalOpen(true)}
                onUpdateGoal={handleUpdateGoal}
                onDeleteGoal={handleDeleteGoal}
                onUpdateGoalAllocation={handleUpdateGoalAllocation}
              />
            )}

            {currentScreen === 'profile' && (
              <ProfileView
                profile={userProfile}
                onUpdateProfile={handleUpdateProfile}
                healthMetrics={healthMetrics}
                onResetAllData={handleResetAllData}
              />
            )}

            {currentScreen === 'learn' && (
              <LearnView
                readArticles={readArticles}
                onToggleReadArticle={handleToggleReadArticle}
              />
            )}
          </div>
        </main>
      </div>

      {/* Interactive Modals */}
      <NewGoalModal
        isOpen={isNewGoalModalOpen}
        onClose={() => setIsNewGoalModalOpen(false)}
        onAddGoal={handleAddGoal}
      />

      <AdjustAllocationModal
        isOpen={isAdjustAllocModalOpen}
        onClose={() => setIsAdjustAllocModalOpen(false)}
        monthlyIncome={userProfile.monthlyIncome}
        currentAllocations={allocations}
        onSave={handleUpdateAllocations}
      />

      <BudgetLimitModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        currentLimit={budgetLimit}
        onSave={handleUpdateBudgetLimit}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAllRead={handleMarkAllNotificationsRead}
      />

      {/* Floating AI Chatbot Launcher FAB */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsAIAssistantOpen(true)}
          aria-label="Open ArthSetu AI Chatbot"
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-2xl hover:shadow-[0_12px_30px_rgba(111,128,96,0.35)] border border-white/50 backdrop-blur-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[22px] transition-transform group-hover:rotate-12">
            auto_awesome
          </span>
          <span className="font-label-lg text-sm font-semibold tracking-wide hidden sm:inline">
            Ask ArthSetu AI
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-tertiary-fixed animate-pulse shrink-0" />
        </button>
      </div>

      {/* Full-Featured AI Financial Companion Modal */}
      <AIAssistantModal
        isOpen={isAIAssistantOpen}
        onClose={() => setIsAIAssistantOpen(false)}
        userProfile={userProfile}
        expenses={expenses}
        goals={goals}
        emergencyFund={emergencyFund}
      />
    </div>
  );
}
