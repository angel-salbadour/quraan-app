import { BUNDLED_SURAHS, BUNDLED_TRANSLATIONS } from '../data/fallbackSurahs';
import { FEATURED_RECITERS } from '../data/reciters';
import { SURAHS } from '../data/surahs';
import type {
  ActiveTranslationLanguage,
  Ayah,
  Reciter,
  ReciterMoshaf,
  SurahContent,
  VerseSearchResult,
} from '../types/quran';
import { normalizeArabic, stripBasmalaPrefix } from '../utils/quranHelpers';

const SURAH_CACHE_PREFIX = 'mushaf_surah_v1_';
const TRANSLATION_CACHE_PREFIX = 'mushaf_trans_v1_';
const RECITERS_CACHE_KEY = 'mushaf_reciters_v1';
const RECITERS_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

const memorySurahCache = new Map<number, SurahContent>();
const memoryTranslationCache = new Map<string, Record<number, string>>();

export interface TranslationEditionInfo {
  code: ActiveTranslationLanguage;
  editionId: string;
  nativeLabel: string;
  arabicLabel: string;
  shortCode: string;
  sourceName: string;
}

export const TRANSLATION_EDITIONS: Record<ActiveTranslationLanguage, TranslationEditionInfo> = {
  en: {
    code: 'en',
    editionId: 'en.sahih',
    nativeLabel: 'English',
    arabicLabel: 'الإنجليزية',
    shortCode: 'EN',
    sourceName: 'Saheeh International',
  },
  fr: {
    code: 'fr',
    editionId: 'fr.hamidullah',
    nativeLabel: 'Français',
    arabicLabel: 'الفرنسية',
    shortCode: 'FR',
    sourceName: 'Muhammad Hamidullah',
  },
  es: {
    code: 'es',
    editionId: 'es.cortes',
    nativeLabel: 'Español',
    arabicLabel: 'الإسبانية',
    shortCode: 'ES',
    sourceName: 'Julio Cortés',
  },
};

interface AlQuranEditionAyah {
  number: number;
  numberInSurah: number;
  text: string;
  juz: number;
  page: number;
  sajda?: boolean | { id: number };
}

interface AlQuranEditionsResponse {
  code: number;
  data?: Array<{
    edition: { identifier: string };
    ayahs: AlQuranEditionAyah[];
  }>;
}

function readCachedSurah(surahNumber: number): Ayah[] | null {
  try {
    const raw = localStorage.getItem(`${SURAH_CACHE_PREFIX}${surahNumber}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Ayah[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Ignore storage read errors
  }
  return null;
}

function writeCachedSurah(surahNumber: number, ayahs: Ayah[]): void {
  try {
    localStorage.setItem(`${SURAH_CACHE_PREFIX}${surahNumber}`, JSON.stringify(ayahs));
  } catch {
    // Storage quota exceeded — ignore gracefully
  }
}

export async function fetchSurahContent(surahNumber: number, signal?: AbortSignal): Promise<SurahContent> {
  const inMemory = memorySurahCache.get(surahNumber);
  if (inMemory) {
    return inMemory;
  }

  const cached = readCachedSurah(surahNumber);
  if (cached) {
    const result: SurahContent = { surahNumber, ayahs: cached, source: 'cache' };
    memorySurahCache.set(surahNumber, result);
    return result;
  }

  // If bundled offline copy exists and we are offline, return immediately
  const bundled = BUNDLED_SURAHS[surahNumber];
  if (bundled && typeof navigator !== 'undefined' && !navigator.onLine) {
    return { surahNumber, ayahs: bundled, source: 'bundled' };
  }

  try {
    const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,ar.muyassar`;
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const json = (await response.json()) as AlQuranEditionsResponse;
    if (!json.data || json.data.length === 0) {
      throw new Error('بيانات السورة غير متوفرة');
    }

    const uthmaniEdition = json.data.find((e) => e.edition.identifier === 'quran-uthmani') ?? json.data[0];
    const tafsirEdition = json.data.find((e) => e.edition.identifier === 'ar.muyassar');

    const tafsirMap = new Map<number, string>();
    if (tafsirEdition) {
      for (const tAyah of tafsirEdition.ayahs) {
        tafsirMap.set(tAyah.numberInSurah, tAyah.text);
      }
    }

    const ayahs: Ayah[] = uthmaniEdition.ayahs.map((a) => ({
      number: a.number,
      numberInSurah: a.numberInSurah,
      text: stripBasmalaPrefix(a.text, surahNumber, a.numberInSurah),
      tafsir: tafsirMap.get(a.numberInSurah),
      juz: a.juz,
      page: a.page,
      sajda: Boolean(a.sajda),
    }));

    writeCachedSurah(surahNumber, ayahs);
    const content: SurahContent = { surahNumber, ayahs, source: 'api' };
    memorySurahCache.set(surahNumber, content);
    return content;
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    if (bundled) {
      return { surahNumber, ayahs: bundled, source: 'bundled' };
    }
    throw new Error('تعذر تحميل السورة حاليًا. يرجى التحقق من الاتصال بالإنترنت ثم إعادة المحاولة.');
  }
}

interface AlQuranSingleEditionResponse {
  code: number;
  data?: {
    ayahs?: Array<{
      numberInSurah: number;
      text: string;
    }>;
  };
}

function readCachedTranslation(
  surahNumber: number,
  lang: ActiveTranslationLanguage
): Record<number, string> | null {
  try {
    const raw = localStorage.getItem(`${TRANSLATION_CACHE_PREFIX}${lang}_${surahNumber}`);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<number, string>;
    if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
      return parsed;
    }
  } catch {
    // Ignore storage read errors
  }
  return null;
}

