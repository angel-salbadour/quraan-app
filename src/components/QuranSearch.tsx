import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpLeft, BookOpen, Search, X } from 'lucide-react';
import { SURAHS } from '../data/surahs';
import { searchQuranVerses } from '../services/quranApi';
import type { VerseSearchResult } from '../types/quran';
import { filterSurahs, toArabicDigits } from '../utils/quranHelpers';

interface QuranSearchProps {
  onOpenSurahAyah: (surahNumber: number, ayahNumber?: number) => void;
}

const SUGGESTED_QUERIES = ['الرحمن', 'الصبر', 'الكهف', 'يس', 'الكرسي', 'الحمد لله'];

export const QuranSearch: React.FC<QuranSearchProps> = ({ onOpenSurahAyah }) => {
  const [query, setQuery] = useState('');
  const [verseResults, setVerseResults] = useState<VerseSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const matchingSurahs = useMemo(() => {
    if (!query.trim()) return [];
    return filterSurahs(SURAHS, query).slice(0, 8);
  }, [query]);

  useEffect(() => {
    const clean = query.trim();
    if (clean.length < 2) {
      setVerseResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setIsSearching(true);
      searchQuranVerses(clean, controller.signal)
        .then((results) => {
          if (!controller.signal.aborted) {
            setVerseResults(results);
            setIsSearching(false);
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setIsSearching(false);
          }
        });
    }, 300);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 md:px-8 pb-36 md:pb-32">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
          البحث في القرآن الكريم
        </h1>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
          ابحث عن أي سورة أو كلمة في آيات المصحف الشريف للانتقال إليها مباشرة.
        </p>
      </div>

      {/* Search Field */}
      <div className="relative mb-5">
        <label htmlFor="quran-global-search" className="sr-only">
          ابحث في سور وآيات القرآن الكريم
        </label>
        <Search
          className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-muted)]"
          aria-hidden="true"
        />
        <input
          id="quran-global-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="اكتب كلمة من آية أو اسم سورة..."
          className="w-full rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] py-3.5 pr-12 pl-12 text-base text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none min-h-[52px]"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="مسح نص البحث"
            className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Quick Suggestions when empty */}
      {!query.trim() && (
        <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
          <p className="text-xs font-semibold text-[var(--text-muted)] mb-3">اقتراحات بحث سريعة</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-3.5 py-2 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors min-h-[40px]"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Surah Matches */}
      {matchingSurahs.length > 0 && (
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-semibold text-[var(--text-secondary)]">
            السور المطابقة ({toArabicDigits(matchingSurahs.length)})
          </h2>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {matchingSurahs.map((surah) => (
              <button
                key={surah.number}
                type="button"
                onClick={() => onOpenSurahAyah(surah.number)}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3 text-right hover:border-[var(--accent-primary)] transition-colors min-h-[56px]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--accent-soft)] text-xs font-bold text-[var(--accent-primary)] tabular-nums">
                    {toArabicDigits(surah.number)}
                  </span>
                  <div className="min-w-0">
                    <p className="font-quran text-lg font-bold text-[var(--text-primary)] truncate">
                      {surah.name}
                    </p>
                    <p className="text-xs text-[var(--text-muted)] tabular-nums">
                      {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'} · {toArabicDigits(surah.ayahCount)} آية
                    </p>
                  </div>
                </div>
                <ArrowUpLeft className="h-4 w-4 shrink-0 text-[var(--text-muted)]" aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Verse Matches */}
      {query.trim().length >= 2 && (
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
              الآيات المطابقة {verseResults.length > 0 ? `(${toArabicDigits(verseResults.length)})` : ''}
            </h2>
            {isSearching && (
              <span className="text-xs text-[var(--text-muted)]">جارٍ البحث في المصحف...</span>
            )}
          </div>

          {!isSearching && verseResults.length === 0 && matchingSurahs.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] py-12 px-6 text-center">
              <BookOpen className="mx-auto h-7 w-7 text-[var(--text-muted)] mb-2" aria-hidden="true" />
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                لم يتم العثور على نتائج لـ «{query}»
              </p>
              <p className="mt-1 text-xs text-[var(--text-muted)]">
                جرّب البحث بكلمة مفردة دون تشكيل، مثل: الرحمة أو التقوى أو الإخلاص.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border-hairline)] rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
              {verseResults.map((item) => (
                <button
                  key={`${item.surahNumber}:${item.ayahNumber}`}
                  type="button"
                  onClick={() => onOpenSurahAyah(item.surahNumber, item.ayahNumber)}
                  className="block w-full p-4 md:p-5 text-right hover:bg-[var(--bg-subtle)]/60 transition-colors"
                >
                  <p className="font-quran text-xl md:text-2xl leading-loose text-[var(--text-primary)]">
                    {item.text}
                  </p>
                  <p className="mt-2 text-xs font-medium text-[var(--accent-primary)] tabular-nums">
                    سورة {item.surahName} · الآية {toArabicDigits(item.ayahNumber)}
                  </p>
                </button>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
