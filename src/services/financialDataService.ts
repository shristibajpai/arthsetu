export interface ConsentArtifact {
  id: string;
  userVpa: string;
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED' | 'PENDING';
  purpose: string;
  dataLifeDays: number;
  consentTimestamp: string;
  fetchFrequency: string;
  accountTypes: string[];
  fipName: string;
}

export interface FinancialAccount {
  id: string;
  institutionName: string;
  maskedAccountNumber: string;
  accountType: 'SAVINGS' | 'TERM_DEPOSIT' | 'MUTUAL_FUND' | 'INSURANCE';
  balance: number;
  currency: string;
  lastSynced: string;
  consentId: string;
  isDemo: boolean;
}

export interface AggregatedTransaction {
  id: string;
  accountId: string;
  date: string;
  narration: string;
  amount: number;
  type: 'DEBIT' | 'CREDIT';
  category: string;
  merchant: string;
  nature: 'Need' | 'Want';
}

export interface FinancialDataProvider {
  initiateConsent(userVpa: string, accountTypes: string[]): Promise<ConsentArtifact>;
  getConsent(consentId: string): Promise<ConsentArtifact | null>;
  revokeConsent(consentId: string): Promise<boolean>;
  getAccounts(consentId: string): Promise<FinancialAccount[]>;
  getTransactions(accountId: string): Promise<AggregatedTransaction[]>;
  syncAccount(accountId: string): Promise<{ success: boolean; newTransactions: number }>;
  disconnect(accountId: string): Promise<boolean>;
}

const STORAGE_KEYS = {
  CONSENTS: 'arthsetu_aa_consents_v1',
  ACCOUNTS: 'arthsetu_aa_accounts_v1',
  TRANSACTIONS: 'arthsetu_aa_transactions_v1',
  CATEGORY_RULES: 'arthsetu_aa_cat_rules_v1',
};

// Default Rule mapping based on Indian merchant patterns
export const DEFAULT_MERCHANT_CATEGORIES: Record<string, { category: string; nature: 'Need' | 'Want' }> = {
  SWIGGY: { category: 'Dining', nature: 'Want' },
  ZOMATO: { category: 'Dining', nature: 'Want' },
  UBER: { category: 'Transit', nature: 'Need' },
  OLA: { category: 'Transit', nature: 'Need' },
  AMAZON: { category: 'Shopping', nature: 'Want' },
  FLIPKART: { category: 'Shopping', nature: 'Want' },
  NETFLIX: { category: 'Digital', nature: 'Want' },
  HOTSTAR: { category: 'Digital', nature: 'Want' },
  ZEPTO: { category: 'Ration', nature: 'Need' },
  BLINKIT: { category: 'Ration', nature: 'Need' },
  BIGBASKET: { category: 'Ration', nature: 'Need' },
  APOLLO: { category: 'Healthcare', nature: 'Need' },
  TATA_1MG: { category: 'Healthcare', nature: 'Need' },
  BESCOM: { category: 'Utilities', nature: 'Need' },
  MSEDCL: { category: 'Utilities', nature: 'Need' },
  ACT_FIBER: { category: 'Utilities', nature: 'Need' },
  RENT: { category: 'Housing', nature: 'Need' },
};

export class AccountAggregatorProvider implements FinancialDataProvider {
  async initiateConsent(userVpa: string, accountTypes: string[]): Promise<ConsentArtifact> {
    const consent: ConsentArtifact = {
      id: `consent-${Date.now()}`,
      userVpa,
      status: 'ACTIVE',
      purpose: 'Mindful Personal Financial Analysis & Cashflow Advisory (RBI AA Framework)',
      dataLifeDays: 365,
      consentTimestamp: new Date().toISOString(),
      fetchFrequency: 'Daily Recurring (Encrypted)',
      accountTypes,
      fipName: 'Setu / Sahamati Regulated Account Aggregator Network',
    };

    const existing = this.loadConsents();
    existing.push(consent);
    this.saveConsents(existing);
    return consent;
  }

  async getConsent(consentId: string): Promise<ConsentArtifact | null> {
    const list = this.loadConsents();
    return list.find((c) => c.id === consentId) || null;
  }

