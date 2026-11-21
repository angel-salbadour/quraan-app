import React, { useMemo, useState } from 'react';
import { Check, Headphones, Heart, Play, Search, Volume2, X } from 'lucide-react';
import { AYAH_RECITERS } from '../data/reciters';
import { SURAHS } from '../data/surahs';
import type { AudioPlayerController } from '../hooks/useAudioPlayer';
import type { Reciter, ReciterMoshaf } from '../types/quran';
import { filterReciters, type RiwayaFilter, toArabicDigits } from '../utils/quranHelpers';

interface RecitersDirectoryProps {
  reciters: Reciter[];
  isLoadingReciters: boolean;
  favoriteReciterIds: string[];
  onToggleFavoriteReciter: (reciterId: string) => void;
  currentSurahNumber: number;
  audio: AudioPlayerController;
  onGoToReader: () => void;
}

const RIWAYA_FILTERS: Array<{ id: RiwayaFilter; label: string }> = [
  { id: 'all', label: 'الكل' },
  { id: 'hafs', label: 'حفص عن عاصم' },
  { id: 'warsh', label: 'ورش عن نافع' },
  { id: 'mojawwad', label: 'المصحف المجود' },
  { id: 'qalon', label: 'قالون' },
  { id: 'favorites', label: 'المفضلة' },
];

