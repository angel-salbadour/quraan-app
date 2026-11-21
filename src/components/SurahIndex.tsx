import React, { useMemo, useState } from 'react';
import { CheckCircle2, Pause, Play, Search, X } from 'lucide-react';
import { JUZ_LIST, SURAHS } from '../data/surahs';
import type { RevelationType } from '../types/quran';
import { filterSurahs, formatAyahCount, toArabicDigits } from '../utils/quranHelpers';

interface SurahIndexProps {
  currentSurahNumber: number;
  playingSurahNumber: number | null;
  isAudioPlaying: boolean;
  completedSurahs: number[];
  onSelectSurah: (surahNumber: number, targetAyah?: number) => void;
  onPlaySurah: (surahNumber: number) => void;
  isFullPage?: boolean;
}

export const SurahIndex: React.FC<SurahIndexProps> = ({
  currentSurahNumber,
  playingSurahNumber,
  isAudioPlaying,
  completedSurahs,
  onSelectSurah,
  onPlaySurah,
  isFullPage = false,
}) => {
  const [indexMode, setIndexMode] = useState<'surahs' | 'juz'>('surahs');
  const [query, setQuery] = useState('');
  const [revelationFilter, setRevelationFilter] = useState<'all' | RevelationType>('all');

  const completedSet = useMemo(() => new Set(completedSurahs), [completedSurahs]);

  const filteredSurahs = useMemo(
    () => filterSurahs(SURAHS, query, revelationFilter),
    [query, revelationFilter]
  );

  return (
    <div
      className={`flex flex-col ${
        isFullPage
          ? 'mx-auto w-full max-w-3xl px-4 py-5 pb-28'
          : 'h-[calc(100vh-4rem)] sticky top-16 border-l border-[var(--border-hairline)] bg-[var(--bg-surface)]'
      }`}
    >
      {/* Top Controls */}
      <div className={`${isFullPage ? 'mb-5' : 'p-4 border-b border-[var(--border-hairline)]'} space-y-3`}>
        {isFullPage && (
          <div className="flex items-baseline justify-between">
            <h1 className="text-xl font-bold text-[var(--text-primary)]">فهرس القرآن الكريم</h1>
            <span className="text-xs text-[var(--text-muted)] tabular-nums">
              {toArabicDigits(114)} سورة · {toArabicDigits(30)} جزءًا
            </span>
          </div>
        )}

        {/* Mode Switcher: Surahs / Juz */}
        <div
          className="grid grid-cols-2 gap-1 rounded-xl bg-[var(--bg-subtle)] p-1"
          role="tablist"
          aria-label="طريقة الفهرسة"
        >
          <button
            type="button"
            role="tab"
            aria-selected={indexMode === 'surahs'}
            onClick={() => setIndexMode('surahs')}
            className={`rounded-lg py-2 text-xs font-semibold transition-colors whitespace-nowrap min-h-[38px] ${
              indexMode === 'surahs'
                ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            السور ({toArabicDigits(114)})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={indexMode === 'juz'}
            onClick={() => setIndexMode('juz')}
            className={`rounded-lg py-2 text-xs font-semibold transition-colors whitespace-nowrap min-h-[38px] ${
              indexMode === 'juz'
                ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            الأجزاء ({toArabicDigits(30)})
          </button>
        </div>

        {indexMode === 'surahs' && (
          <>
            {/* Search Input */}
            <div className="relative">
              <label htmlFor={isFullPage ? 'surah-search-mobile' : 'surah-search-desktop'} className="sr-only">
                ابحث عن سورة بالاسم أو الرقم
              </label>
              <Search
                className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden="true"
              />
              <input
                id={isFullPage ? 'surah-search-mobile' : 'surah-search-desktop'}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ابحث باسم السورة أو رقمها..."
                className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] py-2.5 pr-9 pl-9 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none min-h-[44px]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="مسح البحث"
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Revelation Filter */}
            <div className="flex items-center gap-1 rounded-lg bg-[var(--bg-subtle)] p-1">
              {(
                [
                  { value: 'all', label: 'الكل' },
                  { value: 'Meccan', label: 'مكية' },
                  { value: 'Medinan', label: 'مدنية' },
                ] as const
              ).map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRevelationFilter(item.value)}
                  className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-colors whitespace-nowrap min-h-[34px] ${
                    revelationFilter === item.value
                      ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Scrollable List */}
      <div className={isFullPage ? 'space-y-1' : 'flex-1 overflow-y-auto px-2 py-2 space-y-0.5'}>
        {indexMode === 'surahs' ? (
          filteredSurahs.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-[var(--text-secondary)]">
                لا توجد سورة مطابقة لـ «{query}»
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setRevelationFilter('all');
                }}
                className="mt-3 text-xs font-semibold text-[var(--accent-primary)] hover:underline min-h-[36px] px-3"
              >
                عرض جميع السور
              </button>
            </div>
          ) : (
            filteredSurahs.map((surah) => {
              const isSelected = surah.number === currentSurahNumber;
              const isThisPlaying = isAudioPlaying && playingSurahNumber === surah.number;
              const isCompleted = completedSet.has(surah.number);

              return (
                <div
                  key={surah.number}
                  className={`group flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 transition-colors ${
                    isSelected
                      ? 'bg-[var(--accent-soft)]'
                      : 'hover:bg-[var(--bg-subtle)]/75'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectSurah(surah.number)}
                    className="flex flex-1 items-center gap-3 text-right min-h-[44px] min-w-0 focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] rounded-lg"
                    aria-label={`قراءة ${surah.name}`}
                  >
                    {/* Geometric Number Diamond */}
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border text-xs font-bold tabular-nums transition-colors ${
                        isSelected
                          ? 'border-[var(--accent-btn-bg)] bg-[var(--accent-btn-bg)] text-white'
                          : 'border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {toArabicDigits(surah.number)}
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-quran text-lg font-bold truncate leading-snug ${
                            isSelected ? 'text-[var(--accent-primary)]' : 'text-[var(--text-primary)]'
                          }`}
                        >
                          {surah.shortName}
                        </span>
                        {isCompleted && (
                          <CheckCircle2
                            className="h-3.5 w-3.5 shrink-0 text-[var(--accent-primary)]"
                            aria-label="سورة مقروءة"
                          />
                        )}
                      </div>
                      <p className="text-xs text-[var(--text-muted)] truncate tabular-nums">
                        {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                        <span aria-hidden="true"> · </span>
                        {formatAyahCount(surah.ayahCount)}
                        <span aria-hidden="true"> · </span>
                        ج {toArabicDigits(surah.startJuz)}
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onPlaySurah(surah.number)}
                    aria-label={isThisPlaying ? `إيقاف ${surah.name}` : `الاستماع إلى ${surah.name}`}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] ${
                      isThisPlaying
                        ? 'bg-[var(--accent-btn-bg)] text-white'
                        : 'text-[var(--text-muted)] hover:bg-[var(--bg-canvas)] hover:text-[var(--accent-primary)]'
                    }`}
                  >
                    {isThisPlaying ? (
                      <Pause className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Play className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              );
            })
          )
        ) : (
          <div className="space-y-1">
            {JUZ_LIST.map((juz) => {
              const startSurah = SURAHS.find((s) => s.number === juz.surahNumber);
              return (
                <button
                  key={juz.number}
                  type="button"
                  onClick={() => onSelectSurah(juz.surahNumber, juz.ayahNumber)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-3 text-right hover:bg-[var(--bg-subtle)]/80 transition-colors min-h-[56px] border-b border-[var(--border-hairline)]/50 last:border-b-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-canvas)] text-xs font-bold text-[var(--accent-primary)] tabular-nums">
                      {toArabicDigits(juz.number)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {juz.name}
                      </p>
                      <p className="text-xs text-[var(--text-muted)] tabular-nums">
                        يبدأ من {startSurah?.name} · الآية {toArabicDigits(juz.ayahNumber)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
