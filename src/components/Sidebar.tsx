import React from 'react';
import { NavScreen } from '../types';

interface SidebarProps {
  currentScreen: NavScreen;
  onNavigate: (screen: NavScreen) => void;
  onOpenSettings: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  userName?: string;
  userTitle?: string;
  onOpenAI?: () => void;
}

export const LOGO_URL =
  'https://lh3.googleusercontent.com/aida/AEtjO1VtTDaQU3RC5xnlZYlt-E9Dbz7sW0ZB9uus6zYN6fSFmENkOSbirzCmQeH_TqfTcMi_9q_Rl7F_omeVkqfQVsle-cqZToiZ-1txKjTH81k49RlOWuxSwbGmFgHhWL59Zs32NzKheoEbRLDVbX85SQvkhp25z6QSg-ABmqk_8Gk4HAbpO5cXWfSH3BwgtddrGfkdgSFKbly6ttti84s16EnNwJTFk564pUzhGp5AnWhO9QlB6Nrpy36f_6P7';

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  onNavigate,
  onOpenSettings,
  isMobileOpen = false,
  onCloseMobile,
  userName = 'Aarav Sharma',
  userTitle = 'Wealth Architect',
  onOpenAI,
}) => {
  // Listen for Escape key to close the drawer
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    };
    if (isMobileOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMobileOpen, onCloseMobile]);

  const navItems: { id: NavScreen; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'profile', label: 'Profile', icon: 'person' },
    { id: 'expenses', label: 'Expenses', icon: 'receipt_long' },
    { id: 'emergency-fund', label: 'Emergency Fund', icon: 'shield' },
    { id: 'goals-and-what-if', label: 'Goals & What-If', icon: 'flag' },
    { id: 'learn', label: 'Learn', icon: 'menu_book' },
  ];

  const handleItemClick = (screen: NavScreen) => {
    onNavigate(screen);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Backdrop (appears whenever sidebar is open, click to dismiss/disappear) */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-200"
          title="Click to close menu"
        />
      )}

      {/* Sidebar drawer: Only appears from 3 lines, else disappears (-translate-x-full) */}
      <aside
        aria-label="Main Navigation Sidebar"
        className={`fixed left-0 top-0 h-full w-72 sm:w-80 z-50 flex flex-col justify-between py-6 px-4 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full pointer-events-none'
        }`}
        style={{
          background: 'rgba(255, 250, 240, 0.94)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 16px 40px rgba(80, 65, 45, 0.18)',
        }}
      >
      <div className="flex flex-col gap-6">
        {/* Brand Header with Close Button */}
        <div className="flex items-center justify-between px-2">
          <div
            onClick={() => handleItemClick('dashboard')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <img
              alt="ArthSetu Logo"
              className="h-9 w-auto object-contain transition-transform group-hover:scale-105"
              src={LOGO_URL}
              onError={(e) => {
                // Fallback if network blocked
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            <div className="flex flex-col">
              <span className="font-headline-sm text-[22px] text-on-surface tracking-tight leading-none">
                ArthSetu
              </span>
              <span className="font-label-sm text-[10px] text-tertiary tracking-widest uppercase mt-0.5 font-bold">
                Financial Wisdom
              </span>
            </div>
          </div>

          {/* Close Sidebar 'X' Button */}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              aria-label="Close menu"
              title="Close menu"
              className="p-1.5 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface hover:bg-stone-200/50 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          )}
        </div>

        <div className="h-px w-full bg-outline-variant/30 my-1" />

        {/* Navigation Items */}
        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => {
            const isActive = currentScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl font-label-lg transition-all duration-200 text-left w-full cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container shadow-[0_4px_14px_rgba(111,128,96,0.20)] font-semibold'
                    : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined text-[20px] transition-transform group-hover:scale-110 ${
                      isActive ? 'text-on-primary-container' : 'text-on-surface-variant'
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                <span
                  className={`w-1.5 h-1.5 rounded-full bg-secondary-container transition-opacity ${
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                />
              </button>
            );
          })}
        </nav>
        {/* ArthSetu AI Chatbot Assistant Card */}
        {onOpenAI && (
          <div className="mt-2 p-3.5 rounded-2xl bg-primary-fixed/40 border border-primary/20 flex flex-col gap-2">
            <div className="flex items-center gap-2 text-primary font-bold text-xs">
              <span className="material-symbols-outlined text-[18px]">auto_awesome</span>
              <span>ArthSetu AI Advisor</span>
            </div>
            <p className="text-[11px] text-on-surface-variant leading-snug">
              Mindful guidance for budgets, debt, SIPs, or emergency runway.
            </p>
            <button
              onClick={() => {
                onOpenAI();
                if (onCloseMobile) onCloseMobile();
              }}
              className="w-full py-2 px-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">chat</span>
              <span>Ask Financial AI</span>
            </button>
          </div>
        )}
      </div>

      {/* User Card at Bottom */}
      <div
        style={{
          background: 'rgba(243, 231, 209, 0.65)',
          border: '1px solid rgba(255, 255, 255, 0.7)',
        }}
        className="flex items-center justify-between backdrop-blur-md px-3.5 py-3 rounded-2xl shadow-sm"
      >
        <button
          onClick={() => handleItemClick('profile')}
          className="flex items-center gap-3 min-w-0 text-left flex-1 hover:opacity-85 transition-opacity cursor-pointer"
        >
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm text-on-primary font-semibold">
            <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
          </div>
          <div className="flex flex-col truncate">
            <span className="font-label-lg text-label-lg text-on-surface truncate font-semibold">
              {userName}
            </span>
            <span className="font-label-sm text-label-sm text-secondary truncate font-medium">
              {userTitle}
            </span>
          </div>
        </button>

        <button
          onClick={() => {
            onOpenSettings();
            if (onCloseMobile) onCloseMobile();
          }}
          aria-label="Account Settings"
          className="p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors ml-1 cursor-pointer"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">settings</span>
        </button>
      </div>
    </aside>
    </>
  );
};