export const RecitersDirectory: React.FC<RecitersDirectoryProps> = ({
  reciters,
  isLoadingReciters,
  favoriteReciterIds,
  onToggleFavoriteReciter,
  currentSurahNumber,
  audio,
  onGoToReader,
}) => {
  const [directoryTab, setDirectoryTab] = useState<'full' | 'ayah'>('full');
  const [query, setQuery] = useState('');
  const [riwayaFilter, setRiwayaFilter] = useState<RiwayaFilter>('all');
  const [visibleCount, setVisibleCount] = useState(40);

  const currentSurah = useMemo(
    () => SURAHS.find((s) => s.number === currentSurahNumber) ?? SURAHS[0],
    [currentSurahNumber]
  );

  const favoriteSet = useMemo(() => new Set(favoriteReciterIds), [favoriteReciterIds]);

  const filteredReciters = useMemo(
    () => filterReciters(reciters, query, riwayaFilter, favoriteReciterIds),
    [reciters, query, riwayaFilter, favoriteReciterIds]
  );

  const displayedReciters = useMemo(
    () => filteredReciters.slice(0, visibleCount),
    [filteredReciters, visibleCount]
  );

  const handlePlayWithReciter = (reciter: Reciter, moshaf: ReciterMoshaf) => {
    audio.playSurah(currentSurahNumber, reciter, moshaf);
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 pb-36 md:pb-32">
      {/* Header Row */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
            مكتبة القراء والتلاوات
          </h1>
          <p className="mt-1.5 text-sm text-[var(--text-secondary)] tabular-nums">
            {toArabicDigits(reciters.length)} قارئًا بروايات متعددة
            <span aria-hidden="true"> · </span>
            السورة الحالية: {currentSurah.name}
          </p>
        </div>

        {/* Mode Switcher: Full Surah Reciters vs Ayah-by-Ayah Reciters */}
        <div
          className="inline-flex items-center gap-1 rounded-xl bg-[var(--bg-subtle)] p-1 self-start"
          role="tablist"
          aria-label="نوع التلاوة"
        >
          <button
            type="button"
            role="tab"
            aria-selected={directoryTab === 'full'}
            onClick={() => setDirectoryTab('full')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs md:text-sm font-semibold transition-colors whitespace-nowrap min-h-[40px] ${
              directoryTab === 'full'
                ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Headphones className="h-4 w-4" aria-hidden="true" />
            <span>جميع القراء ({toArabicDigits(reciters.length)})</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={directoryTab === 'ayah'}
            onClick={() => setDirectoryTab('ayah')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs md:text-sm font-semibold transition-colors whitespace-nowrap min-h-[40px] ${
              directoryTab === 'ayah'
                ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Volume2 className="h-4 w-4" aria-hidden="true" />
            <span>تلاوة آية بآية ({toArabicDigits(AYAH_RECITERS.length)})</span>
          </button>
        </div>
      </div>

      {directoryTab === 'full' ? (
        <>
          {/* Search & Riwaya Filter Bar */}
          <div className="mb-6 space-y-3">
            <div className="relative max-w-xl">
              <label htmlFor="reciter-search" className="sr-only">
                ابحث عن اسم القارئ أو الرواية
              </label>
              <Search
                className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
                aria-hidden="true"
              />
              <input
                id="reciter-search"
                type="search"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisibleCount(40);
                }}
                placeholder="ابحث باسم القارئ (مثل: العفاسي، الحصري، المنشاوي، عبد الباسط)..."
                className="w-full rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] py-3 pr-10 pl-10 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:border-[var(--accent-primary)] focus:outline-none min-h-[46px]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="مسح بحث القراء"
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div
              className="flex items-center gap-1.5 overflow-x-auto pb-1"
              role="group"
              aria-label="تصفية القراء حسب الرواية"
            >
              {RIWAYA_FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={riwayaFilter === f.id}
                  onClick={() => {
                    setRiwayaFilter(f.id);
                    setVisibleCount(40);
                  }}
                  className={`rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                    riwayaFilter === f.id
                      ? 'bg-[var(--accent-btn-bg)] text-white'
                      : 'border border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {isLoadingReciters && (
            <p className="mb-4 text-xs text-[var(--text-muted)]">
              جارٍ تحديث القائمة الكاملة لجميع القراء...
            </p>
          )}

          {/* Reciters Grid */}
          {displayedReciters.length === 0 ? (
            <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] py-14 px-6 text-center">
              <p className="text-base font-semibold text-[var(--text-primary)]">
                {riwayaFilter === 'favorites'
                  ? 'لم تضف أي قارئ إلى المفضلة بعد'
                  : `لم يتم العثور على قارئ مطابق لـ «${query}»`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  setRiwayaFilter('all');
                }}
                className="mt-4 rounded-xl bg-[var(--accent-btn-bg)] px-4 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-btn-hover)] min-h-[40px]"
              >
                عرض جميع القراء
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {displayedReciters.map((reciter) => {
                  const isActiveReciter = audio.selectedReciter.id === reciter.id;
                  const isFav = favoriteSet.has(reciter.id);
                  const primaryMoshaf = reciter.moshafs[0];

                  return (
                    <div
                      key={reciter.id}
                      className={`flex flex-col justify-between rounded-2xl border p-4 transition-colors ${
                        isActiveReciter
                          ? 'border-[var(--accent-primary)] bg-[var(--accent-soft)]/50'
                          : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] hover:border-[var(--accent-primary)]/40'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h2 className="text-base font-bold text-[var(--text-primary)] truncate">
                            {reciter.name}
                          </h2>
                          <p className="mt-1 text-xs text-[var(--text-muted)] truncate tabular-nums">
                            {primaryMoshaf?.name}
                            {reciter.country ? ` · ${reciter.country}` : ''}
                            {reciter.moshafs.length > 1
                              ? ` · ${toArabicDigits(reciter.moshafs.length)} روايات`
                              : ''}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => onToggleFavoriteReciter(reciter.id)}
                          aria-label={isFav ? `إزالة ${reciter.name} من المفضلة` : `إضافة ${reciter.name} إلى المفضلة`}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] transition-colors"
                        >
                          <Heart
                            className={`h-4 w-4 ${
                              isFav ? 'fill-rose-500 text-rose-500' : ''
                            }`}
                            aria-hidden="true"
                          />
                        </button>
                      </div>

                      {/* Moshaf / Riwaya Selector if Reciter has multiple */}
                      {reciter.moshafs.length > 1 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {reciter.moshafs.slice(0, 3).map((moshaf) => {
                            const isSelectedMoshaf =
                              isActiveReciter && audio.selectedMoshaf.id === moshaf.id;
                            return (
                              <button
                                key={moshaf.id}
                                type="button"
                                aria-label={`تشغيل ${moshaf.name} بصوت ${reciter.name}`}
                                onClick={() => handlePlayWithReciter(reciter, moshaf)}
                                className={`rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors min-h-[32px] ${
                                  isSelectedMoshaf
                                    ? 'bg-[var(--accent-btn-bg)] text-white'
                                    : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                                }`}
                              >
                                {moshaf.name}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="mt-4 flex items-center gap-2 pt-3 border-t border-[var(--border-hairline)]/70">
                        <button
                          type="button"
                          onClick={() => handlePlayWithReciter(reciter, primaryMoshaf)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent-btn-bg)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-btn-hover)] transition-colors min-h-[42px] whitespace-nowrap"
                        >
                          <Play className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span className="truncate">استماع ل{currentSurah.name}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            audio.selectReciter(reciter, primaryMoshaf);
                            onGoToReader();
                          }}
                          aria-label={`اعتماد ${reciter.name} والعودة للمصحف`}
                          className={`inline-flex items-center justify-center gap-1 rounded-xl border px-3 py-2 text-xs font-medium transition-colors min-h-[42px] whitespace-nowrap ${
                            isActiveReciter
                              ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--bg-surface)]'
                              : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]'
                          }`}
                        >
                          {isActiveReciter && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
                          <span>{isActiveReciter ? 'مُختار' : 'اختيار'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredReciters.length > visibleCount && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((prev) => prev + 48)}
                    className="rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-6 py-2.5 text-sm font-semibold text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors min-h-[44px]"
                  >
                    عرض المزيد من القراء ({toArabicDigits(filteredReciters.length - visibleCount)} متبقٍ)
                  </button>
                </div>
              )}
            </>
          )}
        </>
      ) : (
        /* Ayah-by-Ayah Synchronized Reciters */
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-secondary)]">
            يدعم هؤلاء القراء التلاوة المتزامنة آية بآية مع التظليل التلقائي والتكرار للحفظ والمراجعة داخل صفحة المصحف.
          </p>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {AYAH_RECITERS.map((ayahReciter) => {
              const isSelected = audio.selectedAyahReciter.id === ayahReciter.id;
              return (
                <div
                  key={ayahReciter.id}
                  className={`flex flex-col justify-between rounded-2xl border p-4 transition-colors ${
                    isSelected
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-soft)]/50'
                      : 'border-[var(--border-hairline)] bg-[var(--bg-surface)]'
                  }`}
                >
                  <div>
                    <h2 className="text-base font-bold text-[var(--text-primary)]">{ayahReciter.name}</h2>
                    <p className="mt-1 text-xs text-[var(--text-muted)]">
                      {ayahReciter.style} · تلاوة متزامنة لكل آية
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 pt-3 border-t border-[var(--border-hairline)]/70">
                    <button
                      type="button"
                      onClick={() => {
                        audio.playAyah(currentSurahNumber, 1, ayahReciter);
                        onGoToReader();
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[var(--accent-btn-bg)] px-3 py-2 text-xs font-semibold text-white hover:bg-[var(--accent-btn-hover)] min-h-[42px]"
                    >
                      <Play className="h-3.5 w-3.5" aria-hidden="true" />
                      <span>بدء تلاوة {currentSurah.name}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => audio.selectAyahReciter(ayahReciter)}
                      className={`rounded-xl border px-3 py-2 text-xs font-medium min-h-[42px] ${
                        isSelected
                          ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] bg-[var(--bg-surface)]'
                          : 'border-[var(--border-hairline)] text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                      }`}
                    >
                      {isSelected ? 'مُختار' : 'اختيار'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
