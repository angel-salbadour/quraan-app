import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  BookText,
  Bookmark,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Copy,
  Headphones,
  Languages,
  ListOrdered,
  Minus,
  Moon,
  Pause,
  Play,
  Plus,
  RefreshCw,
  ScrollText,
  SlidersHorizontal,
  Sun,
  Volume2,
  X,
} from 'lucide-react';
import { SURAHS } from '../data/surahs';
import type { AudioPlayerController } from '../hooks/useAudioPlayer';
import { TRANSLATION_EDITIONS } from '../services/quranApi';
import type {
  Ayah,
  Bookmark as BookmarkType,
  ReadingMode,
  ReadingTheme,
  SurahMeta,
  TafsirFontSize,
  TranslationLanguage,
} from '../types/quran';
import { formatAyahCount, toArabicDigits } from '../utils/quranHelpers';

interface MushafReaderProps {
  surah: SurahMeta;
  ayahs: Ayah[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  readingMode: ReadingMode;
  onChangeReadingMode: (mode: ReadingMode) => void;
  theme: ReadingTheme;
  onChangeTheme: (theme: ReadingTheme) => void;
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  showTafsir: boolean;
  onChangeShowTafsir: (show: boolean) => void;
  tafsirFontSize: TafsirFontSize;
  onChangeTafsirFontSize: (size: TafsirFontSize) => void;
  translationLang: TranslationLanguage;
  onChangeTranslationLang: (lang: TranslationLanguage) => void;
  translations: Record<number, string>;
  isTranslationLoading: boolean;
  translationError: string | null;
  onRetryTranslation: () => void;
  highlightedAyah: number | null;
  bookmarks: BookmarkType[];
  onToggleBookmark: (surah: SurahMeta, ayah: Ayah) => void;
  isSurahCompleted: boolean;
  onToggleSurahCompleted: (surahNumber: number) => void;
  onNavigateSurah: (surahNumber: number) => void;
  onOpenReciters: () => void;
  audio: AudioPlayerController;
}

const TAFSIR_SIZE_CLASSES: Record<TafsirFontSize, string> = {
  sm: 'text-[13px] leading-relaxed',
  md: 'text-sm md:text-[15px] leading-relaxed',
  lg: 'text-base md:text-[17px] leading-loose',
};

const TAFSIR_SIZE_OPTIONS: Array<{ value: TafsirFontSize; label: string }> = [
  { value: 'sm', label: 'صغير' },
  { value: 'md', label: 'متوسط' },
  { value: 'lg', label: 'كبير' },
];

const TRANSLATION_OPTIONS: Array<{
  value: TranslationLanguage;
  label: string;
  sublabel?: string;
}> = [
  { value: 'none', label: 'بدون ترجمة' },
  { value: 'en', label: 'الإنجليزية', sublabel: 'English' },
  { value: 'fr', label: 'الفرنسية', sublabel: 'Français' },
  { value: 'es', label: 'الإسبانية', sublabel: 'Español' },
];

export const MushafReader: React.FC<MushafReaderProps> = ({
  surah,
  ayahs,
  isLoading,
  error,
  onRetry,
  readingMode,
  onChangeReadingMode,
  theme,
  onChangeTheme,
  fontSize,
  onChangeFontSize,
  showTafsir,
  onChangeShowTafsir,
  tafsirFontSize,
  onChangeTafsirFontSize,
  translationLang,
  onChangeTranslationLang,
  translations,
  isTranslationLoading,
  translationError,
  onRetryTranslation,
  highlightedAyah,
  bookmarks,
  onToggleBookmark,
  isSurahCompleted,
  onToggleSurahCompleted,
  onNavigateSurah,
  onOpenReciters,
  audio,
}) => {
  const [selectedMushafAyah, setSelectedMushafAyah] = useState<Ayah | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copiedAyahId, setCopiedAyahId] = useState<number | null>(null);

  const bookmarkIds = new Set(bookmarks.map((b) => b.id));
  const isPlayingThisSurahFull =
    audio.isPlaying && audio.mode === 'surah' && audio.surahNumber === surah.number;
  const activePlayingAyah =
    audio.mode === 'ayah' && audio.surahNumber === surah.number ? audio.activeAyahNumber : null;

  const activeTranslationEdition =
    translationLang !== 'none' ? TRANSLATION_EDITIONS[translationLang] : null;
  const hasPerAyahAnnotations = showTafsir || translationLang !== 'none';

  // Reset selected verse bar when changing Surah
  useEffect(() => {
    setSelectedMushafAyah(null);
  }, [surah.number]);

