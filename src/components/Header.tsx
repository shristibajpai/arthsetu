import React, { useState } from 'react';
import { LOGO_URL } from './Sidebar';
import { NotificationItem } from '../types';

interface HeaderProps {
  notifications: NotificationItem[];
  onOpenNotifications: () => void;
  onNavigateProfile: () => void;
  onSearch: (query: string) => void;
  searchQuery: string;
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
  onToggleMobileMenu,
  userName = 'Aarav Sharma',
  healthScore = 88,
  onOpenAI,
}) => {
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
        background: 'rgba(255, 250, 240, 0.88)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.6)',
        boxShadow: '0 10px 30px rgba(70, 50, 30, 0.06)',
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
              Namaste, {firstName} <span className="hidden sm:inline">— Shubh Prabhat</span>
            </h1>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-on-surface-variant font-label-sm text-[11px] truncate">
            <span className="material-symbols-outlined text-[14px] text-tertiary">brightness_7</span>
            <span>Kartik Shukla, Nov 2025</span>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            <span className="text-tertiary font-semibold">Dawn Cycle</span>
          </div>
        </div>
      </div>

      {/* Right: Search, Score, AI Advisor, Notifications, Avatar */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="relative items-center hidden xl:flex">
          <span className="material-symbols-outlined absolute left-3.5 text-on-surface-variant text-[18px]">
            search
          </span>
          <input
            className="w-56 h-9 pl-9 pr-7 rounded-xl bg-surface-container-lowest/70 text-on-surface placeholder:text-on-surface-variant/70 font-body-sm text-xs backdrop-blur-sm border border-outline-variant/30 focus:outline-none focus:border-primary/50 focus:bg-surface-container-lowest transition-all"
            placeholder="Search mantras, plans..."
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-2.5 text-xs text-on-surface-variant hover:text-on-surface cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Vittiya Santulan Health Badge */}
        <div
          onClick={onNavigateProfile}
          className="flex items-center gap-1.5 bg-secondary-fixed/50 px-2.5 sm:px-3 py-1.5 rounded-full backdrop-blur-sm border border-secondary-fixed-dim/30 shadow-xs cursor-pointer hover:bg-secondary-fixed/70 transition-all shrink-0"
          title="Vittiya Santulan Score"
        >
          <span className="material-symbols-outlined text-secondary text-[16px] sm:text-[18px]">spa</span>
          <div className="flex items-center gap-1">
            <span className="hidden sm:inline font-label-sm text-[11px] text-on-surface-variant font-medium">
              Vittiya:
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
