import test from 'node:test';
import assert from 'node:assert/strict';
import { SURAHS, TOTAL_QURAN_AYAHS } from '../data/surahs';
import { FEATURED_RECITERS } from '../data/reciters';
import {
  buildAyahAudioUrl,
  buildSurahAudioUrl,
  calculateKhatmahProgress,
  filterReciters,
  filterSurahs,
  formatAyahCount,
  formatDuration,
  formatSurahNumber,
  getGlobalAyahNumber,
  normalizeArabic,
  stripBasmalaPrefix,
  toArabicDigits,
} from './quranHelpers';

test('all 114 surahs sum to exactly 6236 ayahs', () => {
  assert.equal(SURAHS.length, 114);
  const total = SURAHS.reduce((sum, s) => sum + s.ayahCount, 0);
  assert.equal(total, TOTAL_QURAN_AYAHS);
  assert.equal(total, 6236);
});

test('getGlobalAyahNumber computes exact boundaries across the Mushaf', () => {
  assert.equal(getGlobalAyahNumber(1, 1), 1);
  assert.equal(getGlobalAyahNumber(1, 7), 7);
  assert.equal(getGlobalAyahNumber(2, 1), 8);
  assert.equal(getGlobalAyahNumber(112, 1), 6222);
  assert.equal(getGlobalAyahNumber(114, 6), 6236);
});

test('normalizeArabic strips diacritics and normalizes hamza/taa/yaa', () => {
  assert.equal(normalizeArabic('سُورَةُ ٱلْفَاتِحَةِ'), 'سوره الفاتحه');
  assert.equal(normalizeArabic('الإخلاص'), normalizeArabic('الاخلاص'));
  assert.equal(normalizeArabic('أحمد العجمي'), normalizeArabic('احمد العجمى'));
});

test('toArabicDigits and formatAyahCount format Arabic numerals and grammar accurately', () => {
  assert.equal(toArabicDigits(1), '١');
  assert.equal(toArabicDigits(114), '١١٤');
  assert.equal(toArabicDigits(6236), '٦٢٣٦');
  assert.equal(formatAyahCount(7), '٧ آيات');
  assert.equal(formatAyahCount(3), '٣ آيات');
  assert.equal(formatAyahCount(110), '١١٠ آية');
  assert.equal(formatAyahCount(286), '٢٨٦ آية');
});

test('formatSurahNumber and buildSurahAudioUrl produce valid MP3Quran URLs', () => {
  assert.equal(formatSurahNumber(1), '001');
  assert.equal(formatSurahNumber(36), '036');
  assert.equal(formatSurahNumber(114), '114');
  assert.equal(
    buildSurahAudioUrl('https://server8.mp3quran.net/afs', 18),
    'https://server8.mp3quran.net/afs/018.mp3'
  );
  assert.equal(
    buildSurahAudioUrl('https://server8.mp3quran.net/afs/', 1),
    'https://server8.mp3quran.net/afs/001.mp3'
  );
  assert.equal(
    buildAyahAudioUrl('ar.alafasy', 6222, 128),
    'https://cdn.islamic.network/quran/audio/128/ar.alafasy/6222.mp3'
  );
});

test('stripBasmalaPrefix keeps Al-Fatiha ayah 1 and strips redundant prefix in other surahs', () => {
  const fatiha = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ';
  assert.equal(stripBasmalaPrefix(fatiha, 1, 1), fatiha);

  const ikhlasWithBasmala = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ قُلْ هُوَ ٱللَّهُ أَحَدٌ';
  assert.equal(stripBasmalaPrefix(ikhlasWithBasmala, 112, 1), 'قُلْ هُوَ ٱللَّهُ أَحَدٌ');

  const normalAyah = 'ٱللَّهُ ٱلصَّمَدُ';
  assert.equal(stripBasmalaPrefix(normalAyah, 112, 2), normalAyah);
});

test('filterSurahs finds surahs by Arabic query without hamza, number, or revelation type', () => {
  const byArabic = filterSurahs(SURAHS, 'الاخلاص');
  assert.equal(byArabic.length, 1);
  assert.equal(byArabic[0].number, 112);

  const byNum = filterSurahs(SURAHS, '36');
  assert.equal(byNum[0].shortName, 'يس');

  const medinanOnly = filterSurahs(SURAHS, '', 'Medinan');
  assert.ok(medinanOnly.every((s) => s.revelationType === 'Medinan'));
  assert.ok(medinanOnly.length > 20 && medinanOnly.length < 40);
});

test('filterReciters filters by query, riwaya, and favorites', () => {
  const warshReciters = filterReciters(FEATURED_RECITERS, '', 'warsh');
  assert.ok(warshReciters.length >= 4);
  assert.ok(warshReciters.some((r) => r.name.includes('الكوشي')));

  const afasy = filterReciters(FEATURED_RECITERS, 'العفاسي', 'all');
  assert.equal(afasy.length, 1);
  assert.equal(afasy[0].id, 'featured-afs');

  const favs = filterReciters(FEATURED_RECITERS, '', 'favorites', ['featured-husr']);
  assert.equal(favs.length, 1);
  assert.equal(favs[0].id, 'featured-husr');
});

test('formatDuration and calculateKhatmahProgress compute accurate outputs', () => {
  assert.equal(formatDuration(0), '00:00');
  assert.equal(formatDuration(65), '01:05');
  assert.equal(formatDuration(3661), '01:01:01');

  const progress = calculateKhatmahProgress([1, 112, 112]);
  assert.equal(progress.completedSurahs, 2);
  assert.equal(progress.completedAyahs, 11);
  assert.equal(progress.percentage, 0.2);

  const full = calculateKhatmahProgress(SURAHS.map((s) => s.number));
  assert.equal(full.completedAyahs, 6236);
  assert.equal(full.percentage, 100);
});
