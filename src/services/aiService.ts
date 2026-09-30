export type AIProvider = 'gemini' | 'openai' | 'grok';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isProblemBreakdown?: boolean;
  provider?: AIProvider;
}

export interface ConversationThread {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface AISettings {
  mode: 'beginner' | 'advanced';
  attachFinancialContext: boolean;
  provider: AIProvider;
  model: string;
  // User custom API keys stored locally in browser if provided
  apiKeys: {
    gemini?: string;
    openai?: string;
    grok?: string;
  };
}

const STORAGE_KEYS = {
  CONVERSATIONS: 'arthsetu_ai_conversations_v1',
  ACTIVE_THREAD_ID: 'arthsetu_ai_active_thread_v1',
  AI_SETTINGS: 'arthsetu_ai_settings_v2',
};

export const PROVIDER_METADATA: Record<
  AIProvider,
  {
    name: string;
    tagline: string;
    icon: string;
    defaultModel: string;
    availableModels: { id: string; name: string; description: string }[];
    keyPlaceholder: string;
    helpUrl?: string;
  }
> = {
  gemini: {
    name: 'Google Gemini',
    tagline: 'Native Multi-modal Intelligence by Google',
    icon: 'auto_awesome',
    defaultModel: 'gemini-3.8-flash',
    availableModels: [
      {
        id: 'gemini-3.8-flash',
        name: 'Gemini 3.8 Flash (Recommended)',
        description: 'Fast, highly accurate financial calculations & advice',
      },
      {
        id: 'gemini-3.1-pro-preview',
        name: 'Gemini 3.1 Pro Preview',
        description: 'Deep mathematical modeling and complex scenario planning',
      },
    ],
    keyPlaceholder: 'AIzaSy... (Leave empty to use server default key)',
  },
  openai: {
    name: 'OpenAI GPT',
    tagline: 'Reasoning & Language Mastery by OpenAI',
    icon: 'psychology',
    defaultModel: 'gpt-4o',
    availableModels: [
      {
        id: 'gpt-4o',
        name: 'GPT-4o Omnimodel',
        description: 'Flagship versatile intelligence for personal finance',
      },
      {
        id: 'gpt-4o-mini',
        name: 'GPT-4o Mini',
        description: 'Fast, lightweight and cost-effective responses',
      },
    ],
    keyPlaceholder: 'sk-proj-... (Leave empty to use server OPENAI_API_KEY)',
  },
  grok: {
    name: 'xAI Grok',
    tagline: 'Real-time & Unfiltered Intelligence by xAI',
    icon: 'rocket_launch',
    defaultModel: 'grok-2',
    availableModels: [
      {
        id: 'grok-2',
        name: 'Grok-2',
        description: 'Latest high-performance frontier model from xAI',
      },
      {
        id: 'grok-beta',
        name: 'Grok Beta',
        description: 'Fast real-time financial market insights',
      },
    ],
    keyPlaceholder: 'xai-... (Leave empty to use server GROK_API_KEY)',
  },
};

export const aiService = {
  loadSettings(): AISettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.AI_SETTINGS);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          mode: parsed.mode || 'beginner',
          attachFinancialContext: parsed.attachFinancialContext ?? true,
          provider: parsed.provider || 'gemini',
          model: parsed.model || 'gemini-3.8-flash',
          apiKeys: parsed.apiKeys || {},
        };
      }
    } catch {}
    return {
      mode: 'beginner',
      attachFinancialContext: true,
      provider: 'gemini',
      model: 'gemini-3.8-flash',
      apiKeys: {},
    };
  },

  saveSettings(settings: AISettings) {
    try {
      localStorage.setItem(STORAGE_KEYS.AI_SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save AI settings:', e);
    }
  },

  loadConversations(): ConversationThread[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [
      {
        id: 'thread-default',
        title: 'Initial Money Guidance',
        createdAt: new Date().toISOString(),
        messages: [
          {
            id: 'msg-welcome',
            role: 'model',
            text: 'Namaste! I am ArthSetu AI, your personal financial companion. Powered by multiple AI engines (Google Gemini, OpenAI GPT, and xAI Grok). I can help calculate emergency fund targets, structure SIPs, optimize Indian tax regimes, or solve any financial dilemma you face.\n\nWhat is on your mind regarding your money today?',
            timestamp: 'Just now',
            provider: 'gemini',
          },
        ],
      },
    ];
  },

  saveConversations(threads: ConversationThread[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(threads));
    } catch (e) {
      console.error('Failed to save AI conversations:', e);
    }
  },

  async sendMessage(
    message: string,
    history: { role: string; text: string }[],
    context?: any,
    mode: 'beginner' | 'advanced' = 'beginner',
    problemMode: boolean = false,
    provider: AIProvider = 'gemini',
    apiKey?: string,
    model?: string
  ): Promise<{ reply: string; providerUsed: AIProvider; modelUsed: string }> {
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          history,
          context,
          mode,
          problemMode,
          provider,
          apiKey: apiKey?.trim() || undefined,
          model: model || PROVIDER_METADATA[provider].defaultModel,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI temporarily unavailable');
      return {
        reply: data.reply,
        providerUsed: data.provider || provider,
        modelUsed: data.model || model || PROVIDER_METADATA[provider].defaultModel,
      };
    } catch (err: any) {
      console.warn('AI API call encountered an issue, returning resilient guidance:', err);
      return {
        reply: `I am reflecting on your question with mindful financial principles. If you are experiencing a cashflow pinch or deciding between debt clearance and investing:

1. **Aavashyak (Needs First)**: Protect basic housing, food, and medicine obligations.
2. **Emergency Shield**: Maintain at least 1 month of urgent buffer before taking speculative risks.
3. **High-Cost Debt**: Eliminate any credit card balances (36%–44% interest) before making discretionary investments.

Please ask me to break down any specific rupee amount or scenario!`,
        providerUsed: provider,
        modelUsed: model || 'system-engine',
      };
    }
  },
};
