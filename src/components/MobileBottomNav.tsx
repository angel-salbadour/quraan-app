import React from 'react';
import { BookOpen, Bookmark, Headphones, List, Search } from 'lucide-react';
import type { AppTab } from '../types/quran';

interface MobileBottomNavProps {
  activeTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  bookmarksCount: number;
}

const MOBILE_TABS: Array<{ id: AppTab; label: string; Icon: React.FC<{ className?: string }> }> = [
  { id: 'reader', label: 'المصحف', Icon: BookOpen },
  { id: 'surahs', label: 'السور', Icon: List },
  { id: 'reciters', label: 'القراء', Icon: Headphones },
  { id: 'search', label: 'البحث', Icon: Search },
  { id: 'bookmarks', label: 'المحفوظات', Icon: Bookmark },
];

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  bookmarksCount,
}) => {
  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-[var(--border-hairline)] bg-[var(--bg-surface)]/95 backdrop-blur-md pb-safe"
      aria-label="التنقل السفلي"
    >
      <div className="grid grid-cols-5 h-[60px] items-center">
        {MOBILE_TABS.map(({ id, label, Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onSelectTab(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex flex-col items-center justify-center gap-0.5 min-h-[48px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent-primary)] ${
                isActive ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 ${isActive ? 'stroke-[2.3]' : 'stroke-[1.75]'}`} />
                {id === 'bookmarks' && bookmarksCount > 0 && (
                  <span className="sr-only">{bookmarksCount} محفوظات</span>
                )}
              </div>
              <span className={`text-[11px] leading-tight whitespace-nowrap ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