function writeCachedTranslation(
  surahNumber: number,
  lang: ActiveTranslationLanguage,
  map: Record<number, string>
): void {
  try {
    localStorage.setItem(`${TRANSLATION_CACHE_PREFIX}${lang}_${surahNumber}`, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

export async function fetchSurahTranslation(
  surahNumber: number,
  lang: ActiveTranslationLanguage,
  signal?: AbortSignal
): Promise<Record<number, string>> {
  const cacheKey = `${lang}:${surahNumber}`;
  const inMemory = memoryTranslationCache.get(cacheKey);
  if (inMemory) {
    return inMemory;
  }

  const cached = readCachedTranslation(surahNumber, lang);
  if (cached) {
    memoryTranslationCache.set(cacheKey, cached);
    return cached;
  }

  const bundled = BUNDLED_TRANSLATIONS[surahNumber]?.[lang];
  if (bundled && typeof navigator !== 'undefined' && !navigator.onLine) {
    return bundled;
  }

  const edition = TRANSLATION_EDITIONS[lang];

  try {
    const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/${edition.editionId}`;
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const json = (await response.json()) as AlQuranSingleEditionResponse;
    const rawAyahs = json.data?.ayahs;
    if (!rawAyahs || rawAyahs.length === 0) {
      throw new Error('بيانات الترجمة غير متوفرة');
    }

    const map: Record<number, string> = {};
    for (const item of rawAyahs) {
      map[item.numberInSurah] = item.text;
    }

    writeCachedTranslation(surahNumber, lang, map);
    memoryTranslationCache.set(cacheKey, map);
    return map;
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    if (bundled) {
      return bundled;
    }
    throw new Error('تعذر تحميل الترجمة حاليًا. يرجى التحقق من الاتصال ثم إعادة المحاولة.');
  }
}

interface Mp3QuranApiMoshaf {
  id: number;
  name: string;
  server: string;
  surah_total: number;
  surah_list: string;
}

interface Mp3QuranApiReciter {
  id: number;
  name: string;
  letter?: string;
  moshaf: Mp3QuranApiMoshaf[];
}

interface Mp3QuranApiResponse {
  reciters?: Mp3QuranApiReciter[];
}

function parseSurahList(listStr: string): number[] {
  if (!listStr) return [];
  return listStr
    .split(',')
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 114);
}

function mergeRecitersWithFeatured(apiReciters: Reciter[]): Reciter[] {
  const seenNames = new Set<string>();
  const merged: Reciter[] = [];

  for (const featured of FEATURED_RECITERS) {
    seenNames.add(normalizeArabic(featured.name));
    merged.push(featured);
  }

  for (const reciter of apiReciters) {
    const norm = normalizeArabic(reciter.name);
    if (!seenNames.has(norm) && reciter.moshafs.length > 0) {
      seenNames.add(norm);
      merged.push(reciter);
    }
  }

  return merged;
}

export async function fetchAllReciters(signal?: AbortSignal): Promise<Reciter[]> {
  try {
    const cachedRaw = localStorage.getItem(RECITERS_CACHE_KEY);
    if (cachedRaw) {
      const parsed = JSON.parse(cachedRaw) as { timestamp: number; reciters: Reciter[] };
      if (
        parsed &&
        Array.isArray(parsed.reciters) &&
        parsed.reciters.length > FEATURED_RECITERS.length &&
        Date.now() - parsed.timestamp < RECITERS_CACHE_TTL_MS
      ) {
        return parsed.reciters;
      }
    }
  } catch {
    // Ignore cache read error
  }

  try {
    const response = await fetch('https://www.mp3quran.net/api/v3/reciters?language=ar', { signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const json = (await response.json()) as Mp3QuranApiResponse;
    const rawList = json.reciters ?? [];

    const mapped: Reciter[] = rawList
      .map((r) => {
        const moshafs: ReciterMoshaf[] = (r.moshaf ?? [])
          .filter((m) => Boolean(m.server) && m.surah_total > 0)
          .map((m) => ({
            id: m.id,
            name: m.name.trim(),
            server: m.server.endsWith('/') ? m.server : `${m.server}/`,
            surahTotal: m.surah_total,
            surahList: parseSurahList(m.surah_list),
          }));

        return {
          id: `mp3q-${r.id}`,
          name: r.name.trim(),
          letter: r.letter,
          moshafs,
        };
      })
      .filter((r) => r.moshafs.length > 0);

    const merged = mergeRecitersWithFeatured(mapped);

    try {
      localStorage.setItem(
        RECITERS_CACHE_KEY,
        JSON.stringify({ timestamp: Date.now(), reciters: merged })
      );
    } catch {
      // Ignore quota errors
    }

    return merged;
  } catch {
    return FEATURED_RECITERS;
  }
}

interface AlQuranSearchMatch {
  surah: { number: number; name: string };
  numberInSurah: number;
  text: string;
}

interface AlQuranSearchResponse {
  code: number;
  data?: {
    count: number;
    matches: AlQuranSearchMatch[];
  };
}

export async function searchQuranVerses(query: string, signal?: AbortSignal): Promise<VerseSearchResult[]> {
  const clean = query.trim();
  if (clean.length < 2) return [];

  const normQuery = normalizeArabic(clean);
  const localMatches: VerseSearchResult[] = [];
  const seenKeys = new Set<string>();

  // First check bundled + cached Surahs for instant local hits
  for (const surah of SURAHS) {
    const ayahs = memorySurahCache.get(surah.number)?.ayahs ?? BUNDLED_SURAHS[surah.number];
    if (!ayahs) continue;
    for (const ayah of ayahs) {
      if (normalizeArabic(ayah.text).includes(normQuery)) {
        const key = `${surah.number}:${ayah.numberInSurah}`;
        if (!seenKeys.has(key)) {
          seenKeys.add(key);
          localMatches.push({
            surahNumber: surah.number,
            surahName: surah.shortName,
            ayahNumber: ayah.numberInSurah,
            text: ayah.text,
          });
        }
      }
    }
  }

  try {
    const url = `https://api.alquran.cloud/v1/search/${encodeURIComponent(clean)}/all/quran-simple-clean`;
    const response = await fetch(url, { signal });
    if (!response.ok) {
      return localMatches;
    }
    const json = (await response.json()) as AlQuranSearchResponse;
    const matches = json.data?.matches ?? [];
    const results: VerseSearchResult[] = [...localMatches];

    for (const m of matches.slice(0, 40)) {
      const key = `${m.surah.number}:${m.numberInSurah}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);
      const meta = SURAHS.find((s) => s.number === m.surah.number);
      results.push({
        surahNumber: m.surah.number,
        surahName: meta?.shortName ?? m.surah.name,
        ayahNumber: m.numberInSurah,
        text: m.text,
      });
    }
    return results;
  } catch {
    return localMatches;
  }
}
