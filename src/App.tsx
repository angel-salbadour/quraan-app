import { useCallback, useEffect, useMemo, useState } from 'react';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { BookmarksView } from './components/BookmarksView';
import { Header } from './components/Header';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MushafReader } from './components/MushafReader';
import { OfflineBanner } from './components/OfflineBanner';
import { PWAInstallModal } from './components/PWAInstallModal';
import { QuranSearch } from './components/QuranSearch';
import { RecitersDirectory } from './components/RecitersDirectory';
import { SurahIndex } from './components/SurahIndex';
import { BUNDLED_SURAHS, BUNDLED_TRANSLATIONS } from './data/fallbackSurahs';
import { FEATURED_RECITERS } from './data/reciters';
import { SURAHS } from './data/surahs';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { usePWAInstall } from './hooks/usePWAInstall';
import { fetchAllReciters, fetchSurahContent, fetchSurahTranslation } from './services/quranApi';
import type {
  AppTab,
  Ayah,
  Bookmark,
  LastReadPosition,
  ReadingMode,
  ReadingTheme,
  Reciter,
  SurahMeta,
  TafsirFontSize,
  TranslationLanguage,
} from './types/quran';

const STORAGE_KEYS = {
  theme: 'mushaf_theme_v1',
  mode: 'mushaf_reading_mode_v1',
  fontSize: 'mushaf_font_size_v1',
  showTafsir: 'mushaf_show_tafsir_v1',
  tafsirFontSize: 'mushaf_tafsir_font_size_v1',
  translationLang: 'mushaf_translation_lang_v1',
  bookmarks: 'mushaf_bookmarks_v1',
  lastRead: 'mushaf_last_read_v1',
  completedSurahs: 'mushaf_completed_surahs_v1',
  favoriteReciters: 'mushaf_favorite_reciters_v1',
};

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('reader');
  const [theme, setTheme] = useState<ReadingTheme>(() =>
    readStorage<ReadingTheme>(STORAGE_KEYS.theme, 'light')
  );
  const [readingMode, setReadingMode] = useState<ReadingMode>(() =>
    readStorage<ReadingMode>(STORAGE_KEYS.mode, 'mushaf')
  );
  const [fontSize, setFontSize] = useState<number>(() =>
    readStorage<number>(STORAGE_KEYS.fontSize, 30)
  );
  const [showTafsir, setShowTafsir] = useState<boolean>(() =>
    readStorage<boolean>(STORAGE_KEYS.showTafsir, true)
  );
  const [tafsirFontSize, setTafsirFontSize] = useState<TafsirFontSize>(() =>
    readStorage<TafsirFontSize>(STORAGE_KEYS.tafsirFontSize, 'md')
  );
  const [translationLang, setTranslationLang] = useState<TranslationLanguage>(() =>
    readStorage<TranslationLanguage>(STORAGE_KEYS.translationLang, 'none')
  );

  const [lastRead, setLastRead] = useState<LastReadPosition | null>(() =>
    readStorage<LastReadPosition | null>(STORAGE_KEYS.lastRead, {
      surahNumber: 1,
      ayahNumber: 1,
      updatedAt: Date.now(),
    })
  );
  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(
    () => lastRead?.surahNumber ?? 1
  );
  const [highlightedAyah, setHighlightedAyah] = useState<number | null>(null);

  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() =>
    readStorage<Bookmark[]>(STORAGE_KEYS.bookmarks, [])
  );
  const [completedSurahs, setCompletedSurahs] = useState<number[]>(() =>
    readStorage<number[]>(STORAGE_KEYS.completedSurahs, [])
  );
  const [favoriteReciterIds, setFavoriteReciterIds] = useState<string[]>(() =>
    readStorage<string[]>(STORAGE_KEYS.favoriteReciters, ['featured-afs', 'featured-husr'])
  );

  // Surah ayahs state (initialized immediately from bundled data if available for zero-flash first paint)
  const [ayahs, setAyahs] = useState<Ayah[]>(() => BUNDLED_SURAHS[currentSurahNumber] ?? []);
  const [isSurahLoading, setIsSurahLoading] = useState<boolean>(
    () => !BUNDLED_SURAHS[currentSurahNumber]
  );
  const [surahError, setSurahError] = useState<string | null>(null);
  const [surahReloadToken, setSurahReloadToken] = useState(0);

  // Surah translation state (English / French / Spanish)
  const [translations, setTranslations] = useState<Record<number, string>>(() =>
    translationLang !== 'none'
      ? (BUNDLED_TRANSLATIONS[currentSurahNumber]?.[translationLang] ?? {})
      : {}
  );
  const [isTranslationLoading, setIsTranslationLoading] = useState<boolean>(false);
  const [translationError, setTranslationError] = useState<string | null>(null);
  const [translationReloadToken, setTranslationReloadToken] = useState(0);

  // Reciters directory state
  const [reciters, setReciters] = useState<Reciter[]>(FEATURED_RECITERS);
  const [isLoadingReciters, setIsLoadingReciters] = useState(true);

  // PWA Install modal state
  const pwa = usePWAInstall();
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const handleAudioSurahAdvance = useCallback((nextSurahNum: number) => {
    setCurrentSurahNumber(nextSurahNum);
    setHighlightedAyah(null);
  }, []);

  const audio = useAudioPlayer(handleAudioSurahAdvance);

  const currentSurah: SurahMeta = useMemo(
    () => SURAHS.find((s) => s.number === currentSurahNumber) ?? SURAHS[0],
    [currentSurahNumber]
  );

  // Sync theme classes on <html> and theme-color meta tag
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'theme-sepia');
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'sepia') {
      root.classList.add('theme-sepia');
    }

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
      themeColorMeta.setAttribute(
        'content',
        theme === 'dark' ? '#0E141E' : theme === 'sepia' ? '#F4ECD9' : '#1E4068'
      );
    }
    writeStorage(STORAGE_KEYS.theme, theme);
  }, [theme]);

  // Persist user preferences & data
  useEffect(() => writeStorage(STORAGE_KEYS.mode, readingMode), [readingMode]);
  useEffect(() => writeStorage(STORAGE_KEYS.fontSize, fontSize), [fontSize]);
  useEffect(() => writeStorage(STORAGE_KEYS.showTafsir, showTafsir), [showTafsir]);
  useEffect(() => writeStorage(STORAGE_KEYS.tafsirFontSize, tafsirFontSize), [tafsirFontSize]);
  useEffect(() => writeStorage(STORAGE_KEYS.translationLang, translationLang), [translationLang]);
  useEffect(() => writeStorage(STORAGE_KEYS.bookmarks, bookmarks), [bookmarks]);
  useEffect(() => writeStorage(STORAGE_KEYS.completedSurahs, completedSurahs), [completedSurahs]);
  useEffect(() => writeStorage(STORAGE_KEYS.favoriteReciters, favoriteReciterIds), [favoriteReciterIds]);
  useEffect(() => {
    if (lastRead) writeStorage(STORAGE_KEYS.lastRead, lastRead);
  }, [lastRead]);

  // Load current Surah content
  useEffect(() => {
    const controller = new AbortController();
    const bundled = BUNDLED_SURAHS[currentSurahNumber];
    if (bundled) {
      setAyahs(bundled);
      setIsSurahLoading(false);
      setSurahError(null);
    } else {
      setIsSurahLoading(true);
      setSurahError(null);
    }

    fetchSurahContent(currentSurahNumber, controller.signal)
      .then((content) => {
        if (!controller.signal.aborted) {
          setAyahs(content.ayahs);
          setIsSurahLoading(false);
          setSurahError(null);
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (!bundled) {
          setSurahError(
            err instanceof Error ? err.message : 'تعذر تحميل السورة حاليًا. يرجى إعادة المحاولة.'
          );
          setIsSurahLoading(false);
        }
      });

    return () => controller.abort();
  }, [currentSurahNumber, surahReloadToken]);

  // Load current Surah translation when EN / FR / ES is selected
  useEffect(() => {
    if (translationLang === 'none') {
      setTranslations({});
      setIsTranslationLoading(false);
      setTranslationError(null);
      return;
    }

    const controller = new AbortController();
    const bundled = BUNDLED_TRANSLATIONS[currentSurahNumber]?.[translationLang];
    if (bundled) {
      setTranslations(bundled);
      setIsTranslationLoading(false);
      setTranslationError(null);
    } else {
      setTranslations({});
      setIsTranslationLoading(true);
      setTranslationError(null);
    }

    fetchSurahTranslation(currentSurahNumber, translationLang, controller.signal)
      .then((map) => {
        if (!controller.signal.aborted) {
          setTranslations(map);
          setIsTranslationLoading(false);
          setTranslationError(null);
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return;
        if (!bundled) {
          setTranslationError(
            err instanceof Error ? err.message : 'تعذر تحميل الترجمة حاليًا.'
          );
          setIsTranslationLoading(false);
        }
      });

    return () => controller.abort();
  }, [currentSurahNumber, translationLang, translationReloadToken]);

  // Load full 200+ reciters catalog in background
  useEffect(() => {
    const controller = new AbortController();
    fetchAllReciters(controller.signal)
      .then((list) => {
        if (!controller.signal.aborted && list.length > 0) {
          setReciters(list);
          setIsLoadingReciters(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setIsLoadingReciters(false);
        }
      });

    return () => controller.abort();
  }, []);

  const openSurahAyah = useCallback((surahNumber: number, ayahNumber?: number) => {
    setCurrentSurahNumber(surahNumber);
    setHighlightedAyah(ayahNumber ?? null);
    setLastRead({
      surahNumber,
      ayahNumber: ayahNumber ?? 1,
      updatedAt: Date.now(),
    });
    setActiveTab('reader');
    if (!ayahNumber) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleToggleBookmark = useCallback((surah: SurahMeta, ayah: Ayah) => {
    const id = `${surah.number}:${ayah.numberInSurah}`;
    setBookmarks((prev) => {
      const exists = prev.some((b) => b.id === id);
      if (exists) {
        return prev.filter((b) => b.id !== id);
      }
      const next: Bookmark = {
        id,
        surahNumber: surah.number,
        ayahNumber: ayah.numberInSurah,
        surahName: surah.shortName,
        ayahPreview: ayah.text.length > 130 ? `${ayah.text.slice(0, 130)}…` : ayah.text,
        createdAt: Date.now(),
      };
      return [next, ...prev];
    });
  }, []);

  const handleRemoveBookmark = useCallback((id: string) => {
    setBookmarks((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleToggleSurahCompleted = useCallback((surahNumber: number) => {
    setCompletedSurahs((prev) =>
      prev.includes(surahNumber)
        ? prev.filter((n) => n !== surahNumber)
        : [...prev, surahNumber]
    );
  }, []);

  const handleToggleFavoriteReciter = useCallback((reciterId: string) => {
    setFavoriteReciterIds((prev) =>
      prev.includes(reciterId) ? prev.filter((id) => id !== reciterId) : [reciterId, ...prev]
    );
  }, []);

  const handleCycleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'light' ? 'sepia' : prev === 'sepia' ? 'dark' : 'light'));
  }, []);

  const handlePlaySurahFromIndex = useCallback(
    (surahNum: number) => {
      if (audio.isPlaying && audio.mode === 'surah' && audio.surahNumber === surahNum) {
        audio.togglePlayPause();
      } else {
        setCurrentSurahNumber(surahNum);
        audio.playSurah(surahNum);
      }
    },
    [audio]
  );

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-canvas)] text-[var(--text-primary)]">
      {/* 3-Zone Top Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isPWAInstalled={pwa.isInstalled}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        theme={theme}
        onCycleTheme={handleCycleTheme}
      />

      {/* Offline Connectivity Notice */}
      <OfflineBanner />

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        {activeTab === 'reader' && (
          <div className="mx-auto flex w-full max-w-[1440px] items-start">
            {/* Persistent Desktop Sidebar Index (320px right column in RTL) */}
            <aside className="hidden lg:block w-[320px] shrink-0" aria-label="فهرس السور والأجزاء">
              <SurahIndex
                currentSurahNumber={currentSurahNumber}
                playingSurahNumber={audio.hasStarted ? audio.surahNumber : null}
                isAudioPlaying={audio.isPlaying}
                completedSurahs={completedSurahs}
                onSelectSurah={openSurahAyah}
                onPlaySurah={handlePlaySurahFromIndex}
              />
            </aside>

            {/* Primary Mushaf Reading Surface */}
            <div className="min-w-0 flex-1">
              <MushafReader
                surah={currentSurah}
                ayahs={ayahs}
                isLoading={isSurahLoading}
                error={surahError}
                onRetry={() => setSurahReloadToken((n) => n + 1)}
                readingMode={readingMode}
                onChangeReadingMode={setReadingMode}
                theme={theme}
                onChangeTheme={setTheme}
                fontSize={fontSize}
                onChangeFontSize={setFontSize}
                showTafsir={showTafsir}
                onChangeShowTafsir={setShowTafsir}
                tafsirFontSize={tafsirFontSize}
                onChangeTafsirFontSize={setTafsirFontSize}
                translationLang={translationLang}
                onChangeTranslationLang={setTranslationLang}
                translations={translations}
                isTranslationLoading={isTranslationLoading}
                translationError={translationError}
                onRetryTranslation={() => setTranslationReloadToken((n) => n + 1)}
                highlightedAyah={highlightedAyah}
                bookmarks={bookmarks}
                onToggleBookmark={handleToggleBookmark}
                isSurahCompleted={completedSurahs.includes(currentSurahNumber)}
                onToggleSurahCompleted={handleToggleSurahCompleted}
                onNavigateSurah={(num) => openSurahAyah(num)}
                onOpenReciters={() => setActiveTab('reciters')}
                audio={audio}
              />
            </div>
          </div>
        )}

        {activeTab === 'surahs' && (
          <SurahIndex
            currentSurahNumber={currentSurahNumber}
            playingSurahNumber={audio.hasStarted ? audio.surahNumber : null}
            isAudioPlaying={audio.isPlaying}
            completedSurahs={completedSurahs}
            onSelectSurah={openSurahAyah}
            onPlaySurah={handlePlaySurahFromIndex}
            isFullPage
          />
        )}

        {activeTab === 'reciters' && (
          <RecitersDirectory
            reciters={reciters}
            isLoadingReciters={isLoadingReciters}
            favoriteReciterIds={favoriteReciterIds}
            onToggleFavoriteReciter={handleToggleFavoriteReciter}
            currentSurahNumber={currentSurahNumber}
            audio={audio}
            onGoToReader={() => setActiveTab('reader')}
          />
        )}

        {activeTab === 'search' && <QuranSearch onOpenSurahAyah={openSurahAyah} />}

        {activeTab === 'bookmarks' && (
          <BookmarksView
            bookmarks={bookmarks}
            lastRead={lastRead}
            completedSurahs={completedSurahs}
            favoriteReciterIds={favoriteReciterIds}
            reciters={reciters}
            onOpenSurahAyah={openSurahAyah}
            onRemoveBookmark={handleRemoveBookmark}
            onResetKhatmah={() => setCompletedSurahs([])}
            onPlayWithReciter={(reciter) => {
              audio.playSurah(currentSurahNumber, reciter, reciter.moshafs[0]);
            }}
          />
        )}
      </main>

      {/* Persistent Audio Player Bar & Mobile Bottom Sheet */}
      <AudioPlayerBar audio={audio} onOpenReciters={() => setActiveTab('reciters')} />

      {/* Native-Style Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        bookmarksCount={bookmarks.length}
      />

      {/* Android & iPhone PWA Install Modal */}
      <PWAInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        isInstallable={pwa.isInstallable}
        isInstalled={pwa.isInstalled}
        isIOS={pwa.isIOS}
        onTriggerNativeInstall={pwa.install}
      />
    </div>
  );
}
