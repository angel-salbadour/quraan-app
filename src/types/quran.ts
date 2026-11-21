export type RevelationType = 'Meccan' | 'Medinan';

export interface SurahMeta {
  number: number;
  name: string;           // e.g., 'سُورَةُ ٱلْفَاتِحَةِ'
  shortName: string;      // e.g., 'الفاتحة'
  englishName: string;    // e.g., 'Al-Fatihah'
  ayahCount: number;
  revelationType: RevelationType;
  startJuz: number;
  startPage: number;
}

export interface JuzMeta {
  number: number;
  name: string;
  surahNumber: number;
  ayahNumber: number;
}

export interface Ayah {
  number: number;         // Global ayah number (1..6236)
  numberInSurah: number;  // 1..N
  text: string;           // Uthmani script
  tafsir?: string;        // Tafsir Al-Muyassar
  juz: number;
  page: number;
  sajda?: boolean;
}

export interface SurahContent {
  surahNumber: number;
  ayahs: Ayah[];
  source: 'api' | 'cache' | 'bundled';
}

export interface ReciterMoshaf {
  id: number;
  name: string;           // e.g. 'حفص عن عاصم - مرتل'
  server: string;         // e.g. 'https://server8.mp3quran.net/afs/'
  surahTotal: number;
  surahList: number[];
}

export interface Reciter {
  id: string;
  name: string;
  letter?: string;
  moshafs: ReciterMoshaf[];
  featured?: boolean;
  country?: string;
}

export interface AyahReciter {
  id: string;             // islamic.network edition id, e.g. 'ar.alafasy'
  name: string;
  style: string;
  bitrate: number;
}

export interface Bookmark {
  id: string;             // `${surahNumber}:${ayahNumber}`
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  ayahPreview: string;
  createdAt: number;
}

export interface LastReadPosition {
  surahNumber: number;
  ayahNumber: number;
  updatedAt: number;
}

export interface VerseSearchResult {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  text: string;
}

export type ReadingTheme = 'light' | 'sepia' | 'dark';
export type ReadingMode = 'mushaf' | 'ayah';
export type TafsirFontSize = 'sm' | 'md' | 'lg';
export type ActiveTranslationLanguage = 'en' | 'fr' | 'es';
export type TranslationLanguage = 'none' | ActiveTranslationLanguage;
export type AppTab = 'reader' | 'surahs' | 'reciters' | 'search' | 'bookmarks';
export type PlaybackMode = 'surah' | 'ayah';
export type RepeatMode = 'off' | 'one' | 'all';
