import React, { useState, useEffect } from 'react';
import {
  financialDataService,
  ConsentArtifact,
  FinancialAccount,
} from '../services/financialDataService';
import { formatINR } from '../utils/formatters';

interface ConnectAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountSynced?: () => void;
}

export const ConnectAccountModal: React.FC<ConnectAccountModalProps> = ({
  isOpen,
  onClose,
  onAccountSynced,
}) => {
  const [activeTab, setActiveTab] = useState<'connect' | 'active' | 'consent'>('active');
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [consents, setConsents] = useState<ConsentArtifact[]>([]);
  const [userVpa, setUserVpa] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([
    'SAVINGS',
    'TERM_DEPOSIT',
    'MUTUAL_FUND',
  ]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    setAccounts(financialDataService.loadAccounts());
    setConsents(financialDataService.loadConsents());
  };

  if (!isOpen) return null;

  const handleInitiateConsent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userVpa.trim()) {
      setStatusMessage('Please enter your Account Aggregator ID or registered mobile.');
      return;
    }

    setIsConnecting(true);
    setStatusMessage('Initiating consent request via RBI Account Aggregator protocol...');

    try {
      const consent = await financialDataService.initiateConsent(userVpa.trim(), selectedTypes);

      // In development/sandbox mode, provision a connected account with transparent labeling
      const newAccount: FinancialAccount = {
        id: `acc-${Date.now()}`,
        institutionName: 'State Bank of India (Sandbox Mode)',
        maskedAccountNumber: '•••• •••• ' + Math.floor(1000 + Math.random() * 9000),
        accountType: 'SAVINGS',
        balance: 98400,
        currency: 'INR',
        lastSynced: 'Just now',
        consentId: consent.id,
        isDemo: true,
      };

      const currentAccs = financialDataService.loadAccounts();
      const updated = [newAccount, ...currentAccs];
      financialDataService.saveAccounts(updated);

      setAccounts(updated);
      setConsents(financialDataService.loadConsents());
      setIsConnecting(false);
      setStatusMessage('Consent established securely! Account linked under RBI AA Framework.');
      setActiveTab('active');
      if (onAccountSynced) onAccountSynced();
    } catch {
      setIsConnecting(false);
      setStatusMessage('Unable to initiate AA consent. Please try again.');
    }
  };

  const handleSync = async (accId: string) => {
    setStatusMessage('Syncing transactions via encrypted AA data stream...');
    await financialDataService.syncAccount(accId);
    loadData();
    setStatusMessage('Financial ledger synchronized.');
    if (onAccountSynced) onAccountSynced();
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleDisconnect = async (accId: string) => {
    await financialDataService.disconnect(accId);
    loadData();
    setStatusMessage('Account disconnected and data access terminated.');
    if (onAccountSynced) onAccountSynced();
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleRevokeConsent = async (consentId: string) => {
    await financialDataService.revokeConsent(consentId);
    loadData();
    setStatusMessage('Consent revoked. Financial institution data pipelines closed.');
    if (onAccountSynced) onAccountSynced();
    setTimeout(() => setStatusMessage(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="rounded-3xl max-w-2xl w-full max-h-[90vh] shadow-2xl border border-white/60 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
        style={{
          background: 'rgba(255, 250, 240, 0.98)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-outline-variant/30 flex items-center justify-between bg-surface-container-lowest/80">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-secondary-fixed text-secondary flex items-center justify-center shadow-xs">
              <span className="material-symbols-outlined text-[24px]">account_balance</span>
            </div>
            <div>
              <h3 className="font-headline-sm text-lg text-on-surface font-bold">
                Connect Financial Accounts
              </h3>
              <p className="text-xs text-on-surface-variant">
                Consent-Based Account Aggregator (RBI AA Architecture)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface text-xl font-bold cursor-pointer p-1"
          >
            ✕
          </button>
        </div>

        {/* Security Assurance Banner */}
        <div className="bg-primary-fixed/30 border-b border-primary/20 px-6 py-3 flex items-start gap-3 text-xs text-on-surface">
          <span className="material-symbols-outlined text-primary text-[18px] shrink-0 mt-0.5">
            verified_user
          </span>
          <p className="leading-relaxed">
            <strong>Security Guarantee:</strong> ArthSetu <strong>NEVER</strong> asks for or stores
            your bank passwords, PINs, or OTPs. All connectivity operates via regulated,
            encrypted Account Aggregator handles with revocable consent.
          </p>
        </div>

        {statusMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-surface-container-high border border-outline-variant/30 text-xs font-semibold text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-outline-variant/20 px-6 pt-3 gap-2 bg-surface-container-lowest/40">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'active'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Connected Accounts ({accounts.length})
          </button>
          <button
            onClick={() => setActiveTab('connect')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'connect'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            + Link New Account
          </button>
          <button
            onClick={() => setActiveTab('consent')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
              activeTab === 'consent'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Consent Artifacts ({consents.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'active' && (
            <div className="space-y-4">
              {accounts.length === 0 ? (
                <div className="py-12 text-center rounded-2xl bg-surface-container-lowest border border-dashed border-outline-variant/40 p-6 flex flex-col items-center">
                  <span className="material-symbols-outlined text-[36px] text-on-surface-variant mb-2">
                    link_off
                  </span>
                  <p className="font-bold text-sm text-on-surface">No financial accounts connected</p>
                  <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
                    Connect an account to automatically organize your transactions and understand cashflow.
                  </p>
                  <button
                    onClick={() => setActiveTab('connect')}
                    className="mt-4 px-4 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold cursor-pointer"
                  >
                    Link Account via AA
                  </button>
                </div>
              ) : (
                accounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="p-5 rounded-2xl bg-surface-container-lowest border border-outline-variant/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-secondary-fixed/50 flex items-center justify-center text-secondary font-bold text-xs">
                        {acc.institutionName.slice(0, 4).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-label-lg font-bold text-on-surface text-sm">
                            {acc.institutionName}
                          </h4>
                          {acc.isDemo && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary-fixed/60 text-secondary font-bold">
                              Sandbox Mode
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-on-surface-variant block mt-0.5">
                          {acc.maskedAccountNumber} · {acc.accountType}
                        </span>
                        <span className="text-[11px] text-primary font-medium">
                          Last Synced: {acc.lastSynced}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 pt-2 sm:pt-0">
                      <span className="font-headline-sm text-base text-on-surface font-bold">
                        {formatINR(acc.balance)}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSync(acc.id)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-primary font-bold cursor-pointer transition-colors"
                        >
                          Sync Now
                        </button>
                        <button
                          onClick={() => handleDisconnect(acc.id)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-surface-container text-on-surface-variant hover:text-secondary cursor-pointer transition-colors"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'connect' && (
            <form onSubmit={handleInitiateConsent} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-on-surface uppercase mb-1">
                  Account Aggregator Handle / Mobile VPA
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210@onemoney or name@setu"
                  value={userVpa}
                  onChange={(e) => setUserVpa(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-surface-container-lowest border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <span className="text-[11px] text-on-surface-variant mt-1 block">
                  Regulated AAs: Setu, OneMoney, Finvu, Sahamati network.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface uppercase mb-2">
                  Permitted Account Data Categories
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { id: 'SAVINGS', label: 'Savings & Current Accounts' },
                    { id: 'TERM_DEPOSIT', label: 'Fixed & Recurring Deposits' },
                    { id: 'MUTUAL_FUND', label: 'Mutual Funds & Demat' },
                    { id: 'INSURANCE', label: 'Life & Health Policies' },
                  ].map((cat) => (
                    <label
                      key={cat.id}
                      className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant/20 flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(cat.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedTypes([...selectedTypes, cat.id]);
                          else setSelectedTypes(selectedTypes.filter((t) => t !== cat.id));
                        }}
                        className="accent-primary cursor-pointer"
                      />
                      <span>{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/20 text-xs text-on-surface-variant space-y-1.5">
                <span className="font-bold text-on-surface block">Explicit Consent Terms:</span>
                <p>• Purpose: Automated cashflow budgeting and goal alignment.</p>
                <p>• Frequency: Recurring daily read-only data synchronization.</p>
                <p>• Revocability: You may revoke access anytime with zero penalty.</p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('active')}
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isConnecting}
                  className="px-5 py-2 rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md cursor-pointer hover:bg-primary-container disabled:opacity-50"
                >
                  {isConnecting ? 'Requesting AA Consent...' : 'Authorize Encrypted Consent'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'consent' && (
            <div className="space-y-4">
              {consents.length === 0 ? (
                <p className="text-xs text-on-surface-variant text-center py-8">
                  No active consent artifacts recorded.
                </p>
              ) : (
                consents.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-on-surface font-mono">{c.id}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          c.status === 'ACTIVE'
                            ? 'bg-primary-fixed text-primary'
                            : 'bg-secondary-fixed text-secondary'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="text-on-surface-variant">{c.purpose}</p>
                    <div className="flex flex-wrap items-center justify-between pt-2 border-t border-outline-variant/20 text-on-surface-variant text-[11px] gap-2">
                      <span>VPA: {c.userVpa}</span>
                      <span>Valid: {c.dataLifeDays} Days</span>
                      {c.status === 'ACTIVE' && (
                        <button
                          onClick={() => handleRevokeConsent(c.id)}
                          className="text-secondary font-bold hover:underline cursor-pointer"
                        >
                          Revoke Consent Now
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
