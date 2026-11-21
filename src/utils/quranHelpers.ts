import { SURAHS, TOTAL_QURAN_AYAHS } from '../data/surahs';
import type { Reciter, RevelationType, SurahMeta } from '../types/quran';

const ARABIC_DIACRITICS_REGEX =
  /[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E8\u06EA-\u06ED\u0640]/g;

const ARABIC_DIGITS = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

/**
 * Strips Arabic diacritics (tashkeel), tatweel, and normalizes alef/yaa/taa marbuta
 * so Arabic search works intuitively regardless of hamza or diacritics.
 */
export function normalizeArabic(text: string): string {
  return text
    .replace(ARABIC_DIACRITICS_REGEX, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    .trim()
    .toLowerCase();
}

/**
 * Converts Western digits to Eastern Arabic numerals (e.g. 114 -> ١١٤).
 */
export function toArabicDigits(value: number | string): string {
  return String(value).replace(/\d/g, (digit) => ARABIC_DIGITS[Number(digit)] ?? digit);
}

/**
 * Formats an Arabic Ayah count with proper grammar (3-10 -> آيات, 11+ -> آية).
 */
export function formatAyahCount(count: number): string {
  const num = toArabicDigits(count);
  if (count >= 3 && count <= 10) {
    return `${num} آيات`;
  }
  return `${num} آية`;
}

/**
 * Pads a Surah number to 3 digits for MP3Quran filenames (1 -> "001", 114 -> "114").
 */
export function formatSurahNumber(surahNumber: number): string {
  const clamped = Math.max(1, Math.min(114, Math.floor(surahNumber)));
  return String(clamped).padStart(3, '0');
}

/**
 * Builds a clean MP3 URL for a full Surah recitation from a reciter's server URL.
 */
export function buildSurahAudioUrl(server: string, surahNumber: number): string {
  const cleanServer = server.endsWith('/') ? server : `${server}/`;
  return `${cleanServer}${formatSurahNumber(surahNumber)}.mp3`;
}

/**
 * Builds a clean MP3 URL for a single Ayah using islamic.network CDN.
 */
export function buildAyahAudioUrl(editionId: string, globalAyahNumber: number, bitrate = 128): string {
  return `https://cdn.islamic.network/quran/audio/${bitrate}/${editionId}/${globalAyahNumber}.mp3`;
}

/**
 * Calculates the global Quran Ayah number (1..6236) from Surah number and Ayah-in-Surah.
 */
export function getGlobalAyahNumber(surahNumber: number, ayahInSurah: number): number {
  let offset = 0;
  for (const surah of SURAHS) {
    if (surah.number === surahNumber) {
      return offset + ayahInSurah;
    }
    offset += surah.ayahCount;
  }
  return ayahInSurah;
}

/**
 * Strips the leading Basmala from Ayah 1 of Surahs other than Al-Fatiha (1) and At-Tawbah (9),
 * because api.alquran.cloud prepends the Basmala inside Ayah 1 text while our Mushaf displays
 * an ornate Basmala header above Ayah 1.
 */
export function stripBasmalaPrefix(text: string, surahNumber: number, ayahInSurah: number): string {
  if (surahNumber === 1 || surahNumber === 9 || ayahInSurah !== 1) {
    return text.trim();
  }
  const trimmed = text.trim();
  const normalized = normalizeArabic(trimmed);
  const basmalaNorm = 'بسم الله الرحمن الرحيم';
  if (!normalized.startsWith(basmalaNorm)) {
    return trimmed;
  }
  // Remove the first 4 whitespace-separated tokens (بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ)
  const parts = trimmed.split(/\s+/);
  if (parts.length > 4) {
    return parts.slice(4).join(' ').trim();
  }
  return trimmed;
}

/**
 * Filters Surahs by Arabic/English name or Surah number and optional revelation type.
 */
export function filterSurahs(
  surahs: SurahMeta[],
  query: string,
  revelationFilter: 'all' | RevelationType = 'all'
): SurahMeta[] {
  const normQuery = normalizeArabic(query);
  return surahs.filter((surah) => {
    if (revelationFilter !== 'all' && surah.revelationType !== revelationFilter) {
      return false;
    }
    if (!normQuery) return true;
    const normShort = normalizeArabic(surah.shortName);
    const normFull = normalizeArabic(surah.name);
    const normEng = surah.englishName.toLowerCase();
    const numStr = String(surah.number);
    const arNumStr = toArabicDigits(surah.number);
    return (
      normShort.includes(normQuery) ||
      normFull.includes(normQuery) ||
      normEng.includes(normQuery) ||
      numStr === normQuery ||
      arNumStr === query.trim()
    );
  });
}

export type RiwayaFilter = 'all' | 'hafs' | 'warsh' | 'mojawwad' | 'qalon' | 'favorites';

/**
 * Filters the reciters catalog by Arabic name, Riwaya type, or favorites.
 */
export function filterReciters(
  reciters: Reciter[],
  query: string,
  riwayaFilter: RiwayaFilter = 'all',
  favoriteIds: string[] = []
): Reciter[] {
  const normQuery = normalizeArabic(query);
  const favSet = new Set(favoriteIds);

  return reciters.filter((reciter) => {
    if (riwayaFilter === 'favorites' && !favSet.has(reciter.id)) {
      return false;
    }
    if (riwayaFilter === 'hafs') {
      const hasHafs = reciter.moshafs.some((m) => normalizeArabic(m.name).includes('حفص'));
      if (!hasHafs) return false;
    } else if (riwayaFilter === 'warsh') {
      const hasWarsh = reciter.moshafs.some((m) => normalizeArabic(m.name).includes('ورش'));
      if (!hasWarsh) return false;
    } else if (riwayaFilter === 'mojawwad') {
      const hasMojawwad = reciter.moshafs.some((m) => normalizeArabic(m.name).includes('مجود'));
      if (!hasMojawwad) return false;
    } else if (riwayaFilter === 'qalon') {
      const hasQalon = reciter.moshafs.some((m) => normalizeArabic(m.name).includes('قالون'));
      if (!hasQalon) return false;
    }

    if (!normQuery) return true;
    const normName = normalizeArabic(reciter.name);
    const normCountry = reciter.country ? normalizeArabic(reciter.country) : '';
    const normMoshafs = reciter.moshafs.map((m) => normalizeArabic(m.name)).join(' ');
    return normName.includes(normQuery) || normCountry.includes(normQuery) || normMoshafs.includes(normQuery);
  });
}

/**
 * Formats seconds into mm:ss or hh:mm:ss cleanly.
 */
export function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (hrs > 0) {
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  }
  return `${pad(mins)}:${pad(secs)}`;
}

/**
 * Calculates Khatmah reading progress based on completed Surah numbers.
 */
export function calculateKhatmahProgress(completedSurahNumbers: number[]): {
  completedSurahs: number;
  completedAyahs: number;
  totalAyahs: number;
  percentage: number;
} {
  const unique = new Set(completedSurahNumbers.filter((n) => n >= 1 && n <= 114));
  let completedAyahs = 0;
  for (const surah of SURAHS) {
    if (unique.has(surah.number)) {
      completedAyahs += surah.ayahCount;
    }
  }
  const percentage = Math.round((completedAyahs / TOTAL_QURAN_AYAHS) * 1000) / 10;
  return {
    completedSurahs: unique.size,
    completedAyahs,
    totalAyahs: TOTAL_QURAN_AYAHS,
    percentage,
  };
}