  // Smooth scroll to active playing ayah or searched ayah
  useEffect(() => {
    const target = activePlayingAyah ?? highlightedAyah;
    if (!target || ayahs.length === 0) return;
    const el = document.getElementById(`ayah-${surah.number}-${target}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activePlayingAyah, highlightedAyah, surah.number, ayahs.length]);

  const handleCopyAyah = async (ayah: Ayah) => {
    const transText = translationLang !== 'none' ? translations[ayah.numberInSurah] : undefined;
    const formatted = transText
      ? `${ayah.text} ﴿${toArabicDigits(ayah.numberInSurah)}﴾ — ${surah.name}\n${transText}`
      : `${ayah.text} ﴿${toArabicDigits(ayah.numberInSurah)}﴾ — ${surah.name}`;
    try {
      await navigator.clipboard.writeText(formatted);
      setCopiedAyahId(ayah.numberInSurah);
      window.setTimeout(() => setCopiedAyahId(null), 1800);
    } catch {
      // Clipboard fallback ignored silently
    }
  };

  const prevSurah = surah.number > 1 ? SURAHS[surah.number - 2] : null;
  const nextSurah = surah.number < 114 ? SURAHS[surah.number] : null;
  const tafsirTextClass = TAFSIR_SIZE_CLASSES[tafsirFontSize];

  const renderTranslationBlock = (ayahNumberInSurah: number) => {
    if (!activeTranslationEdition) return null;
    const translatedText = translations[ayahNumberInSurah];
    if (!translatedText) return null;

    return (
      <div
        dir="ltr"
        lang={activeTranslationEdition.code}
        className="mt-2.5 border-l-2 border-[var(--accent-primary)]/45 pl-3.5 text-left"
      >
        <p className={`${tafsirTextClass} text-[var(--text-secondary)]`}>
          <span className="font-semibold text-[var(--accent-primary)]">
            {activeTranslationEdition.nativeLabel}:{' '}
          </span>
          {translatedText}
        </p>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-5 md:px-8 md:py-7 pb-36 md:pb-32">
      {/* Compact Reader Toolbar */}
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-[var(--border-hairline)] pb-4">
        {/* Reading Mode Switch */}
        <div
          className="grid grid-cols-2 md:inline-flex items-center gap-1 rounded-xl bg-[var(--bg-subtle)] p-1 w-full md:w-auto"
          role="tablist"
          aria-label="وضع القراءة"
        >
          <button
            type="button"
            role="tab"
            aria-selected={readingMode === 'mushaf'}
            onClick={() => onChangeReadingMode('mushaf')}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap min-h-[38px] ${
              readingMode === 'mushaf'
                ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
            <span>صفحة المصحف</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={readingMode === 'ayah'}
            onClick={() => onChangeReadingMode('ayah')}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap min-h-[38px] ${
              readingMode === 'ayah'
                ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <ListOrdered className="h-3.5 w-3.5" aria-hidden="true" />
            <span>آية بآية</span>
          </button>
        </div>

        {/* Quick Tafsir Toggle, Translation Selector, Reading Settings & Theme Controls */}
        <div className="flex items-center justify-between md:justify-end gap-2 w-full md:w-auto">
          <div className="grid grid-cols-3 md:flex items-center gap-1.5 w-full md:w-auto">
            {/* Quick Tafsir Al-Muyassar Toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={showTafsir}
              aria-label="التفسير الميسر"
              onClick={() => onChangeShowTafsir(!showTafsir)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors min-h-[38px] whitespace-nowrap ${
                showTafsir
                  ? 'border-[var(--accent-primary)]/40 bg-[var(--accent-soft)] text-[var(--accent-primary)]'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <BookText className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>التفسير</span>
            </button>

            {/* Quick Translation Language Selector (EN / FR / ES) */}
            <div
              className={`relative inline-flex items-center justify-center rounded-xl border min-h-[38px] min-w-0 transition-colors ${
                translationLang !== 'none'
                  ? 'border-[var(--accent-primary)]/40 bg-[var(--accent-soft)] text-[var(--accent-primary)]'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-secondary)]'
              }`}
            >
              <Languages
                className="pointer-events-none mr-2 h-3.5 w-3.5 shrink-0"
                aria-hidden="true"
              />
              <select
                aria-label="ترجمة معاني القرآن"
                value={translationLang}
                onChange={(e) => onChangeTranslationLang(e.target.value as TranslationLanguage)}
                className="w-full appearance-none bg-transparent py-1.5 pr-1 pl-2 text-xs font-semibold text-inherit focus:outline-none cursor-pointer min-h-[36px] truncate"
              >
                <option value="none" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                  بدون ترجمة
                </option>
                <option value="en" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                  English
                </option>
                <option value="fr" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                  Français
                </option>
                <option value="es" className="bg-[var(--bg-surface)] text-[var(--text-primary)]">
                  Español
                </option>
              </select>
            </div>

            {/* Reading Settings Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen((prev) => !prev)}
              aria-expanded={isSettingsOpen}
              aria-controls="reading-settings-panel"
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition-colors min-h-[38px] whitespace-nowrap ${
                isSettingsOpen
                  ? 'border-[var(--accent-primary)] bg-[var(--accent-btn-bg)] text-white'
                  : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
              }`}
            >
              <SlidersHorizontal className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span className="sm:hidden">الإعدادات</span>
              <span className="hidden sm:inline">إعدادات القراءة</span>
            </button>
          </div>

