import React, { useState, useEffect, useRef } from 'react';
import {
  aiService,
  ChatMessage,
  ConversationThread,
  AISettings,
  AIProvider,
  PROVIDER_METADATA,
} from '../services/aiService';
import { UserProfile, ExpenseRecord, GoalItem, EmergencyFundData } from '../types';
import { formatINR } from '../utils/formatters';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  expenses: ExpenseRecord[];
  goals: GoalItem[];
  emergencyFund: EmergencyFundData;
  initialPrompt?: string;
  initialProblemMode?: boolean;
}

const QUICK_PROMPTS = [
  'I have ₹20,000 left this month. How should I divide it?',
  'Help me create a realistic 50/30/20 budget for Indian expenses',
  'How much emergency fund do I need right now based on my needs?',
  'Explain Fixed Deposit (FD) vs Index Mutual Fund SIP',
  'Should I pay off credit card debt or invest in SIP first?',
  'I keep overspending on dining & food. What can I do?',
  'How does compounding work with ₹5,000 monthly SIP?',
  'Should I opt for New Tax Regime or Old Tax Regime?',
];

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  expenses,
  goals,
  emergencyFund,
  initialPrompt,
  initialProblemMode = false,
}) => {
  const [threads, setThreads] = useState<ConversationThread[]>(() => aiService.loadConversations());
  const [activeThreadId, setActiveThreadId] = useState<string>(() => threads[0]?.id || 'thread-default');
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiSettings, setAiSettings] = useState<AISettings>(() => aiService.loadSettings());
  const [problemMode, setProblemMode] = useState(initialProblemMode);
  const [showHistory, setShowHistory] = useState(false);
  const [showKeySettings, setShowKeySettings] = useState(false);

  // Key settings local edit state
  const [editKeys, setEditKeys] = useState<{ [key in AIProvider]?: string }>({});
  const [showKeyVisible, setShowKeyVisible] = useState<{ [key in AIProvider]?: boolean }>({});
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];
  const activeMeta = PROVIDER_METADATA[aiSettings.provider] || PROVIDER_METADATA.gemini;

  useEffect(() => {
    if (initialPrompt && isOpen) {
      setInputMessage(initialPrompt);
      if (initialProblemMode) setProblemMode(true);
    }
  }, [initialPrompt, initialProblemMode, isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeThread?.messages, isLoading]);

  useEffect(() => {
    setEditKeys(aiSettings.apiKeys || {});
  }, [aiSettings]);

  if (!isOpen) return null;

  // Build sanitized financial context only if user authorized
  const buildContext = () => {
    if (!aiSettings.attachFinancialContext) return undefined;
    const totalExpenses = expenses.reduce((a, b) => a + b.amount, 0);
    const totalNeeds = expenses.filter((e) => e.nature === 'Need').reduce((a, b) => a + b.amount, 0);
    const totalWants = expenses.filter((e) => e.nature === 'Want').reduce((a, b) => a + b.amount, 0);
    const savings = Math.max(0, userProfile.monthlyIncome - totalExpenses);
    const savingsRate = userProfile.monthlyIncome > 0 ? (savings / userProfile.monthlyIncome) * 100 : 0;
    const emergencyMonths = totalNeeds > 0 ? emergencyFund.currentAmount / totalNeeds : 0;
    const goalsSummary = goals
      .map((g) => `${g.title} (Target: ₹${g.targetAmount}, Saved: ₹${g.currentAmount})`)
      .join('; ');

    return {
      name: userProfile.name,
      monthlyIncome: userProfile.monthlyIncome,
      totalExpenses,
      totalNeeds,
      totalWants,
      savings,
      savingsRate: savingsRate.toFixed(1),
      emergencyFund: emergencyFund.currentAmount,
      emergencyMonths: emergencyMonths.toFixed(1),
      goalsSummary,
      healthScore: 88,
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      role: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const currentMessages = activeThread?.messages || [];
    const updatedMessages = [...currentMessages, userMsg];

    const updatedThread: ConversationThread = {
      ...activeThread,
      messages: updatedMessages,
      title:
        activeThread.title === 'Initial Money Guidance' || activeThread.title === 'New Consultation'
          ? text.slice(0, 32) + (text.length > 32 ? '...' : '')
          : activeThread.title,
    };

    const updatedThreads = threads.map((t) => (t.id === activeThreadId ? updatedThread : t));
    setThreads(updatedThreads);
    aiService.saveConversations(updatedThreads);

    setInputMessage('');
    setIsLoading(true);

    try {
      const history = currentMessages.map((m) => ({
        role: m.role,
        text: m.text,
      }));

      const activeApiKey = aiSettings.apiKeys?.[aiSettings.provider];

      const { reply, providerUsed, modelUsed } = await aiService.sendMessage(
        text,
        history,
        buildContext(),
        aiSettings.mode,
        problemMode,
        aiSettings.provider,
        activeApiKey,
        aiSettings.model
      );

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'model',
        text: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isProblemBreakdown: problemMode,
        provider: providerUsed,
      };

      const finalMessages = [...updatedMessages, aiMsg];
      const finalThread: ConversationThread = {
        ...updatedThread,
        messages: finalMessages,
      };
      const finalThreads = threads.map((t) => (t.id === activeThreadId ? finalThread : t));
      setThreads(finalThreads);
      aiService.saveConversations(finalThreads);
    } catch (err) {
      console.error('Failed to get AI response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    const newThread: ConversationThread = {
      id: `thread-${Date.now()}`,
      title: 'New Consultation',
      createdAt: new Date().toISOString(),
      messages: [
        {
          id: `msg-${Date.now()}`,
          role: 'model',
          text: `Namaste! I am your ArthSetu AI companion powered by ${activeMeta.name}. Ask me anything about budgeting, emergency funds, SIP compounding, or debt strategy.`,
          timestamp: 'Just now',
          provider: aiSettings.provider,
        },
      ],
    };
    const updated = [newThread, ...threads];
    setThreads(updated);
    setActiveThreadId(newThread.id);
    aiService.saveConversations(updated);
    setShowHistory(false);
  };

  const handleClearCurrentChat = () => {
    const resetThread: ConversationThread = {
      ...activeThread,
      messages: [
        {
          id: `msg-welcome-${Date.now()}`,
          role: 'model',
          text: 'Conversation cleared. How may I assist your financial journey today?',
          timestamp: 'Just now',
          provider: aiSettings.provider,
        },
      ],
    };
    const cleared = threads.map((t) => (t.id === activeThreadId ? resetThread : t));
    setThreads(cleared);
    aiService.saveConversations(cleared);
  };

  const handleDeleteThread = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (threads.length <= 1) {
      handleClearCurrentChat();
      return;
    }
    const filtered = threads.filter((t) => t.id !== id);
    setThreads(filtered);
    setActiveThreadId(filtered[0].id);
    aiService.saveConversations(filtered);
  };

  const toggleMode = () => {
    const newMode: 'advanced' | 'beginner' = aiSettings.mode === 'beginner' ? 'advanced' : 'beginner';
    const updated: AISettings = { ...aiSettings, mode: newMode };
    setAiSettings(updated);
    aiService.saveSettings(updated);
  };

  const toggleContext = () => {
    const updated: AISettings = {
      ...aiSettings,
      attachFinancialContext: !aiSettings.attachFinancialContext,
    };
    setAiSettings(updated);
    aiService.saveSettings(updated);
  };

  const handleSaveProviderSettings = () => {
    const updated: AISettings = {
      ...aiSettings,
      apiKeys: editKeys,
    };
    setAiSettings(updated);
    aiService.saveSettings(updated);
    setSettingsSavedToast(true);
    setTimeout(() => {
      setSettingsSavedToast(false);
      setShowKeySettings(false);
    }, 1500);
  };

  const handleSelectProvider = (prov: AIProvider) => {
    const defaultMod = PROVIDER_METADATA[prov].defaultModel;
    const updated: AISettings = {
      ...aiSettings,
      provider: prov,
      model: defaultMod,
    };
    setAiSettings(updated);
    aiService.saveSettings(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/60 backdrop-blur-sm p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="rounded-3xl max-w-4xl w-full h-[92vh] max-h-[850px] shadow-2xl border border-white/60 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 relative"
        style={{
          background: 'rgba(255, 250, 240, 0.98)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Top Header Bar */}
        <div className="px-3 sm:px-5 py-3 sm:py-4 border-b border-outline-variant/30 flex items-center justify-between gap-2 sm:gap-4 bg-surface-container-lowest/80 shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-primary-container text-on-primary flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-[22px]">{activeMeta.icon}</span>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-headline-sm text-base sm:text-lg text-on-surface font-bold truncate">
                  ArthSetu AI
                </h3>
                <button
                  onClick={() => setShowKeySettings(true)}
                  className="px-2.5 py-0.5 rounded-full bg-primary-fixed hover:bg-primary-fixed-dim text-primary font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                  title="Configure AI Engine & API Keys (Gemini, Grok, GPT)"
                >
                  <span>{activeMeta.name}</span>
                  <span className="material-symbols-outlined text-[12px]">tune</span>
                </button>
              </div>
              <p className="text-[11px] text-on-surface-variant truncate">
                {aiSettings.model} · {aiSettings.mode === 'beginner' ? 'Beginner Mode' : 'Advanced Mode'}
              </p>
            </div>
          </div>

          {/* Controls: Keys/Settings, Beginner Toggle, History, New Chat, Close */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Keys & Provider Setup Button */}
            <button
              onClick={() => setShowKeySettings(!showKeySettings)}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-semibold ${
                showKeySettings
                  ? 'bg-primary text-on-primary border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container border-outline-variant/30 hover:text-on-surface'
              }`}
              title="Configure API Keys for Gemini, Grok, and GPT"
            >
              <span className="material-symbols-outlined text-[18px]">key</span>
              <span className="hidden md:inline">API Keys</span>
            </button>

            {/* Beginner / Advanced Toggle */}
            <button
              onClick={toggleMode}
              className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer hidden sm:flex items-center gap-1 ${
                aiSettings.mode === 'beginner'
                  ? 'bg-primary-fixed/50 text-primary border-primary/30'
                  : 'bg-secondary-fixed/50 text-secondary border-secondary/30'
              }`}
              title="Toggle between simple analogies and advanced technical ratios"
            >
              <span className="material-symbols-outlined text-[16px]">
                {aiSettings.mode === 'beginner' ? 'child_care' : 'insights'}
              </span>
              <span className="hidden lg:inline">
                {aiSettings.mode === 'beginner' ? 'Beginner' : 'Advanced'}
              </span>
            </button>

            {/* History Toggle */}
            <button
              onClick={() => {
                setShowHistory(!showHistory);
                setShowKeySettings(false);
              }}
              className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer border border-outline-variant/30"
              title="View Chat History"
            >
              <span className="material-symbols-outlined text-[19px]">history</span>
            </button>

            {/* New Chat */}
            <button
              onClick={handleNewChat}
              className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors cursor-pointer border border-outline-variant/30"
              title="Start New Chat"
            >
              <span className="material-symbols-outlined text-[19px]">add_comment</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface text-lg font-bold cursor-pointer transition-colors leading-none"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* History Sidebar */}
          {showHistory && (
            <div className="w-64 sm:w-72 bg-surface-container-low/98 border-r border-outline-variant/30 flex flex-col p-4 z-20 absolute inset-y-0 left-0 sm:relative shadow-xl sm:shadow-none animate-in slide-in-from-left duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
                <span className="text-xs font-bold text-on-surface uppercase tracking-wider">
                  Conversations
                </span>
                <button
                  onClick={() => setShowHistory(false)}
                  className="sm:hidden text-xs text-on-surface-variant font-bold"
                >
                  ✕ Close
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2">
                {threads.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setActiveThreadId(t.id);
                      setShowHistory(false);
                    }}
                    className={`p-3 rounded-2xl flex items-center justify-between text-xs cursor-pointer transition-all ${
                      t.id === activeThread.id
                        ? 'bg-primary text-on-primary font-bold shadow-xs'
                        : 'bg-surface-container-lowest/80 hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <span className="truncate pr-2">{t.title}</span>
                    <button
                      onClick={(e) => handleDeleteThread(t.id, e)}
                      className="p-1 rounded hover:bg-black/10 transition-colors"
                      title="Delete thread"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleNewChat}
                className="mt-3 w-full py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-xs cursor-pointer hover:bg-primary-container transition-colors"
              >
                + New Consultation
              </button>
            </div>
          )}

          {/* AI Provider & API Keys Configuration Overlay */}
          {showKeySettings && (
            <div className="absolute inset-0 z-30 bg-surface-container-lowest/95 backdrop-blur-md p-4 sm:p-6 overflow-y-auto flex flex-col justify-between animate-in fade-in duration-200">
              <div className="max-w-2xl mx-auto w-full space-y-6">
                <div className="flex items-center justify-between border-b border-outline-variant/30 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[24px]">key</span>
                    <div>
                      <h4 className="font-headline-sm text-lg text-on-surface font-bold">
                        AI Provider & API Key Setup
                      </h4>
                      <p className="text-xs text-on-surface-variant">
                        Choose your engine and optionally supply your personal developer keys for Gemini, Grok, or OpenAI GPT.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowKeySettings(false)}
                    className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface text-sm font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Provider Selector Tabs */}
                <div>
                  <label className="block text-xs uppercase font-bold text-on-surface-variant tracking-wider mb-2">
                    Select Active AI Engine
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {(['gemini', 'openai', 'grok'] as AIProvider[]).map((prov) => {
                      const meta = PROVIDER_METADATA[prov];
                      const isSelected = aiSettings.provider === prov;
                      return (
                        <div
                          key={prov}
                          onClick={() => handleSelectProvider(prov)}
                          className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-primary bg-primary-fixed/30 shadow-md'
                              : 'border-outline-variant/30 bg-surface-container-low/50 hover:bg-surface-container'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="material-symbols-outlined text-[22px] text-primary">
                              {meta.icon}
                            </span>
                            {isSelected && (
                              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                            )}
                          </div>
                          <div>
                            <span className="font-bold text-sm text-on-surface block">
                              {meta.name}
                            </span>
                            <span className="text-[11px] text-on-surface-variant line-clamp-1">
                              {meta.tagline}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Model Selector for Active Provider */}
                <div>
                  <label className="block text-xs uppercase font-bold text-on-surface-variant tracking-wider mb-1">
                    Select Model for {activeMeta.name}
                  </label>
                  <select
                    value={aiSettings.model}
                    onChange={(e) => {
                      const updated: AISettings = { ...aiSettings, model: e.target.value };
                      setAiSettings(updated);
                      aiService.saveSettings(updated);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-outline-variant/40 bg-surface-container-lowest font-body-sm text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                  >
                    {activeMeta.availableModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} — {m.description}
                      </option>
                    ))}
                  </select>
                </div>

                {/* API Key Inputs for All Three Providers */}
                <div className="space-y-4 pt-2 border-t border-outline-variant/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase font-bold text-on-surface-variant tracking-wider">
                      API Keys Storage (Saved securely in your browser session)
                    </span>
                    <span className="text-[11px] text-primary font-semibold">
                      Server default keys active
                    </span>
                  </div>

                  {(['gemini', 'openai', 'grok'] as AIProvider[]).map((prov) => {
                    const meta = PROVIDER_METADATA[prov];
                    const isVisible = showKeyVisible[prov] || false;
                    const currentValue = editKeys[prov] || '';

                    return (
                      <div
                        key={prov}
                        className={`p-3.5 rounded-2xl border transition-all ${
                          aiSettings.provider === prov
                            ? 'bg-surface-container-lowest border-primary/40 shadow-xs'
                            : 'bg-surface-container-lowest/60 border-outline-variant/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-primary">
                              {meta.icon}
                            </span>
                            {meta.name} API Key
                            {aiSettings.provider === prov && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-semibold">
                                Active Provider
                              </span>
                            )}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setShowKeyVisible((prev) => ({ ...prev, [prov]: !prev[prov] }))
                            }
                            className="text-[11px] text-on-surface-variant hover:text-on-surface cursor-pointer"
                          >
                            {isVisible ? 'Hide Key' : 'Reveal'}
                          </button>
                        </div>

                        <div className="relative flex items-center">
                          <input
                            type={isVisible ? 'text' : 'password'}
                            placeholder={meta.keyPlaceholder}
                            value={currentValue}
                            onChange={(e) =>
                              setEditKeys((prev) => ({ ...prev, [prov]: e.target.value }))
                            }
                            className="w-full px-3.5 py-2 rounded-xl border border-outline-variant/40 bg-surface-container-low font-mono text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40"
                          />
                          {currentValue && (
                            <button
                              type="button"
                              onClick={() =>
                                setEditKeys((prev) => ({ ...prev, [prov]: '' }))
                              }
                              className="absolute right-2.5 text-xs text-on-surface-variant hover:text-secondary cursor-pointer"
                              title="Clear key"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-on-surface-variant/80 mt-1 block">
                          Leave empty to use server default environment variable ({prov === 'gemini' ? 'GEMINI_API_KEY' : prov === 'openai' ? 'OPENAI_API_KEY' : 'GROK_API_KEY'}).
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Save Keys Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-outline-variant/30">
                  <span className="text-xs text-on-surface-variant">
                    All API calls remain proxied server-side via <code>/api/ai/chat</code>.
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowKeySettings(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-on-surface-variant hover:bg-surface-container"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveProviderSettings}
                      className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">save</span>
                      <span>{settingsSavedToast ? 'Saved!' : 'Save AI Settings'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages Pane */}
          <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
            {/* Context Pill & Controls Bar */}
            <div className="px-3 sm:px-4 py-2 bg-surface-container-lowest/60 border-b border-outline-variant/20 flex flex-wrap items-center justify-between text-xs gap-2 shrink-0">
              <label className="flex items-center gap-2 cursor-pointer text-on-surface-variant select-none min-w-0">
                <input
                  type="checkbox"
                  checked={aiSettings.attachFinancialContext}
                  onChange={toggleContext}
                  className="accent-primary rounded cursor-pointer shrink-0"
                />
                <span className="truncate">
                  Attach my ArthSetu numbers (Income: {formatINR(userProfile.monthlyIncome)})
                </span>
              </label>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
                <button
                  type="button"
                  onClick={() => setProblemMode(!problemMode)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                    problemMode
                      ? 'bg-secondary text-on-secondary shadow-xs'
                      : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
                  }`}
                  title="Activates structured Problem Solving format: Situation, Numbers, Options, Trade-offs"
                >
                  {problemMode ? '⚡ Problem Mode' : 'Problem Mode'}
                </button>

                <button
                  onClick={handleClearCurrentChat}
                  className="text-on-surface-variant hover:text-secondary text-[11px] font-semibold cursor-pointer shrink-0"
                >
                  Clear Chat
                </button>
              </div>
            </div>

            {/* Scrollable Messages Area */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4">
              {activeThread.messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[90%] sm:max-w-[82%] p-3.5 sm:p-4 rounded-3xl shadow-sm text-sm leading-relaxed whitespace-pre-line ${
                        isUser
                          ? 'bg-primary text-on-primary rounded-tr-none font-medium'
                          : 'bg-surface-container-lowest/95 text-on-surface border border-outline-variant/30 rounded-tl-none'
                      }`}
                    >
                      {!isUser && (
                        <div className="flex items-center justify-between pb-2 mb-2 border-b border-outline-variant/20 text-xs font-bold text-secondary flex-wrap gap-1">
                          <div className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[15px]">spa</span>
                            <span>ArthSetu Financial Advisor</span>
                            <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-primary-fixed/60 text-primary">
                              {m.provider ? PROVIDER_METADATA[m.provider]?.name : activeMeta.name}
                            </span>
                          </div>
                          <span className="text-[10px] text-on-surface-variant font-normal">
                            {m.timestamp}
                          </span>
                        </div>
                      )}
                      {m.text}
                    </div>
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="p-3.5 sm:p-4 rounded-3xl bg-surface-container-lowest/90 border border-outline-variant/30 rounded-tl-none flex items-center gap-3 text-xs text-on-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px] animate-spin">
                      progress_activity
                    </span>
                    <span>
                      Consulting {activeMeta.name} with your financial math & principles...
                    </span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Suggestions */}
            {activeThread.messages.length <= 2 && (
              <div className="px-3 sm:px-4 py-2 overflow-x-auto flex gap-2 shrink-0 border-t border-outline-variant/20 bg-surface-container-lowest/40">
                {QUICK_PROMPTS.slice(0, 4).map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp)}
                    className="px-3 py-1.5 rounded-full text-xs bg-surface-container-high/70 hover:bg-primary-fixed hover:text-primary transition-all text-on-surface-variant whitespace-nowrap cursor-pointer shrink-0 font-medium border border-outline-variant/20"
                  >
                    {qp}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-2.5 sm:p-3.5 bg-surface-container-lowest/95 border-t border-outline-variant/30 flex items-center gap-2 shrink-0"
            >
              <input
                type="text"
                placeholder={
                  problemMode
                    ? 'Describe your money dilemma (e.g. I have ₹15,000 left until salary day)...'
                    : `Ask ${activeMeta.name} about SIPs, budgeting, gold loans, or taxes...`
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm rounded-2xl bg-surface-container-low border border-outline-variant/30 text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs tracking-wider uppercase transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-[17px]">send</span>
                <span className="hidden sm:inline">Ask AI</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
