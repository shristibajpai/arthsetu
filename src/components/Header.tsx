import React, { useState } from 'react';
import { LOGO_URL } from './Sidebar';
import { NavScreen, NotificationItem } from '../types';

interface HeaderProps {
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onNavigateProfile: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
  searchResults: { id: string; title: string; detail: string; screen: NavScreen }[];
  onSelectSearchResult: (screen: NavScreen) => void;
  onToggleMobileMenu?: () => void;
  userName?: string;
  healthScore?: number;
  onOpenAI?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  notifications,
  onOpenNotifications,
  onNavigateProfile,
  onSearch,
  searchQuery,
  searchResults,
  onSelectSearchResult,
  onToggleMobileMenu,
  userName = 'Aarav Sharma',
  healthScore = 88,
  onOpenAI,
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const firstName = userName.split(' ')[0] || 'Aarav';
  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AS';

  return (
    <header
      className="fixed top-0 left-0 right-0 h-20 z-40 px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4"
      style={{
        background: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(215, 222, 231, 0.8)',
        boxShadow: '0 8px 24px rgba(23, 33, 47, 0.04)',
      }}
    >
      {/* Left: Brand / Salutation with 3-lines Menu Trigger */}
      <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            aria-label="Toggle Navigation Menu"
            title="Navigation Menu (3 lines)"
            className="p-2 sm:p-2.5 rounded-xl text-on-surface-variant hover:bg-stone-200/60 hover:text-on-surface transition-all active:scale-95 cursor-pointer shrink-0 flex items-center justify-center border border-outline-variant/40 bg-surface/50"
            type="button"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
        )}
        <img
          alt="ArthSetu"
          className="h-8 w-auto object-contain hidden sm:block shrink-0"
          src={LOGO_URL}
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h1
              onClick={onNavigateProfile}
              className="font-headline-sm text-sm sm:text-base lg:text-[19px] text-on-surface font-semibold tracking-tight cursor-pointer hover:text-primary transition-colors truncate"
            >
              Good morning, {firstName}
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-on-surface-variant font-label-sm text-[11px] truncate">
            <span>Your financial overview</span>
          </div>
        </div>
      </div>

      {/* Right: Search, Score, AI Advisor, Notifications, Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button type="button" aria-label="Open search" onClick={() => setIsSearchOpen((open) => !open)} className="lg:hidden p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high">
          <span className="material-symbols-outlined text-[21px]">search</span>
        </button>
        <div className={`relative items-center ${isSearchOpen ? 'absolute top-[4.5rem] left-3 right-3 z-50 flex lg:static lg:top-auto lg:left-auto lg:right-auto' : 'hidden lg:flex'}`}>
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            className="w-full lg:w-56 h-10 pl-9 pr-8 rounded-xl bg-white text-on-surface placeholder:text-on-surface-variant/70 font-body-sm text-sm border border-outline-variant/50 shadow-sm focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
            placeholder="Search expenses and goals..."
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsSearchFocused(false);
                setIsSearchOpen(false);
              }
              if (e.key === 'Enter' && searchResults[0]) {
                onSelectSearchResult(searchResults[0].screen);
                setIsSearchFocused(false);
                setIsSearchOpen(false);
              }
            }}
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearch('')}
              className="absolute right-2.5 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              ✕
            </button>
          )}
          {isSearchFocused && searchQuery.trim() && (
            <div className="absolute top-full left-0 right-0 mt-2 p-2 rounded-xl bg-white border border-outline-variant/50 shadow-xl z-50 max-h-80 overflow-y-auto">
              {searchResults.length ? searchResults.map((result) => (
                <button
                  key={`${result.screen}-${result.id}`}
                  type="button"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    onSelectSearchResult(result.screen);
                    setIsSearchFocused(false);
                    setIsSearchOpen(false);
                  }}
                  className="w-full rounded-lg px-3 py-2.5 text-left hover:bg-slate-50 transition-colors"
                >
                  <span className="block text-sm font-medium text-on-surface truncate">{result.title}</span>
                  <span className="block mt-0.5 text-xs text-on-surface-variant">{result.detail}</span>
                </button>
              )) : (
                <p className="px-3 py-3 text-sm text-on-surface-variant">No matching expenses or goals.</p>
              )}
            </div>
          )}
        </div>

        {/* Financial health Health Badge */}
        <div
          onClick={onNavigateProfile}
          className="flex items-center gap-1.5 bg-secondary-fixed/50 px-2.5 sm:px-3 py-1.5 rounded-full backdrop-blur-sm border border-secondary-fixed-dim/30 shadow-xs cursor-pointer hover:bg-secondary-fixed/70 transition-all shrink-0"
          title="Financial health Score"
        >
          <span className="material-symbols-outlined text-secondary text-[16px] sm:text-[18px]">spa</span>
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline font-label-sm text-[11px] text-on-surface-variant font-medium">
              Health:
            </span>
            <span className="font-label-lg text-xs sm:text-sm font-bold text-secondary">
              {healthScore}/100
            </span>
          </div>
        </div>

        {/* ArthSetu AI Chatbot Trigger */}
        {onOpenAI && (
          <button
            aria-label="ArthSetu AI Financial Assistant"
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-label-sm font-semibold transition-all shadow-xs cursor-pointer active:scale-95 shrink-0"
            type="button"
            title="Chat with ArthSetu AI Advisor (Gemini, Grok, GPT)"
          >
            <span className="material-symbols-outlined text-[17px]">auto_awesome</span>
            <span className="hidden md:inline text-xs">AI Advisor</span>
          </button>
        )}

        {/* Notifications Icon Button */}
        <button
          aria-label="Notifications"
          onClick={onOpenNotifications}
          className="relative p-1.5 sm:p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors cursor-pointer shrink-0"
          type="button"
        >
          <span className="material-symbols-outlined text-[20px] sm:text-[22px]">notifications</span>
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-secondary ring-2 ring-surface" />
          )}
        </button>

        {/* User Avatar */}
        <button
          onClick={onNavigateProfile}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-sm text-on-primary font-bold text-xs hover:opacity-90 transition-opacity cursor-pointer"
          title={`${userName} Profile`}
        >
          {initials}
        </button>
      </div>
    </header>
  );
};
