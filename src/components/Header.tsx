import React from 'react';
import { Download, Moon, Sun } from 'lucide-react';
import type { AppTab, ReadingTheme } from '../types/quran';

interface HeaderProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  isPWAInstalled: boolean;
  onOpenInstallModal: () => void;
  theme: ReadingTheme;
  onCycleTheme: () => void;
}

const DESKTOP_TABS: Array<{ id: AppTab; label: string }> = [
  { id: 'reader', label: 'المصحف' },
  { id: 'reciters', label: 'القراء' },
  { id: 'search', label: 'البحث' },
  { id: 'bookmarks', label: 'المحفوظات' },
];

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  isPWAInstalled,
  onOpenInstallModal,
  theme,
  onCycleTheme,
}) => {
  return (
    <header
      className="sticky top-0 z-30 h-[52px] md:h-16 border-b border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 backdrop-blur-md pt-safe"
      role="banner"
    >
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between gap-8 px-4 md:px-6">
        {/* Zone 1: Single-line brand title */}
        <button
          type="button"
          onClick={() => onSelectTab('reader')}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[var(--text-primary)] whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] rounded-lg"
          aria-label="الانتقال إلى المصحف المرتل"
        >
          <span
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-[var(--accent-btn-bg)] text-white"
            aria-hidden="true"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </span>
          <span className="font-quran text-xl md:text-2xl font-bold leading-none">المصحف المرتل</span>
        </button>

        {/* Zone 2: Desktop primary navigation (4 single-line links) */}
        <nav
          className="hidden md:flex items-center gap-7"
          aria-label="التنقل الرئيسي"
        >
          {DESKTOP_TABS.map((tab) => {
            const isActive = activeTab === tab.id || (tab.id === 'reader' && activeTab === 'surahs');
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 min-h-[44px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)] ${
                  isActive
                    ? 'text-[var(--accent-primary)] font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab.label}
                {isActive && (
                  <span
                    className="absolute inset-x-0 bottom-1 h-0.5 rounded-full bg-[var(--accent-primary)]"
                    aria-hidden="true"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          {!isPWAInstalled ? (
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-btn-bg)] px-3.5 py-2 text-xs md:text-sm font-medium text-white hover:bg-[var(--accent-btn-hover)] transition-colors whitespace-nowrap shrink-0 min-h-[40px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-primary)]"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>تثبيت التطبيق</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onCycleTheme}
              aria-label="تبديل مظهر القراءة"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-subtle)] px-3.5 py-2 text-xs md:text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--border-hairline)]/60 transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4" aria-hidden="true" />
              )}
              <span>{theme === 'dark' ? 'نهاري' : theme === 'sepia' ? 'ليلي' : 'مريح للعين'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