          {/* Reading Theme Selector (Desktop quick bar; on mobile also inside Reading Settings) */}
          <div
            className="hidden md:inline-flex items-center gap-1 rounded-xl bg-[var(--bg-subtle)] p-1 shrink-0"
            role="group"
            aria-label="مظهر القراءة"
          >
            <button
              type="button"
              onClick={() => onChangeTheme('light')}
              aria-label="المظهر النهاري"
              aria-pressed={theme === 'light'}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors min-h-[34px] ${
                theme === 'light'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Sun className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden xl:inline">نهاري</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeTheme('sepia')}
              aria-label="المظهر المريح للعين"
              aria-pressed={theme === 'sepia'}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors min-h-[34px] whitespace-nowrap ${
                theme === 'sepia'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <ScrollText className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden xl:inline">مريح للعين</span>
            </button>
            <button
              type="button"
              onClick={() => onChangeTheme('dark')}
              aria-label="المظهر الليلي"
              aria-pressed={theme === 'dark'}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors min-h-[34px] ${
                theme === 'dark'
                  ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-xs'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Moon className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden xl:inline">ليلي</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Reading Settings Panel */}
      {isSettingsOpen && (
        <section
          id="reading-settings-panel"
          aria-label="إعدادات القراءة"
          className="mb-6 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-4 sm:p-5 space-y-4"
        >
          <div className="flex items-center justify-between gap-2 pb-3 border-b border-[var(--border-hairline)]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
              <h2 className="text-sm font-bold text-[var(--text-primary)]">إعدادات القراءة</h2>
            </div>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              aria-label="إغلاق إعدادات القراءة"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-muted)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)]"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Tafsir Al-Muyassar Toggle Row */}
          <div className="flex items-center justify-between gap-4 rounded-xl bg-[var(--bg-canvas)] px-4 py-3 border border-[var(--border-hairline)]">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)]">
                عرض التفسير الميسر أسفل كل آية
              </p>
              <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                إظهار شرح الآيات من التفسير الميسر مباشرة تحت كل آية أثناء القراءة
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs font-semibold text-[var(--text-secondary)]">
                {showTafsir ? 'مفعّل' : 'متوقف'}
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={showTafsir}
                aria-label="تفعيل عرض التفسير الميسر أسفل كل آية"
                onClick={() => onChangeShowTafsir(!showTafsir)}
                className={`flex h-7 w-12 items-center rounded-full p-1 transition-colors ${
                  showTafsir
                    ? 'bg-[var(--accent-btn-bg)] justify-end'
                    : 'bg-[var(--border-hairline)] justify-start'
                }`}
              >
                <span className="h-5 w-5 rounded-full bg-white shadow-xs transition-all" />
              </button>
            </div>
          </div>