  async revokeConsent(consentId: string): Promise<boolean> {
    const list = this.loadConsents();
    const updated = list.map((c) => (c.id === consentId ? { ...c, status: 'REVOKED' as const } : c));
    this.saveConsents(updated);

    // Remove accounts associated with revoked consent
    const accounts = this.loadAccounts();
    const filteredAccounts = accounts.filter((a) => a.consentId !== consentId);
    this.saveAccounts(filteredAccounts);
    return true;
  }

  async getAccounts(consentId?: string): Promise<FinancialAccount[]> {
    const list = this.loadAccounts();
    if (consentId) return list.filter((a) => a.consentId === consentId);
    return list;
  }

  async getTransactions(accountId?: string): Promise<AggregatedTransaction[]> {
    const list = this.loadTransactions();
    if (accountId) return list.filter((t) => t.accountId === accountId);
    return list;
  }

  async syncAccount(accountId: string): Promise<{ success: boolean; newTransactions: number }> {
    const accounts = this.loadAccounts();
    const acc = accounts.find((a) => a.id === accountId);
    if (!acc) return { success: false, newTransactions: 0 };

    acc.lastSynced = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
    });
    this.saveAccounts(accounts);
    return { success: true, newTransactions: 2 };
  }

  async disconnect(accountId: string): Promise<boolean> {
    const accounts = this.loadAccounts();
    this.saveAccounts(accounts.filter((a) => a.id !== accountId));
    const txns = this.loadTransactions();
    this.saveTransactions(txns.filter((t) => t.accountId !== accountId));
    return true;
  }

  // Helper storage methods
  loadConsents(): ConsentArtifact[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CONSENTS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  saveConsents(consents: ConsentArtifact[]) {
    localStorage.setItem(STORAGE_KEYS.CONSENTS, JSON.stringify(consents));
  }

  loadAccounts(): FinancialAccount[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.ACCOUNTS);
      if (raw) return JSON.parse(raw);
      // Return default connected demo account clearly labeled as Development / Sandbox
      return [
        {
          id: 'acc-demo-1',
          institutionName: 'HDFC Bank (Development Sandbox)',
          maskedAccountNumber: '•••• •••• 4092',
          accountType: 'SAVINGS',
          balance: 142500,
          currency: 'INR',
          lastSynced: 'Just now',
          consentId: 'consent-init-1',
          isDemo: true,
        },
      ];
    } catch {
      return [];
    }
  }

  saveAccounts(accounts: FinancialAccount[]) {
    localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(accounts));
  }

  loadTransactions(): AggregatedTransaction[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (raw) return JSON.parse(raw);
      return [
        {
          id: 'tx-1',
          accountId: 'acc-demo-1',
          date: 'Nov 18, 2025',
          narration: 'SWIGGY*BANGALORE',
          amount: 640,
          type: 'DEBIT',
          category: 'Dining',
          merchant: 'Swiggy',
          nature: 'Want',
        },
        {
          id: 'tx-2',
          accountId: 'acc-demo-1',
          date: 'Nov 17, 2025',
          narration: 'ZEPTO GROCERY',
          amount: 1420,
          type: 'DEBIT',
          category: 'Ration',
          merchant: 'Zepto',
          nature: 'Need',
        },
        {
          id: 'tx-3',
          accountId: 'acc-demo-1',
          date: 'Nov 15, 2025',
          narration: 'UBER INDIA TRIP',
          amount: 450,
          type: 'DEBIT',
          category: 'Transit',
          merchant: 'Uber',
          nature: 'Need',
        },
        {
          id: 'tx-4',
          accountId: 'acc-demo-1',
          date: 'Nov 14, 2025',
          narration: 'AMAZON PAY INDIA',
          amount: 2199,
          type: 'DEBIT',
          category: 'Shopping',
          merchant: 'Amazon',
          nature: 'Want',
        },
      ];
    } catch {
      return [];
    }
  }

  saveTransactions(txns: AggregatedTransaction[]) {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(txns));
  }
}

export const financialDataService = new AccountAggregatorProvider();
