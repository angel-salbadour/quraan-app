import React, { useMemo } from 'react';
import { ArrowUpLeft, Bookmark, BookOpen, Heart, Play, RotateCcw, Trash2 } from 'lucide-react';
import { SURAHS } from '../data/surahs';
import type { Bookmark as BookmarkType, LastReadPosition, Reciter } from '../types/quran';
import { calculateKhatmahProgress, toArabicDigits } from '../utils/quranHelpers';

interface BookmarksViewProps {
  bookmarks: BookmarkType[];
  lastRead: LastReadPosition | null;
  completedSurahs: number[];
  favoriteReciterIds: string[];
  reciters: Reciter[];
  onOpenSurahAyah: (surahNumber: number, ayahNumber?: number) => void;
  onRemoveBookmark: (id: string) => void;
  onResetKhatmah: () => void;
  onPlayWithReciter: (reciter: Reciter) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  lastRead,
  completedSurahs,
  favoriteReciterIds,
  reciters,
  onOpenSurahAyah,
  onRemoveBookmark,
  onResetKhatmah,
  onPlayWithReciter,
}) => {
  const khatmah = useMemo(() => calculateKhatmahProgress(completedSurahs), [completedSurahs]);

  const lastReadSurah = useMemo(
    () => (lastRead ? SURAHS.find((s) => s.number === lastRead.surahNumber) : null),
    [lastRead]
  );

  const favoriteReciters = useMemo(() => {
    const idSet = new Set(favoriteReciterIds);
    return reciters.filter((r) => idSet.has(r.id));
  }, [favoriteReciterIds, reciters]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 md:px-8 pb-36 md:pb-32 space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--text-primary)]">
          المحفوظات ومتابعة الختمة
        </h1>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
          يتم حفظ علاماتك المرجعية وتقدم الختمة وقرائك المفضلين محليًا على جهازك دون الحاجة لتسجيل دخول.
        </p>
      </div>

      {/* Top Row: Last Read + Khatmah Progress */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 items-stretch">
        {/* Last Read Card */}
        <section className="flex flex-col justify-between rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
          <div>
            <p className="text-xs font-semibold text-[var(--text-muted)]">آخر موضع قراءة</p>
            {lastReadSurah && lastRead ? (
              <>
                <h2 className="mt-2 font-quran text-2xl font-bold text-[var(--text-primary)]">
                  {lastReadSurah.name}
                </h2>
                <p className="mt-1 text-xs text-[var(--text-secondary)] tabular-nums">
                  الآية {toArabicDigits(lastRead.ayahNumber)} · الجزء {toArabicDigits(lastReadSurah.startJuz)} · الصفحة{' '}
                  {toArabicDigits(lastReadSurah.startPage)}
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                ابدأ قراءة سورة الفاتحة ليُحفظ موضعك تلقائيًا.
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onOpenSurahAyah(lastRead?.surahNumber ?? 1, lastRead?.ayahNumber ?? 1)}
            className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--accent-btn-bg)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--accent-btn-hover)] transition-colors min-h-[44px]"
          >
            <BookOpen className="h-4 w-4" aria-hidden="true" />
            <span>متابعة القراءة</span>
          </button>
        </section>

        {/* Khatmah Progress Card */}
        <section className="flex flex-col justify-between rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-[var(--text-muted)]">تقدم الختمة</p>
              {khatmah.completedSurahs > 0 && (
                <button
                  type="button"
                  onClick={onResetKhatmah}
                  className="inline-flex items-center gap-1 text-xs font-medium text-[var(--text-muted)] hover:text-[var(--text-primary)] min-h-[32px]"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>ختمة جديدة</span>
                </button>
              )}
            </div>

            <div className="mt-2 flex items-baseline gap-2 tabular-nums">
              <span className="text-3xl font-bold text-[var(--accent-primary)]">
                {toArabicDigits(khatmah.percentage)}٪
              </span>
              <span className="text-xs text-[var(--text-secondary)]">
                {toArabicDigits(khatmah.completedSurahs)} من {toArabicDigits(114)} سورة ·{' '}
                {toArabicDigits(khatmah.completedAyahs)} آية
              </span>
            </div>

            <div
              className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)]"
              role="progressbar"
              aria-valuenow={khatmah.percentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="نسبة إنجاز الختمة"
            >
              <div
                className="h-full rounded-full bg-[var(--accent-primary)] transition-all duration-300"
                style={{ width: `${Math.min(100, khatmah.percentage)}%` }}
              />
            </div>
          </div>

          <p className="mt-4 text-xs text-[var(--text-muted)]">
            يمكنك تحديد أي سورة كمقروءة من أسفل صفحة السورة في المصحف.
          </p>
        </section>
      </div>

      {/* Saved Ayah Bookmarks */}
      <section>
        <h2 className="mb-3 text-base font-bold text-[var(--text-primary)] tabular-nums">
          الآيات المحفوظة ({toArabicDigits(bookmarks.length)})
        </h2>

        {bookmarks.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] py-10 px-6 text-center">
            <Bookmark className="mx-auto h-7 w-7 text-[var(--text-muted)] mb-2" aria-hidden="true" />
            <p className="text-sm font-semibold text-[var(--text-primary)]">لا توجد آيات محفوظة حاليًا</p>
            <p className="mt-1 text-xs text-[var(--text-muted)]">
              اضغط على أي آية أثناء القراءة ثم اختر «حفظ» للرجوع إليها سريعًا في أي وقت.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-hairline)] rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
            {bookmarks.map((bm) => (
              <div key={bm.id} className="flex items-start justify-between gap-3 p-4 md:p-5">
                <button
                  type="button"
                  onClick={() => onOpenSurahAyah(bm.surahNumber, bm.ayahNumber)}
                  className="flex-1 text-right min-w-0 group"
                >
                  <p className="font-quran text-xl leading-relaxed text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                    {bm.ayahPreview}
                  </p>
                  <p className="mt-1.5 text-xs font-medium text-[var(--text-muted)] tabular-nums">
                    سورة {bm.surahName} · الآية {toArabicDigits(bm.ayahNumber)}
                  </p>
                </button>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenSurahAyah(bm.surahNumber, bm.ayahNumber)}
                    aria-label={`الانتقال إلى سورة ${bm.surahName} الآية ${bm.ayahNumber}`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--accent-primary)]"
                  >
                    <ArrowUpLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveBookmark(bm.id)}
                    aria-label={`حذف علامة سورة ${bm.surahName} الآية ${bm.ayahNumber}`}
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Favorite Reciters */}
      <section>
        <h2 className="mb-3 text-base font-bold text-[var(--text-primary)] tabular-nums">
          القراء المفضلون ({toArabicDigits(favoriteReciters.length)})
        </h2>

        {favoriteReciters.length === 0 ? (
          <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] py-8 px-6 text-center">
            <Heart className="mx-auto h-6 w-6 text-[var(--text-muted)] mb-2" aria-hidden="true" />
            <p className="text-sm text-[var(--text-secondary)]">
              أضف قراءك المفضلين من قسم «القراء» للوصول السريع إلى تلاواتهم.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favoriteReciters.map((reciter) => (
              <div
                key={reciter.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-[var(--text-primary)] truncate">{reciter.name}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{reciter.moshafs[0]?.name}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onPlayWithReciter(reciter)}
                  aria-label={`تشغيل بصوت ${reciter.name}`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-btn-bg)] text-white hover:bg-[var(--accent-btn-hover)]"
                >
                  <Play className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