          {/* Quran Translation Selector (English, French, Spanish) */}
          <div className="rounded-xl bg-[var(--bg-canvas)] px-4 py-3.5 border border-[var(--border-hairline)] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[var(--text-primary)]">
                  ترجمة معاني القرآن أسفل كل آية
                </p>
                <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                  {activeTranslationEdition
                    ? `المصدر المعتمد: ${activeTranslationEdition.sourceName} (${activeTranslationEdition.arabicLabel})`
                    : 'اختر الإنجليزية أو الفرنسية أو الإسبانية لعرض الترجمة أسفل كل آية'}
                </p>
              </div>
              <Languages className="h-4 w-4 text-[var(--accent-primary)] shrink-0" aria-hidden="true" />
            </div>

            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-1.5"
              role="group"
              aria-label="اختيار لغة ترجمة القرآن"
            >
              {TRANSLATION_OPTIONS.map((opt) => {
                const isSelected = translationLang === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => onChangeTranslationLang(opt.value)}
                    className={`flex flex-col items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold transition-colors min-h-[44px] ${
                      isSelected
                        ? 'border-[var(--accent-btn-bg)] bg-[var(--accent-btn-bg)] text-white'
                        : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                    }`}
                  >
                    <span>{opt.label}</span>
                    {opt.sublabel && (
                      <span
                        className={`text-[11px] font-medium ${
                          isSelected ? 'text-white/85' : 'text-[var(--text-muted)]'
                        }`}
                      >
                        {opt.sublabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Typography Controls Grid */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Mushaf Font Size Stepper */}
            <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 py-3">
              <span className="text-xs font-semibold text-[var(--text-primary)]">حجم خط المصحف</span>
              <div className="inline-flex items-center rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                <button
                  type="button"
                  onClick={() => onChangeFontSize(Math.max(22, fontSize - 2))}
                  disabled={fontSize <= 22}
                  aria-label="تصغير خط المصحف"
                  className="flex h-9 w-9 items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="px-2 text-xs font-semibold text-[var(--text-secondary)] tabular-nums select-none">
                  أ {toArabicDigits(fontSize)}
                </span>
                <button
                  type="button"
                  onClick={() => onChangeFontSize(Math.min(44, fontSize + 2))}
                  disabled={fontSize >= 44}
                  aria-label="تكبير خط المصحف"
                  className="flex h-9 w-9 items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-40"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Tafsir & Translation Font Size Selector */}
            <div
              className={`flex items-center justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 py-3 transition-opacity ${
                hasPerAyahAnnotations ? 'opacity-100' : 'opacity-50'
              }`}
            >
              <span className="text-xs font-semibold text-[var(--text-primary)]">
                حجم خط التفسير والترجمة
              </span>
              <div
                className="inline-flex items-center gap-1 rounded-xl bg-[var(--bg-subtle)] p-1"
                role="group"
                aria-label="حجم خط التفسير والترجمة"
              >
                {TAFSIR_SIZE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    disabled={!hasPerAyahAnnotations}
                    onClick={() => onChangeTafsirFontSize(opt.value)}
                    aria-pressed={tafsirFontSize === opt.value}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors min-h-[32px] disabled:cursor-not-allowed ${
                      tafsirFontSize === opt.value
                        ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Theme Selector inside Reading Settings */}
          <div className="flex md:hidden items-center justify-between gap-3 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 py-3">
            <span className="text-xs font-semibold text-[var(--text-primary)]">مظهر القراءة</span>
            <div className="inline-flex items-center gap-1 rounded-xl bg-[var(--bg-subtle)] p-1">
              <button
                type="button"
                onClick={() => onChangeTheme('light')}
                aria-pressed={theme === 'light'}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold min-h-[32px] ${
                  theme === 'light'
                    ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                نهاري
              </button>
              <button
                type="button"
                onClick={() => onChangeTheme('sepia')}
                aria-pressed={theme === 'sepia'}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold min-h-[32px] ${
                  theme === 'sepia'
                    ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                مريح للعين
              </button>
              <button
                type="button"
                onClick={() => onChangeTheme('dark')}
                aria-pressed={theme === 'dark'}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold min-h-[32px] ${
                  theme === 'dark'
                    ? 'bg-[var(--bg-surface)] text-[var(--accent-primary)] shadow-xs'
                    : 'text-[var(--text-secondary)]'
                }`}
              >
                ليلي
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Classical Surah Header Cartouche */}
      <section
        aria-label={`ترويسة ${surah.name}`}
        className="mb-8 rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-5 md:p-7 text-center"
      >
        <div className="mx-auto flex max-w-xl flex-col items-center">
          {/* Geometric Ornament Line */}
          <div className="mb-3 flex w-full items-center justify-center gap-3 text-[var(--accent-gold)]" aria-hidden="true">
            <span className="h-px flex-1 max-w-[100px] bg-[var(--accent-gold)]/40" />
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
              <path d="M12 2l2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2z" />
            </svg>
            <span className="h-px flex-1 max-w-[100px] bg-[var(--accent-gold)]/40" />
          </div>

          <h1 className="font-quran text-3xl md:text-4xl font-bold text-[var(--text-primary)] leading-tight">
            {surah.name}
          </h1>

          {/* Clean Unboxed Metadata */}
          <p className="mt-2 text-xs md:text-sm text-[var(--text-secondary)] tabular-nums">
            {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
            <span aria-hidden="true"> · </span>
            {formatAyahCount(surah.ayahCount)}
            <span aria-hidden="true"> · </span>
            الجزء {toArabicDigits(surah.startJuz)}
            <span aria-hidden="true"> · </span>
            الصفحة {toArabicDigits(surah.startPage)}
          </p>

          {/* Primary Recitation Actions */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                if (isPlayingThisSurahFull) {
                  audio.togglePlayPause();
                } else {
                  audio.playSurah(surah.number);
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--accent-btn-bg)] px-4 py-2.5 text-xs md:text-sm font-semibold text-white hover:bg-[var(--accent-btn-hover)] transition-colors min-h-[44px] whitespace-nowrap"
            >
              {isPlayingThisSurahFull ? (
                <Pause className="h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <Play className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span>{isPlayingThisSurahFull ? 'إيقاف التلاوة' : 'استماع للسورة كاملة'}</span>
            </button>

            <button
              type="button"
              onClick={() => audio.playAyah(surah.number, 1)}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] px-4 py-2.5 text-xs md:text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors min-h-[44px] whitespace-nowrap"
            >
              <Volume2 className="h-4 w-4 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
              <span>تلاوة آية بآية</span>
            </button>

            <button
              type="button"
              onClick={onOpenReciters}
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--border-hairline)] bg-transparent px-3.5 py-2.5 text-xs md:text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--text-primary)] transition-colors min-h-[44px] whitespace-nowrap"
            >
              <Headphones className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="max-w-[160px] truncate">{audio.selectedReciter.name}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Translation Loading / Error Banner */}
      {activeTranslationEdition && (isTranslationLoading || translationError) && (
        <div
          className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-2.5 text-xs"
          aria-live="polite"
        >
          {isTranslationLoading ? (
            <span className="text-[var(--text-secondary)]">
              جارٍ تحميل الترجمة ({activeTranslationEdition.arabicLabel} — {activeTranslationEdition.sourceName})...
            </span>
          ) : (
            <>
              <span className="text-[var(--text-secondary)]">{translationError}</span>
              <button
                type="button"
                onClick={onRetryTranslation}
                className="inline-flex items-center gap-1 font-semibold text-[var(--accent-primary)] hover:underline"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>إعادة المحاولة</span>
              </button>
            </>
          )}
        </div>
      )}

      {/* Basmala Header (all Surahs except Al-Fatiha #1 where it's Ayah 1, and At-Tawbah #9) */}
      {surah.number !== 1 && surah.number !== 9 && !isLoading && !error && (
        <div className="mb-7 text-center">
          <p
            className="font-quran text-2xl md:text-3xl text-[var(--text-primary)] leading-relaxed"
            aria-label="بسم الله الرحمن الرحيم"
          >
            بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ
          </p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div
          className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-8 text-center space-y-4"
          aria-live="polite"
        >
          <div className="mx-auto h-6 w-48 animate-pulse rounded-lg bg-[var(--bg-subtle)]" />
          <div className="mx-auto h-5 w-full max-w-2xl animate-pulse rounded-lg bg-[var(--bg-subtle)]" />
          <div className="mx-auto h-5 w-11/12 max-w-xl animate-pulse rounded-lg bg-[var(--bg-subtle)]" />
          <div className="mx-auto h-5 w-4/5 max-w-lg animate-pulse rounded-lg bg-[var(--bg-subtle)]" />
          <p className="pt-2 text-xs text-[var(--text-muted)]">جارٍ تحميل آيات {surah.name}...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] p-8 text-center">
          <p className="text-base font-semibold text-[var(--text-primary)]">{error}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--accent-btn-bg)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--accent-btn-hover)] min-h-[44px]"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>إعادة المحاولة</span>
          </button>
        </div>
      )}

      {/* Mushaf Reading Canvas */}
      {!isLoading && !error && ayahs.length > 0 && (
        <>
          {readingMode === 'mushaf' ? (
            <article
              aria-label={`نص ${surah.name}`}
              className="rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-5 py-7 sm:px-8 sm:py-9 md:px-12 md:py-10"
            >
              {hasPerAyahAnnotations ? (
                /* Mushaf Page with Tafsir Al-Muyassar and/or EN/FR/ES Translation directly below each Ayah */
                <div className="divide-y divide-[var(--border-hairline)]/70">
                  {ayahs.map((ayah) => {
                    const isSelected = selectedMushafAyah?.numberInSurah === ayah.numberInSurah;
                    const isActive =
                      activePlayingAyah === ayah.numberInSurah ||
                      highlightedAyah === ayah.numberInSurah ||
                      isSelected;
                    const isBookmarked = bookmarkIds.has(`${surah.number}:${ayah.numberInSurah}`);

                    return (
                      <div
                        key={ayah.numberInSurah}
                        id={`ayah-${surah.number}-${ayah.numberInSurah}`}
                        className={`py-5 first:pt-1 last:pb-1 transition-colors ${
                          isActive ? 'rounded-xl bg-[var(--accent-soft)]/55 px-3 sm:px-4 -mx-3 sm:-mx-4' : ''
                        }`}
                      >
                        <div
                          role="button"
                          tabIndex={0}
                          aria-label={`الآية ${ayah.numberInSurah} من ${surah.name}`}
                          onClick={() =>
                            setSelectedMushafAyah((prev) =>
                              prev?.numberInSurah === ayah.numberInSurah ? null : ayah
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedMushafAyah((prev) =>
                                prev?.numberInSurah === ayah.numberInSurah ? null : ayah
                              );
                            }
                          }}
                          className="cursor-pointer rounded-lg focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)]"
                        >
                          <p
                            className="font-quran text-[var(--text-primary)] leading-loose"
                            style={{ fontSize: `${fontSize}px`, lineHeight: 2.2 }}
                          >
                            {ayah.text}{' '}
                            <span
                              className={`inline-flex items-center justify-center align-middle mx-1 select-none font-quran text-[0.72em] ${
                                isBookmarked
                                  ? 'text-[var(--accent-primary)] font-bold'
                                  : 'text-[var(--accent-gold)]'
                              }`}
                              title={`الآية ${toArabicDigits(ayah.numberInSurah)} — اضغط للخيارات`}
                            >
                              ۝{toArabicDigits(ayah.numberInSurah)}
                            </span>
                          </p>
                        </div>

                        {/* Inline Tafsir Al-Muyassar directly beneath the Ayah */}
                        {showTafsir && ayah.tafsir && (
                          <div className="mt-3 border-r-2 border-[var(--accent-gold)]/55 pr-3.5">
                            <p className={`${tafsirTextClass} text-[var(--text-secondary)]`}>
                              <span className="font-semibold text-[var(--accent-primary)]">
                                التفسير الميسر:{' '}
                              </span>
                              {ayah.tafsir}
                            </p>
                          </div>
                        )}

                        {/* Selected Translation (English / French / Spanish) directly beneath the Ayah */}
                        {renderTranslationBlock(ayah.numberInSurah)}

                        {/* Contextual Quick Actions when tapping the Ayah */}
                        {isSelected && (
                          <div className="mt-3.5 flex flex-wrap items-center gap-1.5 pt-2.5 border-t border-[var(--border-hairline)]/60">
                            <button
                              type="button"
                              onClick={() => audio.playAyah(surah.number, ayah.numberInSurah)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-btn-bg)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--accent-btn-hover)] min-h-[36px]"
                            >
                              <Play className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>استماع للآية</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onToggleBookmark(surah, ayah)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] min-h-[36px]"
                            >
                              <Bookmark
                                className={`h-3.5 w-3.5 ${
                                  isBookmarked
                                    ? 'fill-[var(--accent-gold)] text-[var(--accent-gold)]'
                                    : ''
                                }`}
                                aria-hidden="true"
                              />
                              <span>{isBookmarked ? 'محفوظة' : 'حفظ'}</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyAyah(ayah)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] min-h-[36px]"
                            >
                              {copiedAyahId === ayah.numberInSurah ? (
                                <Check className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
                              ) : (
                                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                              )}
                              <span>{copiedAyahId === ayah.numberInSurah ? 'تم النسخ' : 'نسخ'}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Classic Continuous Mushaf Script (Tafsir & Translation both hidden) */
                <>
                  <div
                    className="font-quran text-justify text-[var(--text-primary)]"
                    style={{
                      fontSize: `${fontSize}px`,
                      lineHeight: 2.35,
                      textAlignLast: 'center',
                    }}
                  >
                    {ayahs.map((ayah) => {
                      const isActive =
                        activePlayingAyah === ayah.numberInSurah ||
                        highlightedAyah === ayah.numberInSurah ||
                        selectedMushafAyah?.numberInSurah === ayah.numberInSurah;
                      const isBookmarked = bookmarkIds.has(`${surah.number}:${ayah.numberInSurah}`);

                      return (
                        <span
                          key={ayah.numberInSurah}
                          id={`ayah-${surah.number}-${ayah.numberInSurah}`}
                          role="button"
                          tabIndex={0}
                          aria-label={`الآية ${ayah.numberInSurah} من ${surah.name}`}
                          onClick={() =>
                            setSelectedMushafAyah((prev) =>
                              prev?.numberInSurah === ayah.numberInSurah ? null : ayah
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              setSelectedMushafAyah((prev) =>
                                prev?.numberInSurah === ayah.numberInSurah ? null : ayah
                              );
                            }
                          }}
                          className={`inline cursor-pointer rounded-lg px-1 transition-colors focus-visible:outline-2 focus-visible:outline-[var(--accent-primary)] ${
                            isActive
                              ? 'bg-[var(--accent-soft)] text-[var(--text-primary)]'
                              : 'hover:bg-[var(--bg-subtle)]/70'
                          }`}
                        >
                          {ayah.text}{' '}
                          <span
                            className={`inline-flex items-center justify-center align-middle mx-1 select-none font-quran text-[0.72em] ${
                              isBookmarked
                                ? 'text-[var(--accent-primary)] font-bold'
                                : 'text-[var(--accent-gold)]'
                            }`}
                            title={`الآية ${toArabicDigits(ayah.numberInSurah)} — اضغط للخيارات`}
                          >
                            ۝{toArabicDigits(ayah.numberInSurah)}
                          </span>{' '}
                        </span>
                      );
                    })}
                  </div>

                  {/* Selected Ayah Action Bar inside Classic Mushaf Mode */}
                  {selectedMushafAyah && (
                    <div className="mt-8 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-canvas)] p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[var(--border-hairline)]">
                        <span className="text-xs font-semibold text-[var(--accent-primary)] tabular-nums">
                          {surah.name} · الآية {toArabicDigits(selectedMushafAyah.numberInSurah)}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => audio.playAyah(surah.number, selectedMushafAyah.numberInSurah)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--accent-btn-bg)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[var(--accent-btn-hover)] min-h-[36px]"
                          >
                            <Play className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>استماع للآية</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleBookmark(surah, selectedMushafAyah)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] min-h-[36px]"
                          >
                            <Bookmark
                              className={`h-3.5 w-3.5 ${
                                bookmarkIds.has(`${surah.number}:${selectedMushafAyah.numberInSurah}`)
                                  ? 'fill-[var(--accent-gold)] text-[var(--accent-gold)]'
                                  : ''
                              }`}
                              aria-hidden="true"
                            />
                            <span>
                              {bookmarkIds.has(`${surah.number}:${selectedMushafAyah.numberInSurah}`)
                                ? 'محفوظة'
                                : 'حفظ'}
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCopyAyah(selectedMushafAyah)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-3 py-1.5 text-xs font-medium text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] min-h-[36px]"
                          >
                            {copiedAyahId === selectedMushafAyah.numberInSurah ? (
                              <Check className="h-3.5 w-3.5 text-[var(--accent-primary)]" aria-hidden="true" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            )}
                            <span>
                              {copiedAyahId === selectedMushafAyah.numberInSurah ? 'تم النسخ' : 'نسخ'}
                            </span>
                          </button>
                        </div>
                      </div>
                      {selectedMushafAyah.tafsir && (
                        <p className={`mt-3 ${tafsirTextClass} text-[var(--text-secondary)]`}>
                          <span className="font-semibold text-[var(--text-primary)]">التفسير الميسر: </span>
                          {selectedMushafAyah.tafsir}
                        </p>
                      )}
                    </div>
                  )}

                  <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
                    اضغط على أي آية للاستماع أو الحفظ، أو فعّل «التفسير الميسر» أو «الترجمة» من إعدادات القراءة
                  </p>
                </>
              )}
            </article>
          ) : (
            /* Ayah-by-Ayah Mode */
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                <span className="text-xs text-[var(--text-muted)]">
                  التلاوة المتزامنة بصوت:{' '}
                  <strong className="text-[var(--text-primary)]">{audio.selectedAyahReciter.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => onChangeShowTafsir(!showTafsir)}
                  className="text-xs font-semibold text-[var(--accent-primary)] hover:underline min-h-[36px] px-2"
                >
                  {showTafsir ? 'إخفاء التفسير الميسر' : 'إظهار التفسير الميسر'}
                </button>
              </div>

              <div className="divide-y divide-[var(--border-hairline)] rounded-2xl border border-[var(--border-hairline)] bg-[var(--bg-surface)]">
                {ayahs.map((ayah) => {
                  const isPlayingThisAyah =
                    audio.isPlaying && activePlayingAyah === ayah.numberInSurah;
                  const isHighlighted =
                    activePlayingAyah === ayah.numberInSurah ||
                    highlightedAyah === ayah.numberInSurah;
                  const isBookmarked = bookmarkIds.has(`${surah.number}:${ayah.numberInSurah}`);

                  return (
                    <article
                      key={ayah.numberInSurah}
                      id={`ayah-${surah.number}-${ayah.numberInSurah}`}
                      className={`p-5 md:p-7 transition-colors ${
                        isHighlighted ? 'bg-[var(--accent-soft)]/70' : ''
                      }`}
                    >
                      {/* Ayah Top Action Row */}
                      <div className="mb-4 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-[var(--text-muted)] tabular-nums">
                          الآية {toArabicDigits(ayah.numberInSurah)}
                          <span aria-hidden="true"> · </span>
                          ج {toArabicDigits(ayah.juz)}
                          <span aria-hidden="true"> · </span>
                          ص {toArabicDigits(ayah.page)}
                        </span>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              if (isPlayingThisAyah) {
                                audio.togglePlayPause();
                              } else {
                                audio.playAyah(surah.number, ayah.numberInSurah);
                              }
                            }}
                            aria-label={
                              isPlayingThisAyah
                                ? `إيقاف الآية ${ayah.numberInSurah}`
                                : `تشغيل الآية ${ayah.numberInSurah}`
                            }
                            className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
                              isPlayingThisAyah
                                ? 'bg-[var(--accent-btn-bg)] text-white'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] hover:text-[var(--accent-primary)]'
                            }`}
                          >
                            {isPlayingThisAyah ? (
                              <Pause className="h-4 w-4" aria-hidden="true" />
                            ) : (
                              <Play className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => onToggleBookmark(surah, ayah)}
                            aria-label={
                              isBookmarked
                                ? `إزالة الآية ${ayah.numberInSurah} من المحفوظات`
                                : `حفظ الآية ${ayah.numberInSurah}`
                            }
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
                          >
                            <Bookmark
                              className={`h-4 w-4 ${
                                isBookmarked ? 'fill-[var(--accent-gold)] text-[var(--accent-gold)]' : ''
                              }`}
                              aria-hidden="true"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyAyah(ayah)}
                            aria-label={`نسخ الآية ${ayah.numberInSurah}`}
                            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)] transition-colors"
                          >
                            {copiedAyahId === ayah.numberInSurah ? (
                              <Check className="h-4 w-4 text-[var(--accent-primary)]" aria-hidden="true" />
                            ) : (
                              <Copy className="h-4 w-4" aria-hidden="true" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Uthmani Verse Text */}
                      <p
                        className="font-quran text-[var(--text-primary)] leading-loose"
                        style={{ fontSize: `${fontSize}px`, lineHeight: 2.15 }}
                      >
                        {ayah.text}{' '}
                        <span className="text-[0.75em] text-[var(--accent-gold)] select-none">
                          ۝{toArabicDigits(ayah.numberInSurah)}
                        </span>
                      </p>

                      {/* Tafsir Al-Muyassar */}
                      {showTafsir && ayah.tafsir && (
                        <div className="mt-4 border-r-2 border-[var(--accent-gold)]/55 pr-3.5 pt-0.5">
                          <p className={`${tafsirTextClass} text-[var(--text-secondary)]`}>
                            <span className="font-semibold text-[var(--accent-primary)]">
                              التفسير الميسر:{' '}
                            </span>
                            {ayah.tafsir}
                          </p>
                        </div>
                      )}

                      {/* Selected Translation (English / French / Spanish) */}
                      {renderTranslationBlock(ayah.numberInSurah)}
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* Surah Footer: Khatmah Toggle + Prev/Next Navigation */}
          <div className="mt-8 space-y-4">
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => onToggleSurahCompleted(surah.number)}
                className={`inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-sm font-semibold transition-colors min-h-[44px] ${
                  isSurahCompleted
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-soft)] text-[var(--accent-primary)]'
                    : 'border-[var(--border-hairline)] bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>
                  {isSurahCompleted ? 'تم إتمام قراءة السورة (مسجلة في الختمة)' : 'تحديد السورة كمقروءة في الختمة'}
                </span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {prevSurah ? (
                <button
                  type="button"
                  onClick={() => onNavigateSurah(prevSurah.number)}
                  className="flex items-center justify-start gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3 text-right hover:bg-[var(--bg-subtle)] transition-colors min-h-[56px]"
                >
                  <ChevronRight className="h-5 w-5 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
                  <div className="min-w-0">
                    <span className="block text-[11px] text-[var(--text-muted)]">السورة السابقة</span>
                    <span className="block font-quran text-base font-bold text-[var(--text-primary)] truncate">
                      {prevSurah.shortName}
                    </span>
                  </div>
                </button>
              ) : (
                <div />
              )}

              {nextSurah ? (
                <button
                  type="button"
                  onClick={() => onNavigateSurah(nextSurah.number)}
                  className="flex items-center justify-end gap-2 rounded-xl border border-[var(--border-hairline)] bg-[var(--bg-surface)] px-4 py-3 text-left hover:bg-[var(--bg-subtle)] transition-colors min-h-[56px]"
                >
                  <div className="min-w-0">
                    <span className="block text-[11px] text-[var(--text-muted)]">السورة التالية</span>
                    <span className="block font-quran text-base font-bold text-[var(--text-primary)] truncate">
                      {nextSurah.shortName}
                    </span>
                  </div>
                  <ChevronLeft className="h-5 w-5 shrink-0 text-[var(--accent-primary)]" aria-hidden="true" />
                </button>
              ) : (
                <div />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
